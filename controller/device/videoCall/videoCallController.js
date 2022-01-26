const message = require("../../../utils/messages");
const responseCode = require("../../../utils/responseCode");
const utils = require("../../../utils/common");
// const utils = require("../../../utils/messages");
const db = require("../../../config/db");
const Appointment = require("../../../model/appointment")(db);
const {
  USER_ROLE,
  CALL_STATUS,
  COUNTRYCODE,
  NOTIFICATION_TITLE
} = require("../../../config/authConstant");
const _ = require("lodash");
const moment = require("moment");
const { createVideoCallSession } = require("../../../services/video");
const { sendMessage, SMSQueue } = require("../../../config/sms");
const { createPayment } = require("../../../services/payment");
const notificationService = require("../../../services/notification");
const { NOTIFICATION } = require("../../../config/constant/notification");
const { NOTIFICATION_MESSAGE } = require("../../../config/message");
const updateCallStatus = async ({ req }) => {
  try {
    let data = req.body;
    if (data.status == undefined || data.appointmentId == undefined) {
      throw new Error(req.i18n.t("videoCall.missing_data"));
    }
    let appointmentData = await Appointment.findById(
      data.appointmentId
    ).populate(["providerId", "patientId", "availableSlotId"]);
    let query = {};
    if (
      !(
        appointmentData.patientId.email == req.user.email ||
        appointmentData.providerId.email == req.user.email
      )
    ) {
      throw new Error(req.i18n.t("videoCall.permission_denied"));
    }
    let roleCode = req.user.roleIds[0].code;

    if (data.status == CALL_STATUS.INTERRUPTED) {
      query.isInterrupted = true;
      query.canReBook = true;
      if (roleCode == USER_ROLE.Patient) {
        query.isPhysicianDisconnected = true;
        query.physicianDisconnectedAt = new Date();
      } else if (roleCode == USER_ROLE.Physician) {
        query.isPatientDisconnected = true;
        query.patientDisconnectedAt = new Date();
      }
    }

    if (
      data.status == CALL_STATUS.JOINED ||
      data.status == CALL_STATUS.CONNECTED
    ) {
      query.canReBook = false;
      if (data.status == CALL_STATUS.CONNECTED) {
        query.isConnected = true;
        query.isInterrupted = false;
      }
      if (roleCode == USER_ROLE.Patient) {
        query.patientJoinedAt = new Date();
        query.isPatientJoined = true;
        query.isAppointmentStarted = true;
        query.isPatientDisconnected = false;
        query.$unset = {
          patientDisconnectedAt: 1,
        };
        if (
          data.status == CALL_STATUS.JOINED &&
          appointmentData.physicianDisconnectedAt !== undefined &&
          appointmentData.physicianDisconnectedAt < new Date()
        ) {
          SMSQueue(
            COUNTRYCODE + appointmentData.providerId.phone,
            NOTIFICATION_MESSAGE.VIDEOCALL_REMINDER_PHYSICIAN()
          );
          notificationService.pushNotificationQueue(
            appointmentData.providerId._id,
            NOTIFICATION_TITLE.VIDEO_CALL_REMINDER,
            NOTIFICATION_MESSAGE.VIDEOCALL_REMINDER_PHYSICIAN(),
            NOTIFICATION.ACTIONS["VIDEO_CALL_REMINDER"],
            appointmentData._id
          );
        }
      } else if (roleCode == USER_ROLE.Physician) {
        query.physicianJoinedAt = new Date();
        query.isPhysicianJoined = true;
        query.isAppointmentStarted = true;
        query.isPhysicianDisconnected = false;
        query.$unset = {
          physicianDisconnectedAt: 1,
        };

        if (
          data.status == CALL_STATUS.JOINED &&
          appointmentData.patientDisconnectedAt !== undefined &&
          appointmentData.patientDisconnectedAt < new Date()
        ) {
          SMSQueue(
            COUNTRYCODE + appointmentData.patientId.phone,
            NOTIFICATION_MESSAGE.VIDEOCALL_REMINDER_PATIENT()
          );
          notificationService.pushNotificationQueue(
            appointmentData.patientId._id,
            NOTIFICATION_TITLE.VIDEO_CALL_REMINDER,
            NOTIFICATION_MESSAGE.VIDEOCALL_REMINDER_PATIENT(),
            NOTIFICATION.ACTIONS["VIDEO_CALL_REMINDER"],
            appointmentData._id
          );
        }
      }
    }

    if (
      data.status == CALL_STATUS.DISCONNECTED ||
      data.status == CALL_STATUS.LEAVE
    ) {
      query.isConnected = false;
      if (roleCode == USER_ROLE.Physician) {
        query.isPhysicianDisconnected = true;
        query.isPhysicianJoined = false;
        query.physicianDisconnectedAt = new Date();
      } else if (roleCode == USER_ROLE.Patient) {
        query.isPatientJoined = false;
        query.isPatientDisconnected = true;
        query.patientDisconnectedAt = new Date();
      }
      if (data.status == CALL_STATUS.LEAVE) {
        query.isConnected = true;
        query.isPatientJoined = true;
        query.patientDisconnectedAt = new Date();
      }
    }

    if (data.status == CALL_STATUS.COMPLETED) {
      query.isAppointmentCompleted = true;
      query.isInterrupted = false;
      query.canReBook = false;
      query.isCancelled = false;
      query.isPatientDisconnected = true;
      query.isPhysicianDisconnected = true;
      query.physicianDisconnectedAt = new Date();
      query.isConnected = true;
      if (
        appointmentData.isFollowUp &&
        appointmentData.parentAppointmentId != undefined
      ) {
        await Appointment.findOneAndUpdate(
          {
            _id: appointmentData.parentAppointmentId,
          },
          { followUpBooked: false }
        );
      }
      notificationService.pushNotificationQueue(
        appointmentData.patientId._id,
        NOTIFICATION_TITLE.VIDEO_CALL_COMPLETED,
        NOTIFICATION_MESSAGE.VIDEO_CALL_COMPLETED(),
        NOTIFICATION.ACTIONS["VIDEO_CALL_COMPLETED"],
        appointmentData._id
      );
    }

    appointmentData = await Appointment.findOneAndUpdate(
      { _id: data.appointmentId },
      query,
      { new: true }
    );

    return message.successResponse(
      { "Content-Type": "application/json" },
      responseCode.success,
      appointmentData,
      req.i18n.t("videoCall.status")
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

const authenticateCall = async ({ req }) => {
  try {
    const data = req.body;
    if (data.appointmentId == undefined) {
      throw new Error(req.i18n.t("videoCall.missing_data"));
    }
    let appointmentData = await Appointment.findById({
      _id: data.appointmentId,
    }).populate(["providerId", "patientId", "availableSlotId"]);

    // * TODO: Uncomment this code after video call is integrated from the frontend
    // if (

    //     appointmentData.patientId.email == req.user.email ||
    //     appointmentData.providerId.email == req.user.email

    // ) {
    //   throw new Error("Sorry You have no permission to join the call");
    // }
    // if (appointmentData.isAppointmentCompleted) {
    //   throw new Error("Appointment is already completed");
    // }
    let appointmentStartTime = new Date(
      appointmentData.availableSlotId.startTime
    );
    let bufferTime = new Date(
      moment(appointmentStartTime).subtract(10, "minutes")
    );
    let todayTime = new Date();

    // if (bufferTime > todayTime) {
    //   throw new Error(req.i18n.t("videoCall.not_started"));
    // }
    if (
      appointmentData.sessionToken === undefined ||
      appointmentData.sessionId === undefined
    ) {
      let results = await createVideoCallSession(data.appointmentId);
      return message.successResponse(
        { "Content-Type": "application/json" },
        responseCode.success,
        results,
        req.i18n.t("videoCall.authenticate")
      );
    } else {
      obj = {
        Vonage_API_Key: process.env.VONAGE_VIDEO_API,
        sessionId: appointmentData.sessionId,
        tokenId: appointmentData.sessionToken,
      };
      return message.successResponse(
        { "Content-Type": "application/json" },
        responseCode.success,
        obj,
        req.i18n.t("videoCall.authenticate")
      );
    }
  } catch (error) {
    console.error("Error -authenticateCall", error);
    return message.failureResponse(
      { "Content-Type": "application/json" },
      responseCode.internalServerError,
      error.message
    );
  }
};

module.exports = {
  updateCallStatus,
  authenticateCall,
};
