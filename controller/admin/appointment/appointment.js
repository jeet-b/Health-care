const message = require("../../../utils/messages");
const responseCode = require("../../../utils/responseCode");
const utils = require("../../../utils/common");
const db = require("../../../config/db");
const appointmentConstants = require("../.././../config/constant/appointment");
const Appointment = require("../../../model/appointment")(db);
const Specialisation = require("../../../model/specialisation")(db);
const AvailableSlot = require("../../../model/availableSlot")(db);
const BookedSlot = require("../../../model/bookedSlot")(db);
let mongoose = require("mongoose");
const User = require("../../../model/user")(db);
const Master = require("../../../model/master")(db);
let moment = require("moment");
const {
  USER_ROLE,
  PAYMENT_STATUS,
  APPOINTMENT_PREFIX,
  NOTIFICATION_TITLE,
  TIMEZONE,
} = require("../../../config/authConstant");
let paymentController = require("./../payment/payment");
const { NOTIFICATION_MESSAGE } = require("../../../config/message");
const notificationService = require("../../../services/notification");
const { getTimezone } = require("countries-and-timezones");
const ObjectId = require("mongodb").ObjectId;

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
      data.APID = APPOINTMENT_PREFIX + utils.randomNumber(7);
      data.isReviewAppointment = true;
      data.isPaid = true;
      let userData = await User.findById(data.patientId).select("name -_id");
      data.patientName = userData.name;
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
      console.error("Error- addAppointment", error);
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

  const bookAppointment = async (data, id, i18n) => {
    try {
      let getAppointment = await Appointment.findOne({ _id: id }).populate([
        "providerId",
        "addedBy",
        "patientId",
        "orderId",
      ]);

      createBookedSlot = await createSlot(
        getAppointment.patientId,
        getAppointment.availableSlotId
      );
      slotId = createBookedSlot._id;
      if (getAppointment.orderId) {
        let masterData = await Master.findOne({ code: PAYMENT_STATUS.SUCCESS });
        if (getAppointment.orderId.status === masterData._id) {
          updateAppointmentStatus = await Appointment.findOneAndUpdate(
            { _id: getAppointment._id },
            { $set: { isBooked: true, isPaid: true, slotId: slotId } },
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
        await notificationService.create(
          getAppointment.patientId,
          NOTIFICATION_TITLE.ADMIN_BOOKED_APPOINTMENT,
          NOTIFICATION_MESSAGE.ADMIN_BOOKED_APPOINTMENT_PATIENT(
            getAppointment.providerId.name,
            getAppointment.APID
          )
        );
        await notificationService.create(
          getAppointment.providerId,
          NOTIFICATION_TITLE.ADMIN_BOOKED_APPOINTMENT,
          NOTIFICATION_MESSAGE.ADMIN_BOOKED_APPOINTMENT_PHYSICIAN(
            getAppointment.patientId.name,
            getAppointment.APID
          )
        );
      }
      // await paymentController.checkPayment(id);

      return message.successResponse(
        { "Content-Type": "application/json" },
        responseCode.success,
        updateAppointmentStatus,
        i18n.t("appointment.book")
      );
    } catch (error) {
      console.error("Error- bookAppointment", error);
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
          appointmentConstants.INTERRUPTED_APPOINTMENTS,
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
                    $and: [
                      // { endTime: { $lte: currentTime } },
                      // {
                      //   $and: [
                      { isAppointmentCompleted: true },
                      { isInterrupted: false },
                      //   ],
                      // },
                    ],
                  },
                }
              );
            } else if (
              query.status === appointmentConstants.INTERRUPTED_APPOINTMENTS
            ) {
              queryRunner.push(
                { $addFields: { startTime: "$availableSlot.startTime" } },
                {
                  $match: {
                    $and: [
                      // { endTime: { $lte: currentTime } },
                      // {
                      //   $and: [
                      { isAppointmentCompleted: false },
                      { isInterrupted: true },
                      //   ],
                      // },
                    ],
                  },
                }
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

  const getAppointmentById = async (id) => {
    try {
      if (id) {
        const appointment = await appointmentService.getSingleDocumentById(id);
        return message.successResponse(
          { "Content-Type": "application/json" },
          responseCode.success,
          appointment
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

  const updateAppointment = async (data, id, i18n) => {
    try {
      if (id && data) {
        if (data.isRescheduled === true) {
          const appointmentData = await Appointment.findById(id);
          if (appointmentData.isRescheduled === true) {
            throw new Error(i18n.t("appointment.slot_already_booked"));
          }
        }
        if (data.providerId) {
          const providerData = await User.findOne({ _id: data.providerId });
          data.providerName = providerData.name;
        }
        const appointment = makeAppointment(data, "updateAppointmentValidator");
        const filterData = removeEmpty(appointment);
        let updatedAppointment =
          await appointmentService.findOneAndUpdateDocument(
            { _id: id },
            filterData,
            { new: true }
          );
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
      console.error("Error- updateAppointment", error);
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
    findAllAppointment,
    getAppointmentById,
    getAppointmentCount,
    getAppointmentByAggregate,
    updateAppointment,
    bookAppointment,
    softDeleteAppointment,
    bulkInsertAppointment,
    bulkUpdateAppointment,
    deleteAppointment,
    removeEmpty,
  });
}

module.exports = makeAppointmentController;
