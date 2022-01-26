const db = require("../../../config/db");
const User = require("../../../model/user")(db);
const AppointmentSummary = require("../../../model/appointmentSummary")(db);
const Appointment = require("../../../model/appointment")(db);
const AppointmentFollowUp = require("../../../model/appointmentFollowUp")(db);
const Specialisation = require("../../../model/specialisation")(db);
const Pharmacy = require("../../../model/pharmacy")(db);
const message = require("../../../utils/messages");
const responseCode = require("../../../utils/responseCode");
const { randomAlphaNumericString } = require("../../../services/util");
const _ = require("lodash");
let ObjectId = require("mongodb").ObjectId;
const ejs = require("ejs");
const path = require("path");
const {
  USER_ROLE,
  COUNTRYCODE,
  CALL_STATUS,
  BUFFERAVAILABLESLOT_IN_DAYS,
  APPOINTMENT_REMINDER,
  EMAIL_SUBJECT,
  EMAIL_CONTENT,
  SMS_MESSAGE,
  NOTIFICATION_TITLE,
} = require("../../../config/authConstant");
const {
  sendSESEmail,
  emailQueue,
} = require("../../../services/email/emailService");
const {
  sendOTP,
  resendOTP,
  verifyOTP,
  sendMessage,
  SMSQueue,
} = require("../../../config/sms");
const { MESSAGE, NOTIFICATION_MESSAGE } = require("../../../config/message");
const notificationService = require("../../../services/notification");
const { NOTIFICATION } = require("../../../config/constant/notification");

function makeAppointmentSummaryController({
  appointmentSummaryService,
  makeAppointmentSummary,
}) {
  const addAppointmentSummary = async ({ data }, i18n) => {
    try {
      let appointmentData = await Appointment.findById(data.appointmentId).populate(["patientId","providerId"]);
      let checkAppointmentSummary = await AppointmentSummary.findOne({
        appointmentId: data.appointmentId,
        patientId: data.patientId,
        providerId: data.providerId,
      }).populate(["patientId", "appointmentId"]);
      if (
        checkAppointmentSummary === undefined ||
        checkAppointmentSummary === null
      ) {
        if (data.medication != undefined) {
          await Promise.all(
            _.map(data.medication, async (doc) => {
              let userData = await User.findById(data.patientId);
              if (
                userData.medication === null ||
                userData.medication === undefined
              ) {
                await User.findOneAndUpdate(
                  { _id: data.patientId },
                  { medication: doc }
                );
              } else {
                concatedMed = userData.medication + ", " + doc;
                await User.findOneAndUpdate(
                  { _id: data.patientId },
                  { medication: concatedMed }
                );
              }
            })
          );
        }
        if (data.treatmentIds != undefined || data.treatmentIds != null) {
          let pharmacyData = await Pharmacy.findOne({ isDefault: true });
          pharmacyId = pharmacyData._id.toString();
          data.pharmacyId = pharmacyId;
          let tenWeek = new Date();
          tenWeek.setDate(tenWeek.getDate() + 70);
          let twelveWeek = new Date();
          twelveWeek.setDate(twelveWeek.getDate() + 84);
          let appointmentData = await Appointment.findOneAndUpdate(
            { _id: data.appointmentId },
            {
              treatmentAvailable: true,
              treatmentAssignedOn: new Date(),
              firstTreatmentReminderPaymentMail: tenWeek,
              secondTreatmentReminderPaymentMail: twelveWeek,
            },
            {
              new: true,
            }
          ).populate(["patientId", "providerId"]);
          const emailHTML = await ejs.renderFile(
            path.join(__dirname, "../../../views/emailTemplate/email.ejs"),
            {
              user_name: appointmentData.patientId.name,
              content: NOTIFICATION_MESSAGE.TREATMENT_ASSIGNED(appointmentData.APID),
            }
          );
          emailQueue(
            appointmentData.patientId.email,
            EMAIL_SUBJECT.TREATMENT_ASSIGNED,
            emailHTML
          );
          SMSQueue(
            COUNTRYCODE + appointmentData.patientId.phone,
            NOTIFICATION_MESSAGE.TREATMENT_ASSIGNED(appointmentData.APID)
          );
          notificationService.pushNotificationQueue(
            appointmentData.patientId._id,
            NOTIFICATION_TITLE.TREATMENT_ASSIGNED,
            NOTIFICATION_MESSAGE.TREATMENT_ASSIGNED(appointmentData.APID),
            NOTIFICATION.ACTIONS["TREATMENT_ASSIGNED"],
          );
          await notificationService.create(
            data.patientId,
            NOTIFICATION_TITLE.TREATMENT_ASSIGNED,
            NOTIFICATION_MESSAGE.TREATMENT_ASSIGNED(
              appointmentData.APID
            )
          );
        } else {
          await notificationService.create(
            data.providerId,
            NOTIFICATION_TITLE.TREATMENT_NOT_ASSIGNED,
            NOTIFICATION_MESSAGE.TREATMENT_NOT_ASSIGNED(
              appointmentData.patientId.name,
              appointmentData.APID
            )
          );
        }
        if (data.followupDate != undefined) {
          let uniqueCode = randomAlphaNumericString();
          if (appointmentData.parentAppointmentId != undefined) {
            data.appointmentId = appointmentData.parentAppointmentId.toString();
          }
          let appointmentFollowUpData = await AppointmentFollowUp.create({
            appointmentId: data.appointmentId,
            followUpFromDate: data.followupDate.startDate,
            followUpToDate: data.followupDate.endDate,
            patientId: data.patientId,
            providerId: data.providerId,
            uniqueCode: uniqueCode,
          });
          await Appointment.findOneAndUpdate(
            { _id: data.appointmentId },
            { appointmentFollowUpId: appointmentFollowUpData._id }
          );
          await notificationService.create(
            data.patientId,
            NOTIFICATION_TITLE.FOLLOW_UP_AVAILABLE,
            NOTIFICATION_MESSAGE.FOLLOW_UP_AVAILABLE(
              appointmentData.APID
            )
          );
        }

        const originalData = data;

        const appointmentSummary = makeAppointmentSummary(
          originalData,
          "insertAppointmentSummaryValidator"
        );
        let createdAppointmentSummary =
          await appointmentSummaryService.createDocument(appointmentSummary);

        await Appointment.findOneAndUpdate(
          { _id: data.appointmentId },
          { appointmentSummaryId: createdAppointmentSummary.id }
        );
        return message.successResponse(
          { "Content-Type": "application/json" },
          responseCode.success,
          createdAppointmentSummary
        );
      } else {
        let updatedAppointmentSummary;
        if (data.treatmentIds != undefined || data.treatmentIds != null) {
          let pharmacyData = await Pharmacy.findOne({ isDefault: true });
          pharmacyId = pharmacyData._id.toString();
          data.pharmacyId = pharmacyId;
          let tenWeek = new Date();
          tenWeek.setDate(tenWeek.getDate() + 70);
          let twelveWeek = new Date();
          twelveWeek.setDate(twelveWeek.getDate() + 84);
          await Appointment.findOneAndUpdate(
            { _id: data.appointmentId },
            {
              treatmentAvailable: true,
              treatmentAssignedOn: new Date(),
              firstTreatmentReminderPaymentMail: tenWeek,
              secondTreatmentReminderPaymentMail: twelveWeek,
            },
            { new: true }
          ).populate(["patientId", "providerId"]);
          const emailHTML = await ejs.renderFile(
            path.join(__dirname, "../../../views/emailTemplate/email.ejs"),
            {
              user_name: appointmentData.patientId.name,
              content: NOTIFICATION_MESSAGE.TREATMENT_ASSIGNED(appointmentData.APID),
            }
          );
          emailQueue(
            appointmentData.patientId.email,
            EMAIL_SUBJECT.TREATMENT_ASSIGNED,
            emailHTML
          );
          SMSQueue(
            COUNTRYCODE + appointmentData.patientId.phone,
            NOTIFICATION_MESSAGE.TREATMENT_ASSIGNED(appointmentData.APID)
          );
          notificationService.pushNotificationQueue(
            appointmentData.patientId._id,
            NOTIFICATION_TITLE.TREATMENT_ASSIGNED,
            NOTIFICATION_MESSAGE.TREATMENT_ASSIGNED(appointmentData.APID),
            NOTIFICATION.ACTIONS["TREATMENT_ASSIGNED"],
          );
          updatedAppointmentSummary = await AppointmentSummary.findOneAndUpdate(
            { _id: checkAppointmentSummary._id },
            data,
            { new: true }
          );
          await notificationService.create(
            data.patientId,
            NOTIFICATION_TITLE.TREATMENT_ASSIGNED,
            NOTIFICATION_MESSAGE.TREATMENT_ASSIGNED(
              appointmentData.APID
            )
          );
        }
        if (data.followupDate != undefined) {
          let uniqueCode = randomAlphaNumericString();
          let appointmentData = await Appointment.findById(data.appointmentId);
          if (appointmentData.parentAppointmentId != undefined) {
            data.appointmentId = appointmentData.parentAppointmentId;
          }
          let appointmentFollowUpData = await AppointmentFollowUp.create({
            appointmentId: data.appointmentId,
            followUpFromDate: data.followupDate.startDate,
            followUpToDate: data.followupDate.endDate,
            patientId: data.patientId,
            providerId: data.providerId,
            uniqueCode: uniqueCode,
          });
          await Appointment.findOneAndUpdate(
            { _id: data.appointmentId },
            { appointmentFollowUpId: appointmentFollowUpData._id }
          );
          updatedAppointmentSummary = await AppointmentSummary.findOneAndUpdate(
            { _id: checkAppointmentSummary._id },
            data,
            { new: true }
          );
          await notificationService.create(
            data.patientId,
            NOTIFICATION_TITLE.FOLLOW_UP_AVAILABLE,
            NOTIFICATION_MESSAGE.FOLLOW_UP_AVAILABLE(
              appointmentData.APID
            )
          );
        }
        return message.successResponse(
          { "Content-Type": "application/json" },
          responseCode.success,
          updatedAppointmentSummary,
          i18n.t("appointmentSummary.create")
        );
      }
    } catch (error) {
      console.error("Error - addAppointmentSummary", error);
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
  const findAllAppointmentSummary = async ({ data }, i18n) => {
    try {
      let options = {};
      let query = {};
      let result;
      let aggregate = [];
      if (data.isCountOnly) {
        if (data.query !== undefined) {
          query = { ...data.query };
        }
        result = await appointmentSummaryService.countDocument(query);
        if (result) {
          result = { totalRecords: result };
        } else {
          return message.recordNotFound(
            { "Content-Type": "application/json" },
            responseCode.success,
            []
          );
        }
      } else if (
        data.query.patientId !== undefined ||
        data.query.providerId !== undefined
      ) {
        if (data.options !== undefined) {
          options = { ...data.options };
        }
        if (data.query !== undefined) {
          query = { ...data.query };
        }
        if (query.patientId != undefined) {
          aggregate.push({
            $match: {
              patientId: ObjectId(query.patientId),
            },
          });
        } else if (query.providerId != undefined) {
          aggregate.push({
            $match: { providerId: ObjectId(query.providerId) },
          });
        }
        aggregate.push({
          $match: {
            treatmentIds: { $exists: true, $ne: [] },
          },
        });
        let runnerResult = await AppointmentSummary.aggregate(aggregate);
        let appointmentSummaryIds = runnerResult.map((element) => {
          return element._id;
        });
        let nQuery = { _id: { $in: appointmentSummaryIds } };
        result = await appointmentSummaryService.getAllDocuments(
          nQuery,
          options
        );
        if (result.docs != undefined) {
          result.docs = result.docs.filter(async function (error, i) {
            let j;
            let treatmentAmount = 0;
            if (
              result.docs[i].treatmentIds != undefined ||
              result.docs[i].treatmentIds != null
            ) {
              for (j = 0; j < result.docs[i].treatmentIds.length; j++) {
                treatmentAmount =
                  treatmentAmount + result.docs[i].treatmentIds[j].price;
              }
              let specialisationData = await Specialisation.findById(
                result.docs[i].appointmentId.specialisationId
              );
              let amount = treatmentAmount - specialisationData.price;
              result.docs[i].treatmentAmount = amount;
            }
            return result.docs[i];
          });
        }
      } else {
        if (data.options !== undefined) {
          options = { ...data.options };
        }
        if (data.query !== undefined) {
          query = { ...data.query };
        }
        result = await appointmentSummaryService.getAllDocuments(
          query,
          options
        );
      }

      if (result) {
        return message.successResponse(
          { "Content-Type": "application/json" },
          responseCode.success,
          result,
          i18n.t("appointmentSummary.findAll")
        );
      } else {
        return message.badRequest(
          { "Content-Type": "application/json" },
          responseCode.badRequest,
          {},
          i18n.t("response_message.badRequest")
        );
      }
    } catch (error) {
      console.error("Error - findAllAppointmentSummary", error);
      return message.failureResponse(
        { "Content-Type": "application/json" },
        responseCode.internalServerError,
        error.message
      );
    }
  };
  const getAppointmentSummaryById = async (id, i18n) => {
    try {
      if (id) {
        const appointmentSummary = await AppointmentSummary.findById(
          id
        ).populate([
          {
            path: "treatment.treatmentId",
            populate: [{ path: "images", model: "file" }],
          },
        ]);
        return message.successResponse(
          { "Content-Type": "application/json" },
          responseCode.success,
          appointmentSummary,
          i18n.t("appointmentSummary.find")
        );
      }
      return message.badRequest(
        { "Content-Type": "application/json" },
        responseCode.badRequest,
        {},
        i18n.t("response_message.badRequest")
      );
    } catch (error) {
      console.error("Error - getAppointmentSummaryById", error);
      return message.failureResponse(
        { "Content-Type": "application/json" },
        responseCode.internalServerError,
        error.message
      );
    }
  };
  const getAppointmentSummaryCount = async (data) => {
    try {
      let where = {};
      if (data.where) {
        where = data.where;
      }
      let result = await appointmentSummaryService.countDocument(where);
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
  const getAppointmentSummaryByAggregate = async ({ data }) => {
    try {
      if (data) {
        let result = await appointmentSummaryService.getDocumentByAggregation(
          data
        );
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
  const updateAppointmentSummary = async (data, id) => {
    try {
      if (id && data) {
        const appointmentSummary = makeAppointmentSummary(
          data,
          "updateAppointmentSummaryValidator"
        );
        const filterData = removeEmpty(appointmentSummary);
        let updatedAppointmentSummary =
          await appointmentSummaryService.findOneAndUpdateDocument(
            { _id: id },
            filterData,
            { new: true }
          );
        return message.successResponse(
          { "Content-Type": "application/json" },
          responseCode.success,
          updatedAppointmentSummary
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
  const softDeleteAppointmentSummary = async (id) => {
    try {
      if (id) {
        let updatedAppointmentSummary =
          await appointmentSummaryService.softDeleteDocument(id);
        return message.successResponse(
          { "Content-Type": "application/json" },
          responseCode.success,
          updatedAppointmentSummary
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
  const bulkInsertAppointmentSummary = async ({ body }) => {
    try {
      let data = body.data;
      const appointmentSummaryEntities = body.data.map((item) =>
        makeAppointmentSummary(item, "insertAppointmentSummaryValidator")
      );
      const results = await appointmentSummaryService.bulkInsert(
        appointmentSummaryEntities
      );
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
  const bulkUpdateAppointmentSummary = async (data) => {
    try {
      if (data.filter && data.data) {
        const appointmentSummary = makeAppointmentSummary(
          data.data,
          "updateAppointmentSummaryValidator"
        );
        const filterData = removeEmpty(appointmentSummary);
        const updatedAppointmentSummarys =
          await appointmentSummaryService.bulkUpdate(data.filter, filterData);
        return message.successResponse(
          { "Content-Type": "application/json" },
          responseCode.success,
          updatedAppointmentSummarys
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
  const deleteAppointmentSummary = async (data, id) => {
    try {
      if (id) {
        let deletedAppointmentSummary =
          await appointmentSummaryService.findOneAndDeleteDocument({ _id: id });
        return message.successResponse(
          { "Content-Type": "application/json" },
          responseCode.success,
          deletedAppointmentSummary
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

  const removeEmpty = (obj) => {
    let newObj = {};
    Object.keys(obj).forEach((key) => {
      if (obj[key] === Object(obj[key])) newObj[key] = removeEmpty(obj[key]);
      else if (obj[key] !== undefined) newObj[key] = obj[key];
    });
    return newObj;
  };
  return Object.freeze({
    addAppointmentSummary,
    findAllAppointmentSummary,
    getAppointmentSummaryById,
    getAppointmentSummaryCount,
    getAppointmentSummaryByAggregate,
    updateAppointmentSummary,
    softDeleteAppointmentSummary,
    bulkInsertAppointmentSummary,
    bulkUpdateAppointmentSummary,
    deleteAppointmentSummary,
    removeEmpty,
  });
}

module.exports = makeAppointmentSummaryController;
