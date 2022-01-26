const message = require("../../../utils/messages");
const responseCode = require("../../../utils/responseCode");
const utils = require("../../../utils/common");
const {
  USER_ROLE,
  PAYMENT_STATUS,
  APPOINTMENT_TYPE,
  APPOINTMENT_PREFIX,
  TIMEZONE,
  EMAIL_SUBJECT,
  NOTIFICATION_TITLE,
} = require("../../../config/authConstant");
const appointmentConstants = require("../.././../config/constant/appointment");
const db = require("../../../config/db");
const BookedSlot = require("../../../model/bookedSlot")(db);
const Appointment = require("../../../model/appointment")(db);
const AppointmentFollowUp = require("../../../model/appointmentFollowUp")(db);
const AvailableSlot = require("../../../model/availableSlot")(db);
const Order = require("../../../model/order")(db);
const Specialisation = require("../../../model/specialisation")(db);
const User = require("../../../model/user")(db);
const Role = require("../../../model/role")(db);
const Master = require("../../../model/master")(db);
const stripeHandler = require("../../../services/stripe/stripeHandler");
const ObjectId = require("mongodb").ObjectId;
const ejs = require("ejs");
const path = require("path");
let moment = require("moment");
// moment.tz.setDefault(process.env.UTC_TIMEZONE);
const { date } = require("joi");
const { getTimezone } = require("countries-and-timezones");
const {
  sendOTP,
  resendOTP,
  verifyOTP,
  sendMessage,
  SMSQueue,
} = require("../../../config/sms");
const {
  sendSESEmail,
  emailQueue,
} = require("../../../services/email/emailService");
const { MESSAGE, NOTIFICATION_MESSAGE } = require("../../../config/message");
const notificationService = require("../../../services/notification");

const createSlot = async (patientId, availableSlotId) => {
  try {
    let appointmentData = await AvailableSlot.findOne({
      _id: availableSlotId,
    });
    let data = {
      startTime: appointmentData.startTime,
      endTime: appointmentData.endTime,
      duration: appointmentData.duration,
      providerId: appointmentData.providerId,
      patientId: patientId,
      slot: appointmentData,
      slotId: availableSlotId,
    };
    let result = await BookedSlot.create(data);
    return result;
  } catch (error) {
    console.error("Error - createSlot", error);
    throw new Error(error);
  }
};

const convertDateToLocalDate = (offset, startTime, endTime) => {
  try {
    if (offset >= 0) {
      startTime = moment(startTime).add(offset, "m").toDate();
      endTime = moment(endTime).add(offset, "m").toDate();
    } else {
      startTime = moment(startTime).subtract(offset, "m").toDate();
      endTime = moment(endTime).subtract(offset, "m").toDate();
    }
    return { startTime, endTime };
  } catch (error) {
    console.error("Error - convertDateToLocalDate", error);
    throw new Error(error);
  }
};

function makeAppointmentController({ appointmentService, makeAppointment }) {
  const addAppointment = async ({ req }) => {
    try {
      let data = req.body;
      let masterData = await Master.findOne({ code: APPOINTMENT_TYPE.NEW });
      masterAppointmentType = masterData._id.toString();
      data.appointmentType = masterAppointmentType;
      data.APID = APPOINTMENT_PREFIX + utils.randomNumber(7);
      const patientData = await User.findOne({ _id: data.patientId });
      data.patientName = patientData.name;
      if (data.specialisationId) {
        const specialisationData = await Specialisation.findOne({
          _id: data.specialisationId,
        });
        data.specialisationName = specialisationData.name;
      }
      const originalData = data;

      const appointment = makeAppointment(
        originalData,
        "insertAppointmentValidator"
      );
      let createdAppointment = await appointmentService.createDocument(
        appointment
      );

      return message.successResponse(
        { "Content-Type": "application/json" },
        responseCode.success,
        createdAppointment,
        req.i18n.t("appointment.create")
      );
    } catch (error) {
      console.error("Error - addAppointment", error);
      if (error.name === "ValidationError") {
        return message.inValidParam(
          { "Content-Type": "application/json" },
          responseCode.validationError,
          error.message
        );
      }
      return message.failureResponse(
        { "Content-Type": "application/json" },
        responseCode.internalServerError,
        error.message
      );
    }
  };

  const bookFollowUpAppointment = async ({ req }) => {
    try {
      let data = req.body;
      let currentTime = moment();
      currentTime = new Date(currentTime);
      let aggregate = [
        {
          $match: {
            $and: [
              { parentAppointmentId: ObjectId(data.parentAppointmentId) },
              { isAppointmentCompleted: false },
              { isCancelled: false },
              { availableSlotId: { $exists: true } },
            ],
          },
        },
        {
          $lookup: {
            from: "availableSlot",
            localField: "availableSlotId",
            foreignField: "_id",
            as: "availableSlot",
          },
        },
        {
          $unwind: {
            path: "$availableSlot",
          },
        },
        { $addFields: { endTime: "$availableSlot.endTime" } },
        {
          $match: {
            endTime: { $gte: currentTime },
          },
        },
      ];
      const checkAppointment = await Appointment.aggregate(aggregate);
      if (checkAppointment.length !== 0) {
        throw new Error(req.i18n.t("appointment.follow_up_exist"));
      }
      // const checkFollowUp = await AppointmentFollowUp.findOne({appointmentId: data.appointmentId});
      // if(checkFollowUp.isLinkUsed == true){
      //   throw new Error("Follow up is already booked");
      // }
      let masterData = await Master.findOne({
        code: APPOINTMENT_TYPE.FOLLOW_UP,
      });
      masterAppointmentType = masterData._id.toString();
      data.appointmentType = masterAppointmentType;
      data.isFollowUp = true;
      data.APID = APPOINTMENT_PREFIX + utils.randomNumber(7);
      const patientData = await User.findOne({ _id: data.patientId });
      data.patientName = patientData.name;
      if (data.specialisationId) {
        const specialisationData = await Specialisation.findOne({
          _id: data.specialisationId,
        });
        data.specialisationName = specialisationData.name;
      }

      const originalData = data;

      const appointment = makeAppointment(
        originalData,
        "insertAppointmentValidator"
      );
      let createdAppointment = await appointmentService.createDocument(
        appointment
      );

      return message.successResponse(
        { "Content-Type": "application/json" },
        responseCode.success,
        createdAppointment,
        req.i18n.t("appointment.follow_up_create")
      );
    } catch (error) {
      console.error("Error - bookFollowUpAppointment", error);
      if (error.name === "ValidationError") {
        return message.inValidParam(
          { "Content-Type": "application/json" },
          responseCode.validationError,
          error.message
        );
      }
      return message.failureResponse(
        { "Content-Type": "application/json" },
        responseCode.internalServerError,
        error.message
      );
    }
  };

  const bookAppointment = async ({ req }) => {
    try {
      const id = req.pathParams.id;
      const i18n = req.i18n;
      let updateAppointmentStatus = {};
      let getAppointment = await Appointment.findOne({ _id: id }).populate([
        "providerId",
        "addedBy",
        "patientId",
        "orderId",
        "availableSlotId",
      ]);
      if (getAppointment.availableSlotId === undefined) {
        throw new Error(i18n.t("appointment.select_timeslot"));
      }
      createBookedSlot = await createSlot(
        getAppointment.patientId,
        getAppointment.availableSlotId
      );
      slotId = createBookedSlot._id;
      let availableSlotData = await AvailableSlot.findOne({
        _id: getAppointment.availableSlotId,
      });
      let today = moment().format("YYYY-MM-DD");
      if (availableSlotData.startTime < today) {
        throw new Error(i18n.t("appointment.select_valid_timeslot"));
      }
      if (
        getAppointment.orderId !== undefined ||
        getAppointment.orderId !== null
      ) {
        let masterData = await Master.findOne({ code: PAYMENT_STATUS.SUCCESS });
        let orderStatus = getAppointment.orderId.status.toString();
        let masterDataStatus = masterData._id.toString();
        if (orderStatus == masterDataStatus) {
          updateAppointmentStatus = await Appointment.findOneAndUpdate(
            { _id: getAppointment._id },
            { $set: { isBooked: true, isPaid: true, slotId: slotId } },
            { new: true }
          );
        } else {
          updateAppointmentStatus = await Appointment.findOneAndUpdate(
            { _id: getAppointment._id },
            { $set: { isBooked: true, slotId: slotId } },
            { new: true }
          );
        }
      } else {
        updateAppointmentStatus = await Appointment.findOneAndUpdate(
          { _id: getAppointment._id },
          { $set: { isBooked: true, slotId: slotId } },
          { new: true }
        );
      }
      if (updateAppointmentStatus) {
        await AvailableSlot.findOneAndUpdate(
          { _id: getAppointment.availableSlotId },
          { isActive: false }
        );
        if (
          getAppointment.isFollowUp &&
          getAppointment.parentAppointmentId != undefined
        ) {
          await Appointment.findOneAndUpdate(
            { _id: getAppointment.parentAppointmentId },
            { followUpBooked: true }
          );
        }
      }

      let emailHTML = await ejs.renderFile(
        path.join(__dirname, "../../../views/emailTemplate/email.ejs"),
        {
          user_name: getAppointment.patientId.name,
          content: NOTIFICATION_MESSAGE.APPOINTMENT_BOOKED_PATIENT(
            getAppointment.providerId.name
          ),
        }
      );
      emailQueue(
        getAppointment.patientId.email,
        EMAIL_SUBJECT.APPOINTMENT_BOOKED,
        emailHTML
      );
      let date = moment(getAppointment.availableSlotId.startTime).format(
        "YYYY-MM-DD"
      );
      const timezoneOffset = req.headers.timezone
        ? req.headers.timezone
        : TIMEZONE;
      let startTime = moment(getAppointment.availableSlotId.startTime)
        .tz(timezoneOffset)
        .format("HH:mm");
      emailHTML = await ejs.renderFile(
        path.join(__dirname, "../../../views/emailTemplate/email.ejs"),
        {
          user_name: getAppointment.providerId.name,
          content: NOTIFICATION_MESSAGE.APPOINTMENT_BOOKED_PHYSICIAN(
            getAppointment.patientId.name,
            date,
            startTime
          ),
        }
      );
      emailQueue(
        getAppointment.providerId.email,
        EMAIL_SUBJECT.APPOINTMENT_BOOKED,
        emailHTML
      );
      if (getAppointment.isFollowUp) {
        await notificationService.create(
          getAppointment.providerId,
          NOTIFICATION_TITLE.FOLLOW_UP_APPOINTMENT_BOOK,
          NOTIFICATION_MESSAGE.FOLLOW_UP_APPOINTMENT_BOOK(
            getAppointment.patientId.name,
            getAppointment.APID
          )
        );
      }
      await notificationService.create(
        getAppointment.providerId,
        NOTIFICATION_TITLE.APPOINTMENT_BOOK,
        NOTIFICATION_MESSAGE.APPOINTMENT_BOOKED_PHYSICIAN(
          getAppointment.patientId.name,
          date,
          startTime
        )
      );
      return message.successResponse(
        { "Content-Type": "application/json" },
        responseCode.success,
        updateAppointmentStatus,
        i18n.t("appointment.book")
      );
    } catch (error) {
      console.error("Error - bookAppointment", error);
      if (error.name === "ValidationError") {
        return message.inValidParam(
          { "Content-Type": "application/json" },
          responseCode.validationError,
          error.message
        );
      }
      return message.failureResponse(
        { "Content-Type": "application/json" },
        responseCode.internalServerError,
        error.message
      );
    }
  };

  const updateAppointment = async (data, id, i18n) => {
    try {
      if (id && data) {
        if (data.availableSlotId !== undefined) {
          let availableSlotData = await AvailableSlot.findOne({
            _id: data.availableSlotId,
          });
          if (availableSlotData.isActive === false) {
            throw new Error(i18n.t("appointment.slot_already_booked"));
          }
        }
        if (data.isRescheduled === true) {
          data.isInterrupted = false;
          data.isAppointmentCompleted = false;
          data.isAppointmentStarted = false;
          const appointmentData = await Appointment.findById(id);
          if (appointmentData.isRescheduled === true) {
            throw new Error(i18n.t("appointment.reschedule_error"));
          }
        }
        if (data.providerId) {
          const providerData = await User.findOne({ _id: data.providerId });
          data.providerName = providerData.name;
        }
        const appointment = makeAppointment(data, "updateAppointmentValidator");
        const filterData = removeEmpty(appointment);
        let updatedAppointment = await Appointment.findOneAndUpdate(
          { _id: id },
          filterData,
          { new: true }
        ).populate(["patientId", "providerId"]);
        if (data.isRescheduled != undefined && data.isRescheduled === true) {
          await AvailableSlot.findOneAndUpdate(
            { _id: data.availableSlotId },
            { isActive: false }
          );
          await notificationService.create(
            updatedAppointment.providerId,
            NOTIFICATION_TITLE.RESCHEDULE_APPOINTMENT,
            NOTIFICATION_MESSAGE.RESCHEDULE_APPOINTMENT_PHYSICIAN(
              updatedAppointment.patientId.name,
              updatedAppointment.APID
            )
          );
          await notificationService.create(
            updatedAppointment.patientId,
            NOTIFICATION_TITLE.RESCHEDULE_APPOINTMENT,
            NOTIFICATION_MESSAGE.RESCHEDULE_APPOINTMENT_PATIENT(
              updatedAppointment.providerId.name,
              updatedAppointment.APID
            )
          );
        }
        return message.successResponse(
          { "Content-Type": "application/json" },
          responseCode.success,
          updatedAppointment,
          i18n.t("appointment.update")
        );
      }
      return message.badRequest(
        { "Content-Type": "application/json" },
        responseCode.badRequest,
        {},
        i18n.t("response_message.badRequest")
      );
    } catch (error) {
      console.error("Error - updateAppointment", error);
      if (error.name === "ValidationError") {
        return message.inValidParam(
          { "Content-Type": "application/json" },
          responseCode.validationError,
          error.message
        );
      }
      return message.failureResponse(
        { "Content-Type": "application/json" },
        responseCode.internalServerError,
        error.message
      );
    }
  };

  const findAllAppointment = async ({ req }) => {
    try {
      let data = req.body;
      const timezoneOffset = req.headers.timezone
        ? req.headers.timezone
        : TIMEZONE;
      let offset = getTimezone(timezoneOffset).utcOffsetStr;
      offset = moment().utcOffset(offset).utcOffset();
      let options = {},
        query = {},
        result;
      //IF COUNT ENABLED
      if (data.isCountOnly) {
        if (data.query !== undefined) {
          query = { ...data.query };
        }
        result = await appointmentService.countDocument(query);
        if (result) {
          result = { totalRecords: result };
        } else {
          return message.recordNotFound(
            { "Content-Type": "application/json" },
            responseCode.success,
            []
          );
        }
      } else {
        //IF OPTIONS AND QUERY DEFINED
        if (data.options !== undefined) {
          options = { ...data.options };
        }

        if (data.query !== undefined) {
          query = { ...data.query };
        }
        // console.log(query);
        //QUERY
        let status = [
          appointmentConstants.UPCOMING_APPOINTMENTS,
          appointmentConstants.COMPLETED_APPOINTMENTS,
          appointmentConstants.FOLLOWUP_APPOINTMENTS,
          appointmentConstants.CANCELLED_APPOINTMENTS,
        ];
        let queryRunner = [];
        if (
          status.includes(query.status) ||
          query.date != undefined ||
          query.fromDate != undefined ||
          query.toDate != undefined
        ) {
          let currentTime = moment().toDate();
          //CHECK FOR PHYSICIAN OR PARIENT ID
          if (query.patientId != undefined) {
            queryRunner.push({
              $match: {
                patientId: ObjectId(query.patientId),
              },
            });
          } else if (query.providerId != undefined) {
            queryRunner.push({
              $match: { providerId: ObjectId(query.providerId) },
            });
          }

          //POPULATE THE AVAILABLE SLOTS
          queryRunner.push(
            { $sort: { _id: 1 } },
            {
              $lookup: {
                from: "availableSlot",
                localField: "availableSlotId",
                foreignField: "_id",
                as: "availableSlot",
              },
            }
          );

          //UNWIND AVAILABLE SLOT
          queryRunner.push({ $unwind: { path: "$availableSlot" } });
          if (query.status != undefined || query.status != null) {
            if (query.status === appointmentConstants.UPCOMING_APPOINTMENTS) {
              queryRunner.push(
                { $addFields: { startTime: "$availableSlot.startTime" } },
                {
                  $match: {
                    $and: [
                      { startTime: { $gte: currentTime } },
                      { isAppointmentCompleted: false },
                      { isCancelled: false },
                      { isInterrupted: false },
                      { noShow: false },
                    ],
                  },
                }
              );
            } else if (
              query.status === appointmentConstants.COMPLETED_APPOINTMENTS
            ) {
              queryRunner.push(
                { $addFields: { endTime: "$availableSlot.endTime" } },
                {
                  $match: {
                    $or: [
                      { endTime: { $lte: currentTime } },
                      { isAppointmentCompleted: true },
                      // isBooked: true,
                    ],
                  },
                }
              );
            } else if (
              query.status === appointmentConstants.FOLLOWUP_APPOINTMENTS
            ) {
              queryRunner.push(
                { $addFields: { startTime: "$availableSlot.startTime" } },
                { $match: { isFollowUp: true } }
              );
            } else if (
              query.status === appointmentConstants.CANCELLED_APPOINTMENTS
            ) {
              queryRunner.push(
                { $addFields: { startTime: "$availableSlot.startTime" } },
                { $match: { isCancelled: true } }
              );
            }
          }

          if (
            query.specialisationId != undefined ||
            query.specialisationId != null
          ) {
            queryRunner.push(
              {
                $addFields: {
                  specialisationId: { $toString: "$specialisationId" },
                },
              },
              {
                $match: {
                  specialisationId: {
                    $in: query.specialisationId,
                  },
                },
              }
            );
          }

          if (
            query.fromDate != undefined ||
            query.fromDate != null ||
            query.toDate != undefined ||
            query.toDate != null
          ) {
            query.fromDate = new Date(query.fromDate);
            query.toDate = new Date(query.toDate);
            queryRunner.push(
              { $addFields: { startTime: "$availableSlot.startTime" } },
              {
                $match: {
                  startTime: {
                    $gte: query.fromDate,
                    $lte: query.toDate,
                  },
                },
              }
            );
          }

          if (query.date != undefined || query.date != null) {
            query.fromDate = new Date(query.date);
            query.toDate = new Date(query.date);
            query.toDate.setDate(query.toDate.getDate() + 1);
            queryRunner.push(
              { $addFields: { startTime: "$availableSlot.startTime" } },
              {
                $match: {
                  startTime: {
                    $gte: query.fromDate,
                    $lte: query.toDate,
                  },
                },
              }
            );
          }

          //PROJECT TO GET ONLY APPOINTMENT IDS
          queryRunner.push({ $project: { _id: 1 } });
          // console.log(queryRunner);
          let runnerResult = await Appointment.aggregate(queryRunner);
          let appointmentIds = runnerResult.map((element) => {
            return element._id;
          });
          let nQuery = { _id: { $in: appointmentIds } };
          if (query["$and"] != undefined) {
            nQuery["$and"] = query["$and"];
          }
          if (query["$or"] != undefined) {
            nQuery["$or"] = query["$or"];
          }
          result = await appointmentService.getAllDocuments(nQuery, options);
          if (result.data != undefined) {
            result.data = result.data.filter(function (error, i) {
              if (
                result.data[i].availableSlotId != undefined ||
                result.data[i].availableSlotId != null
              ) {
                if (offset !== 0) {
                  let convertedDate = convertDateToLocalDate(
                    offset,
                    result.data[i].availableSlotId.startTime,
                    result.data[i].availableSlotId.endTime
                  );
                  result.data[i].availableSlotId.startTime =
                    convertedDate.startTime;
                  result.data[i].availableSlotId.endTime =
                    convertedDate.endTime;
                }
                return result.data[i];
              }
            });
          } else if (result.docs != undefined) {
            result.docs = result.docs.filter(function (error, i) {
              if (
                result.docs[i].availableSlotId != undefined ||
                result.docs[i].availableSlotId != null
              ) {
                if (offset !== 0) {
                  let convertedDate = convertDateToLocalDate(
                    offset,
                    result.docs[i].availableSlotId.startTime,
                    result.docs[i].availableSlotId.endTime
                  );
                  result.docs[i].availableSlotId.startTime =
                    convertedDate.startTime;
                  result.docs[i].availableSlotId.endTime =
                    convertedDate.endTime;
                }
                return result.docs[i];
              }
            });
          }
        } else {
          query.availableSlotId = { $exists: true };
          result = await appointmentService.getAllDocuments(query, options);
          if (result.data != undefined) {
            result.data = result.data.filter(function (error, i) {
              if (
                result.data[i].availableSlotId != undefined ||
                result.data[i].availableSlotId != null
              ) {
                if (offset !== 0) {
                  let convertedDate = convertDateToLocalDate(
                    offset,
                    result.data[i].availableSlotId.startTime,
                    result.data[i].availableSlotId.endTime
                  );
                  result.data[i].availableSlotId.startTime =
                    convertedDate.startTime;
                  result.data[i].availableSlotId.endTime =
                    convertedDate.endTime;
                }
                if (
                  result.data[i].availableSlotId.startTime > Date.now() &&
                  result.data[i].isCancelled === false &&
                  result.data[i].isAppointmentCompleted === false &&
                  result.data[i].isInterrupted === false
                ) {
                  result.data[i].appointmentStatus = "upcoming";
                } else if (result.data[i].isCancelled === true) {
                  result.data[i].appointmentStatus = "cancelled";
                } else if (result.data[i].isInterrupted === true) {
                  result.data[i].appointmentStatus = "interrupted";
                } else {
                  result.data[i].appointmentStatus = "completed";
                }
                return result.data[i];
              }
            });
          } else if (result.docs != undefined) {
            result.docs = result.docs.filter(function (error, i) {
              if (
                result.docs[i].availableSlotId != undefined ||
                result.docs[i].availableSlotId != null
              ) {
                if (offset !== 0) {
                  let convertedDate = convertDateToLocalDate(
                    offset,
                    result.docs[i].availableSlotId.startTime,
                    result.docs[i].availableSlotId.endTime
                  );
                  result.docs[i].availableSlotId.startTime =
                    convertedDate.startTime;
                  result.docs[i].availableSlotId.endTime =
                    convertedDate.endTime;
                }
                if (
                  result.docs[i].availableSlotId.startTime > Date.now() &&
                  result.docs[i].isCancelled === false &&
                  result.docs[i].isAppointmentCompleted === false &&
                  result.docs[i].isInterrupted === false
                ) {
                  result.docs[i].appointmentStatus = "upcoming";
                } else if (result.docs[i].isCancelled === true) {
                  result.docs[i].appointmentStatus = "cancelled";
                } else if (result.docs[i].isInterrupted === true) {
                  result.docs[i].appointmentStatus = "interrupted";
                } else {
                  result.docs[i].appointmentStatus = "completed";
                }
                return result.docs[i];
              }
            });
          }
        }

        if (result) {
          return message.successResponse(
            { "Content-Type": "application/json" },
            responseCode.success,
            result,
            req.i18n.t("appointment.findAll")
          );
        } else {
          return message.badRequest(
            { "Content-Type": "application/json" },
            responseCode.badRequest,
            {},
            req.i18n.t("response_message.badRequest")
          );
        }
      }
    } catch (error) {
      console.error("Error - findAllAppointment", error);
      return message.failureResponse(
        { "Content-Type": "application/json" },
        responseCode.internalServerError,
        error.message
      );
    }
  };
  const getAppointmentById = async ({ req }) => {
    try {
      if (req) {
        let id = req.pathParams.id;
        const timezoneOffset = req.headers.timezone
          ? req.headers.timezone
          : TIMEZONE;
        let aggregate = [
          {
            $match: {
              _id: ObjectId(id),
            },
          },
          {
            $lookup: {
              from: "user",
              localField: "providerId",
              foreignField: "_id",
              as: "provider",
            },
          },
          {
            $unwind: {
              path: "$provider",
            },
          },
          {
            $lookup: {
              from: "file",
              localField: "provider.profilePictureId",
              foreignField: "_id",
              as: "providerProfilePicture",
            },
          },
          // {
          //   $unwind: {
          //     path: "$providerProfilePicture",
          //   },
          // },
          {
            $lookup: {
              from: "address",
              localField: "provider.practiceAddressId",
              foreignField: "_id",
              as: "address",
            },
          },
          {
            $unwind: {
              path: "$address",
            },
          },
          {
            $lookup: {
              from: "city",
              localField: "address.cityId",
              foreignField: "_id",
              as: "city",
            },
          },
          {
            $unwind: {
              path: "$city",
            },
          },
          {
            $lookup: {
              from: "province",
              localField: "address.provinceId",
              foreignField: "_id",
              as: "province",
            },
          },
          {
            $unwind: {
              path: "$province",
            },
          },
          {
            $lookup: {
              from: "availableSlot",
              localField: "availableSlotId",
              foreignField: "_id",
              as: "availableSlot",
            },
          },
          {
            $unwind: {
              path: "$availableSlot",
            },
          },
          {
            $lookup: {
              from: "specialisation",
              localField: "specialisationId",
              foreignField: "_id",
              as: "specialisation",
            },
          },
          {
            $unwind: {
              path: "$specialisation",
            },
          },
          {
            $lookup: {
              from: "file",
              localField: "specialisation.file",
              foreignField: "_id",
              as: "specialisationImage",
            },
          },
          {
            $unwind: {
              path: "$specialisationImage",
            },
          },
          {
            $lookup: {
              from: "order",
              localField: "orderId",
              foreignField: "_id",
              as: "order",
            },
          },
          // {
          //   $unwind: {
          //     path: "$order",
          //   },
          // },
          { $addFields: { order: { $arrayElemAt: ["$order", 0] } } },
          {
            $lookup: {
              from: "transaction",
              localField: "order.transactionId",
              foreignField: "_id",
              as: "transaction",
            },
          },
          // {
          //   $unwind: {
          //     path: "$transaction",
          //   },
          // },
          {
            $addFields: { transaction: { $arrayElemAt: ["$transaction", 0] } },
          },
          {
            $lookup: {
              from: "invoice",
              localField: "invoiceId",
              foreignField: "_id",
              as: "invoice",
            },
          },
          { $addFields: { invoiceUrl: { $arrayElemAt: ["$invoice.uri", 0] } } },
          {
            $lookup: {
              from: "ratingReview",
              // localField: "ratingReviewId",
              // foreignField: "_id",
              let: {
                id: "$ratingReviewId",
              },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $eq: ["$_id", "$$id"],
                    },
                  },
                },
                {
                  $lookup: {
                    from: "user",
                    // localField: "from",
                    // foreignField: "_id",
                    let: {
                      id: "$from",
                    },
                    pipeline: [
                      {
                        $match: {
                          $expr: {
                            $eq: ["$_id", "$$id"],
                          },
                        },
                      },
                      {
                        $project: {
                          name: 1,
                        },
                      },
                    ],
                    as: "patient",
                  },
                },
                {
                  $unwind: {
                    path: "$patient",
                  },
                },
                {
                  $project: {
                    rating: 1,
                    review: 1,
                    createdAt: 1,
                    patient: 1,
                  },
                },
              ],
              as: "ratingReview",
            },
          },
          { $addFields: { id: "$_id" } },
          {
            $lookup: {
              from: "appointmentSummary",
              // localField: "appointmentId",
              // foreignField: "appointmentId",
              let: {
                id: "$id",
              },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $eq: ["$appointmentId", "$$id"],
                    },
                  },
                },
                {
                  $lookup: {
                    from: "treatment",
                    let: {
                      treatmentIds: "$treatmentIds",
                    },
                    pipeline: [
                      {
                        $match: {
                          $expr: {
                            $in: ["$_id", "$$treatmentIds"],
                          },
                        },
                      },
                      {
                        $lookup: {
                          from: "file",
                          localField: "images",
                          foreignField: "_id",
                          as: "treatmentImages",
                        },
                      },
                    ],
                    as: "treatmentDetails",
                  },
                },
              ],
              as: "appointmentSummary",
            },
          },
          {
            $project: {
              specialisationName: "$specialisation.name",
              specialisationImage: "$specialisationImage.uri",
              APID: "$APID",
              providerName: "$provider.name",
              providerProfilePicture: {
                $ifNull: ["$providerProfilePicture.uri", "null"],
              },
              providerId: "$providerId",
              appointmentOn: {
                $ifNull: [
                  {
                    $dateToString: {
                      date: "$availableSlot.startTime",
                      timezone: timezoneOffset,
                    },
                  },
                  "",
                ],
              },
              timeSlotStartTime: {
                $ifNull: [
                  {
                    $dateToString: {
                      date: "$availableSlot.startTime",
                      timezone: timezoneOffset,
                    },
                  },
                  "",
                ],
              },
              timeSlotEndTime: {
                $ifNull: [
                  {
                    $dateToString: {
                      date: "$availableSlot.endTime",
                      timezone: timezoneOffset,
                    },
                  },
                  "",
                ],
              },
              city: "$city.name",
              province: "$province.name",
              proivderRating: {
                $ifNull: ["$provider.averageRating", 0],
              },
              appointmentCreatedAt: "$createdAt",
              cardDetails: { $ifNull: ["$transaction.card", null] },
              transactionId: {
                $ifNull: ["$transaction.paymentTransactionId", null],
              },
              total: {
                $ifNull: ["$transaction.amount", "$specialisation.price"],
              },
              isCancelled: "$isCancelled",
              isRescheduled: "$isRescheduled",
              isAppointmentCompleted: "$isAppointmentCompleted",
              isPaid: "$isPaid",
              isTreatmentPaid: "$isTreatmentPaid",
              treatmentAvailable: "$treatmentAvailable",
              isFollowUp: "$isFollowUp",
              isReviewAppointment: "$isReviewAppointment",
              isInterrupted: "$isInterrupted",
              invoiceUrl: {
                $ifNull: ["$invoiceUrl", ""],
              },
              ratingReview: {
                $ifNull: ["$ratingReview", "null"],
              },
              appointmentSummary: {
                $ifNull: ["$appointmentSummary", "null"],
              },
            },
          },
        ];
        const appointment = await Appointment.aggregate(aggregate);
        return message.successResponse(
          { "Content-Type": "application/json" },
          responseCode.success,
          appointment,
          req.i18n.t("appointment.find")
        );
      }
      return message.badRequest(
        { "Content-Type": "application/json" },
        responseCode.badRequest,
        {},
        req.i18n.t("response_message.badRequest")
      );
    } catch (error) {
      console.error("Error - getAppointmentById", error);
      return message.failureResponse(
        { "Content-Type": "application/json" },
        responseCode.internalServerError,
        error.message
      );
    }
  };
  const cancelAppointment = async (req) => {
    try {
      let data = {
        ...req.body,
      };
      if (data.cancellationReason == undefined) {
        throw new Error("Enter Cancellation Reason");
      }
      const userData = await User.findById(req.user.id);
      const role = await Role.findById(userData.roleIds);
      data.isCancelled = true;
      data.isAppointmentCompleted = true;
      data.cancelledBy = req.user.id;
      let appointmentData = await Appointment.findOneAndUpdate(
        { _id: req.pathParams.id },
        data,
        { new: true }
      ).populate(["patientId", "providerId"]);
      let availableSlotData = await AvailableSlot.findOneAndUpdate(
        { _id: appointmentData.availableSlotId },
        { isActive: true },
        { new: true }
      );

      if (
        appointmentData.isPaid == true &&
        appointmentData.isReviewAppointment == false
      ) {
        if (role.code === USER_ROLE.Patient) {
          const appointment = await Appointment.findOne({
            _id: req.pathParams.id,
          });
          // const bookedSlotData = await BookedSlot.findOne({
          //   _id: appointment.slotId,
          // });
          let today = new Date();
          today.setDate(today.getDate() + 1);
          if (today <= availableSlotData.startTime) {
            let result = await stripeHandler.refundPatient(req.pathParams.id);
          }
        } else {
          let result = await stripeHandler.refundPatient(req.pathParams.id);
        }
      }
      await notificationService.create(
        appointmentData.patientId,
        NOTIFICATION_TITLE.APPOINTMENT_CANCELLED,
        NOTIFICATION_MESSAGE.APPOINTMENT_CANCELLED_PATIENT(
          appointmentData.providerId.name,
          appointmentData.APID
        )
      );
      await notificationService.create(
        appointmentData.providerId,
        NOTIFICATION_TITLE.APPOINTMENT_CANCELLED,
        NOTIFICATION_MESSAGE.APPOINTMENT_CANCELLED_PHYSICIAN(
          appointmentData.patientId.name,
          appointmentData.APID
        )
      );
      return message.successResponse(
        { "Content-Type": "application/json" },
        responseCode.success,
        appointmentData,
        req.i18n.t("appointment.cancel")
      );
    } catch (error) {
      console.error("Error - cancelAppointment", error);
      return message.failureResponse(
        { "Content-Type": "application/json" },
        responseCode.internalServerError,
        error.message
      );
    }
  };

  const getAppointmentCount = async (data) => {
    try {
      let where = {};
      if (data.where) {
        where = data.where;
      }
      let result = await appointmentService.countDocument(where);
      if (result) {
        result = { totalRecords: result };
        return message.successResponse(
          { "Content-Type": "application/json" },
          responseCode.success,
          result
        );
      }
      return message.badRequest(
        { "Content-Type": "application/json" },
        responseCode.badRequest,
        {}
      );
    } catch (error) {
      return message.failureResponse(
        { "Content-Type": "application/json" },
        responseCode.internalServerError,
        error.message
      );
    }
  };
  const getAppointmentByAggregate = async ({ data }) => {
    try {
      if (data) {
        let result = await appointmentService.getDocumentByAggregation(data);
        if (result) {
          return message.successResponse(
            { "Content-Type": "application/json" },
            responseCode.success,
            result
          );
        }
      }
      return message.badRequest(
        { "Content-Type": "application/json" },
        responseCode.badRequest,
        {}
      );
    } catch (error) {
      return message.failureResponse(
        { "Content-Type": "application/json" },
        responseCode.internalServerError,
        error.message
      );
    }
  };

  const softDeleteAppointment = async (id) => {
    try {
      const deleteDependentService = require("../../../utils/deleteDependent");
      let pos = [
        {
          model: "invoice",
          refId: "appointmentId",
        },
        {
          model: "appointmentSummary",
          refId: "appointmentId",
        },
        {
          model: "order",
          refId: "appointmentId",
        },
      ];
      await appointmentService.softDeleteDocument(id);
      let result = await deleteDependentService.softDeleteAppointment({
        _id: id,
      });
      return message.successResponse(
        { "Content-Type": "application/json" },
        responseCode.success,
        result
      );
    } catch (error) {
      return message.failureResponse(
        { "Content-Type": "application/json" },
        responseCode.internalServerError,
        error.message
      );
    }
  };
  const bulkInsertAppointment = async ({ body }) => {
    try {
      let data = body.data;
      const appointmentEntities = body.data.map((item) =>
        makeAppointment(item, "insertAppointmentValidator")
      );
      const results = await appointmentService.bulkInsert(appointmentEntities);
      return message.successResponse(
        { "Content-Type": "application/json" },
        responseCode.success,
        results
      );
    } catch (error) {
      if (error.name === "ValidationError") {
        return message.inValidParam(
          { "Content-Type": "application/json" },
          responseCode.validationError,
          error.message
        );
      }
      return message.failureResponse(
        { "Content-Type": "application/json" },
        responseCode.internalServerError,
        error.message
      );
    }
  };
  const bulkUpdateAppointment = async (data) => {
    try {
      if (data.filter && data.data) {
        const appointment = makeAppointment(
          data.data,
          "updateAppointmentValidator"
        );
        const filterData = removeEmpty(appointment);
        const updatedAppointments = await appointmentService.bulkUpdate(
          data.filter,
          filterData
        );
        return message.successResponse(
          { "Content-Type": "application/json" },
          responseCode.success,
          updatedAppointments
        );
      }
      return message.badRequest(
        { "Content-Type": "application/json" },
        responseCode.badRequest,
        {}
      );
    } catch (error) {
      if (error.name === "ValidationError") {
        return message.inValidParam(
          { "Content-Type": "application/json" },
          responseCode.validationError,
          error.message
        );
      }
      return message.failureResponse(
        { "Content-Type": "application/json" },
        responseCode.internalServerError,
        error.message
      );
    }
  };
  const deleteAppointment = async (data, id) => {
    try {
      let possibleDependent = [
        {
          model: "invoice",
          refId: "appointmentId",
        },
        {
          model: "appointmentSummary",
          refId: "appointmentId",
        },
        {
          model: "order",
          refId: "appointmentId",
        },
      ];
      const deleteDependentService = require("../../../utils/deleteDependent");
      if (data.isWarning) {
        let all = await deleteDependentService.countAppointment({ _id: id });
        return message.successResponse(
          { "Content-Type": "application/json" },
          responseCode.success,
          all
        );
      } else {
        let result = await deleteDependentService.deleteAppointment({
          _id: id,
        });
        if (result) {
          return message.successResponse(
            { "Content-Type": "application/json" },
            responseCode.success,
            result
          );
        }
      }
      return message.badRequest(
        { "Content-Type": "application/json" },
        responseCode.badRequest,
        {}
      );
    } catch (error) {
      if (error.name === "ValidationError") {
        return message.inValidParam(
          { "Content-Type": "application/json" },
          responseCode.validationError,
          error.message
        );
      }
      return message.failureResponse(
        { "Content-Type": "application/json" },
        responseCode.internalServerError,
        error.message
      );
    }
  };

  const removeEmpty = (obj) => {
    let newObj = {};
    Object.keys(obj).forEach((key) => {
      if (obj[key] === Object(obj[key])) newObj[key] = removeEmpty(obj[key]);
      else if (obj[key] !== undefined) newObj[key] = obj[key];
    });
    return newObj;
  };
  return Object.freeze({
    addAppointment,
    bookAppointment,
    findAllAppointment,
    getAppointmentById,
    cancelAppointment,
    getAppointmentCount,
    getAppointmentByAggregate,
    updateAppointment,
    softDeleteAppointment,
    bulkInsertAppointment,
    bulkUpdateAppointment,
    deleteAppointment,
    removeEmpty,
    bookFollowUpAppointment,
  });
}

module.exports = makeAppointmentController;
