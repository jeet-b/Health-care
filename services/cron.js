const moment = require("moment");
const db = require("../config/db");
const User = require("../model/user")(db);
const Role = require("../model/role")(db);
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
} = require("../config/authConstant");
const Appointment = require("../model/appointment")(db);
const AppointmentSummary = require("../model/appointmentSummary")(db);
const providerSlot = require("../model/providerSlot")(db);
const availableSlot = require("../model/availableSlot")(db);
const { sendSESEmail, emailQueue } = require("./email/emailService");
const { sendMessage, SMSQueue } = require("../config/sms");
const ejs = require("ejs");
const path = require("path");
const Order = require("../model/order")(db);
const Transaction = require("../model/transaction")(db);
const _ = require("lodash");
const { refundPatient } = require("./stripe/stripeHandler");
const { MESSAGE, NOTIFICATION_MESSAGE } = require("../config/message");
const notificationService = require("../services/notification");
const { NOTIFICATION } = require("../config/constant/notification");
moment.tz.setDefault(process.env.UTC_TIMEZONE);

module.exports = {
  async addAvailableSlot() {
    try {
      let dayOfWeek = moment()
        .add(BUFFERAVAILABLESLOT_IN_DAYS, "days")
        .weekday();
      let newDate = moment().add(BUFFERAVAILABLESLOT_IN_DAYS, "days");
      newDate = newDate.format("YYYY-MM-DD");
      let providerIds = await providerSlot.aggregate([
        {
          $match: {
            dayOfWeek: dayOfWeek,
            repeatUntil: true,
            repeatDate: {
              $gte: newDate,
            },
          },
        },
      ]);
      await Promise.all(
        _.map(providerIds, async (doc) => {
          await Promise.all(
            _.map(doc.durations, async (duration) => {
              let startTime = moment(newDate).format(
                "YYYY-MM-DD[T]" + duration.startTime + ":00"
              );
              let endTime = moment(newDate).format(
                "YYYY-MM-DD[T]" + duration.endTime + ":00"
              );
              let resultDoc = new availableSlot({
                dayOfWeek: duration.dayOfWeek,
                startTime: startTime,
                endTime: endTime,
                duration: duration.duration,
                providerId: doc.providerId,
              });
              await availableSlot.create(resultDoc);
            })
          );
        })
      );
      console.log("addAvailableSlot cron executed");
      return;
    } catch (error) {
      console.error("Error - availableAppointment", error);
      return;
    }
  },

  async disablePastAvailableSlot() {
    try {
      let nowTime = new Date();
      let aggregate = [
        {
          $match: {
            startTime: {
              $lte: nowTime,
            },
            isActive: true,
          },
        },
        { $project: { _id: 1 } },
      ];
      let runnerResult = await availableSlot.aggregate(aggregate);
      // console.log(runnerResult);
      let availableSlotIds = runnerResult.map((element) => {
        return element._id;
      });
      let nQuery = { _id: { $in: availableSlotIds } };
      let result = await availableSlot.updateMany(
        nQuery,
        { isActive: false },
        { multi: true }
      );
      console.log("disablePastAvailableSlot cron executed");
      return;
    } catch (error) {
      console.error("Error - disablePastAvailableSlot", error);
      return;
    }
  },

  async videoCallReminder() {
    try {
      let appointmentData = await Appointment.find({
        isAppointmentCompleted: false,
        isAppointmentStarted: true,
        isConnected: false,
        isInterrupted: false,
        $or: [{ isPatientJoined: false }, { isPhysicianJoined: false }],
      }).populate(["availableSlotId", "providerId", "patientId"]);

      await Promise.all(
        _.map(appointmentData, async (doc) => {
          let dateTime = new moment(doc.availableSlotId.startTime);
          let newDate = moment();
          let diffTime = moment.utc(newDate.diff(dateTime)).format("mm:ss");

          if (doc.isPatientJoined == true && doc.isPhysicianJoined == false) {
            if (diffTime == "01:00") {
              SMSQueue(
                COUNTRYCODE + doc.providerId.phone,
                NOTIFICATION_MESSAGE.PHYSICIAN_VIDEO_CALL_REMINDER_1()
              );
              notificationService.pushNotificationQueue(
                doc.providerId._id,
                NOTIFICATION_TITLE.VIDEO_CALL_REMINDER,
                NOTIFICATION_MESSAGE.PHYSICIAN_VIDEO_CALL_REMINDER_1(),
                NOTIFICATION.ACTIONS["VIDEO_CALL_REMINDER"],
                doc._id
              );
            } else if (diffTime == "05:00") {
              SMSQueue(
                COUNTRYCODE + doc.providerId.phone,
                NOTIFICATION_MESSAGE.PHYSICIAN_VIDEO_CALL_REMINDER_5()
              );
              notificationService.pushNotificationQueue(
                doc.providerId._id,
                NOTIFICATION_TITLE.VIDEO_CALL_REMINDER,
                NOTIFICATION_MESSAGE.PHYSICIAN_VIDEO_CALL_REMINDER_5(),
                NOTIFICATION.ACTIONS["VIDEO_CALL_REMINDER"],
                doc._id
              );
            } else if (diffTime == "10:00") {
              SMSQueue(
                COUNTRYCODE + doc.providerId.phone,
                NOTIFICATION_MESSAGE.PHYSICIAN_VIDEO_CALL_REMINDER_10()
              );
              notificationService.pushNotificationQueue(
                doc.providerId._id,
                NOTIFICATION_TITLE.VIDEO_CALL_REMINDER,
                NOTIFICATION_MESSAGE.PHYSICIAN_VIDEO_CALL_REMINDER_10(),
                NOTIFICATION.ACTIONS["VIDEO_CALL_REMINDER"],
                doc._id
              );
            } else if (diffTime == "20:00") {
              let adminRole = await Role.findOne({ code: USER_ROLE.Admin });
              let adminUser = await User.findOne({ roleIds: adminRole._id });
              if (adminUser != undefined) {
                let email = adminUser.email;
                let phone = adminUser.phone;

                SMSQueue(
                  COUNTRYCODE + phone,
                  NOTIFICATION_MESSAGE.VIDEO_CALL_NO_SHOW(
                    doc.patientId.name,
                    doc.providerId.name
                  )
                );

                let htmlData = await ejs.renderFile(
                  path.join(__dirname, "../views/emailTemplate/email.ejs"),
                  {
                    user_name: adminUser.name,
                    content: NOTIFICATION_MESSAGE.VIDEO_CALL_NO_SHOW_PHYSICIAN(
                      doc.patientId.name,
                      doc.providerId.name
                    ),
                  }
                );
                emailQueue(email, EMAIL_SUBJECT.VIDEO_CALL_NO_SHOW, htmlData);
                // await sendEmail(
                //   email,
                //   EMAIL_SUBJECT.VIDEO_CALL_NO_SHOW,
                //   htmlData
                // );

                SMSQueue(
                  COUNTRYCODE + doc.providerId.phone,
                  NOTIFICATION_MESSAGE.APPOINTMENT_MISSED()
                );

                htmlData = await ejs.renderFile(
                  path.join(__dirname, "../views/emailTemplate/email.ejs"),
                  {
                    user_name: doc.providerId.name,
                    content: NOTIFICATION_MESSAGE.APPOINTMENT_MISSED(),
                  }
                );
                emailQueue(
                  doc.providerId.email,
                  EMAIL_SUBJECT.VIDEO_CALL_NO_SHOW,
                  htmlData
                );
                // await sendEmail(
                //   doc.providerId.email,
                //   EMAIL_SUBJECT.VIDEO_CALL_NO_SHOW,
                //   htmlData
                // );
              }
              let appointmentData = await Appointment.findById(appointmentId);
              if (appointmentData.isRescheduled == true) {
                await refundPatient(appointmentId);
                query = {
                  isAppointmentCompleted: true,
                  canReBook: false,
                  isCancelled: true,
                };
              } else if (
                appointmentData.isRescheduled == false ||
                appointmentData.isRescheduled == undefined
              ) {
                query = {
                  isAppointmentCompleted: true,
                  canReBook: true,
                  isCancelled: false,
                  isInterrupted: true,
                };
              }

              await Appointment.findOneAndUpdate({ _id: appointmentId }, query);
            }
          }

          if (doc.isPatientJoined == false && doc.isPhysicianJoined == true) {
            if (diffTime == "01:00") {
              SMSQueue(
                COUNTRYCODE + doc.patientId.phone,
                NOTIFICATION_MESSAGE.PATIENT_VIDEO_CALL_REMINDER_1()
              );
              notificationService.pushNotificationQueue(
                doc.patientId._id,
                NOTIFICATION_TITLE.VIDEO_CALL_REMINDER,
                NOTIFICATION_MESSAGE.PATIENT_VIDEO_CALL_REMINDER_1(),
                NOTIFICATION.ACTIONS["VIDEO_CALL_REMINDER"],
                doc._id
              );
            } else if (diffTime == "05:00") {
              SMSQueue(
                COUNTRYCODE + doc.patientId.phone,
                NOTIFICATION_MESSAGE.PATIENT_VIDEO_CALL_REMINDER_5()
              );
              notificationService.pushNotificationQueue(
                doc.patientId._id,
                NOTIFICATION_TITLE.VIDEO_CALL_REMINDER,
                NOTIFICATION_MESSAGE.PATIENT_VIDEO_CALL_REMINDER_5(),
                NOTIFICATION.ACTIONS["VIDEO_CALL_REMINDER"],
                doc._id
              );
            } else if (diffTime == "10:00") {
              SMSQueue(
                COUNTRYCODE + doc.patientId.phone,
                NOTIFICATION_MESSAGE.PATIENT_VIDEO_CALL_REMINDER_10()
              );
              notificationService.pushNotificationQueue(
                doc.patientId._id,
                NOTIFICATION_TITLE.VIDEO_CALL_REMINDER,
                NOTIFICATION_MESSAGE.PATIENT_VIDEO_CALL_REMINDER_10(),
                NOTIFICATION.ACTIONS["VIDEO_CALL_REMINDER"],
                doc._id
              );
              // let htmlData = await ejs.renderFile(
              //   path.join(__dirname, "../../views/index.ejs"),
              //   {
              //     user_name: doc.providerId.name,
              //     content:
              //   }
              // );
              // await sendEmail(email, EMAIL_SUBJECT.NOTIFICATION, htmlData);
            } else if (diffTime == "20:00") {
              let adminRole = await Role.findOne({ code: USER_ROLE.Admin });
              let adminUser = await User.findOne({ roleIds: adminRole._id });
              if (adminUser != undefined) {
                let email = adminUser.email;
                let phone = adminUser.phone;

                SMSQueue(
                  COUNTRYCODE + phone,
                  NOTIFICATION_MESSAGE.VIDEO_CALL_NO_SHOW_PATIENT(
                    doc.patientId.name,
                    doc.providerId.name
                  )
                );

                let htmlData = await ejs.renderFile(
                  path.join(__dirname, "../views/emailTemplate/email.ejs"),
                  {
                    user_name: adminUser.name,
                    content: NOTIFICATION_MESSAGE.VIDEO_CALL_NO_SHOW_PATIENT(
                      doc.patientId.name,
                      doc.providerId.name
                    ),
                  }
                );
                emailQueue(email, EMAIL_SUBJECT.VIDEO_CALL_NO_SHOW, htmlData);
                // await sendEmail(
                //   email,
                //   EMAIL_SUBJECT.VIDEO_CALL_NO_SHOW,
                //   htmlData
                // );

                SMSQueue(
                  COUNTRYCODE + doc.patientId.phone,
                  NOTIFICATION_MESSAGE.APPOINTMENT_MISSED()
                );

                htmlData = await ejs.renderFile(
                  path.join(__dirname, "../views/emailTemplate/email.ejs"),
                  {
                    user_name: doc.patientId.name,
                    content: NOTIFICATION_MESSAGE.APPOINTMENT_MISSED(),
                  }
                );
                emailQueue(
                  doc.patientId.email,
                  EMAIL_SUBJECT.VIDEO_CALL_NO_SHOW,
                  htmlData
                );
                // await sendEmail(
                //   doc.patientId.email,
                //   EMAIL_SUBJECT.VIDEO_CALL_NO_SHOW,
                //   htmlData
                // );
              }

              let query = {
                isAppointmentCompleted: true,
                canReBook: false,
                noShow: true,
                isCancelled: false,
              };
              await Appointment.findOneAndUpdate({ _id: appointmentId }, query);
            }
          }
        })
      );
      console.log("videoCallReminder cron executed");
      return;
    } catch (error) {
      console.error("Error - videoCallReminder", error);
      return;
    }
  },
  async interruptedAppointment() {
    try {
      let date = new Date();
      // console.log(date);
      date = moment().format("YYYY-MM-DD[T]HH:mm" + ":00");
      // console.log(date);
      let aggregate = [
        {
          $match: {
            availableSlotId: {
              $exists: true,
            },
            patientJoinedAt: {
              $exists: false,
            },
            physicianJoinedAt: {
              $exists: false,
            },
            isPatientJoined: {
              $exists: false,
            },
            isPhysicianJoined: {
              $exists: false,
            },
            isInterrupted: false,
            isAppointmentCompleted: false,
            noShow: false,
            isCancelled: false,
            isAppointmentStarted: false,
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
        { $unwind: { path: "$availableSlot" } },
        {
          $addFields: {
            endTime: {
              $dateToString: {
                format: "%Y-%m-%dT%H:%M:%S",
                date: "$availableSlot.endTime",
              },
            },
          },
        },
        {
          $match: {
            endTime: {
              $lte: date,
            },
          },
        },
      ];
      let appointmentData = await Appointment.aggregate(aggregate);
      // console.log(appointmentData);
      await Promise.all(
        _.map(appointmentData, async (doc) => {
          let result = await Appointment.findOneAndUpdate(
            { _id: doc._id },
            { isInterrupted: true },
            { new: true }
          ).populate(["patientId", "providerId"]);
          SMSQueue(
            COUNTRYCODE + result.patientId.phone,
            NOTIFICATION_MESSAGE.APPOINTMENT_MISSED()
          );
          SMSQueue(
            COUNTRYCODE + result.providerId.phone,
            NOTIFICATION_MESSAGE.APPOINTMENT_MISSED()
          );
          let htmlData = await ejs.renderFile(
            path.join(__dirname, "../views/emailTemplate/email.ejs"),
            {
              user_name: result.patientId.name,
              content: NOTIFICATION_MESSAGE.APPOINTMENT_MISSED(),
            }
          );
          emailQueue(
            result.patientId.email,
            EMAIL_SUBJECT.VIDEO_CALL_NO_SHOW,
            htmlData
          );
          htmlData = await ejs.renderFile(
            path.join(__dirname, "../views/emailTemplate/email.ejs"),
            {
              user_name: result.providerId.name,
              content: NOTIFICATION_MESSAGE.APPOINTMENT_MISSED(),
            }
          );
          emailQueue(
            result.providerId.email,
            EMAIL_SUBJECT.VIDEO_CALL_NO_SHOW,
            htmlData
          );
        })
      );
      console.log("interruptedAppointment cron executed");
      return;
    } catch (error) {
      console.error("Error - interruptedAppointment", error);
      return;
    }
  },

  async appointmentReminder() {
    try {
      let date = new Date();
      // console.log(date);
      date = moment().format("YYYY-MM-DD[T]HH:mm" + ":00");
      // console.log(date);
      let aggregate = [
        {
          $match: {
            availableSlotId: {
              $exists: true,
            },
            isCancelled: false,
            isAppointmentCompleted: false,
            isInterrupted: false,
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
        { $unwind: { path: "$availableSlot" } },
        {
          $addFields: {
            startTime: {
              $add: ["$availableSlot.startTime", 10 * 60000],
            },
          },
        },
        {
          $addFields: {
            startTime: {
              $dateToString: {
                format: "%Y-%m-%dT%H:%M:%S",
                date: "$startTime",
              },
            },
          },
        },
        {
          $match: {
            startTime: {
              $eq: date,
            },
          },
        },
      ];
      let appointmentData = await Appointment.aggregate(aggregate);
      // console.log(appointmentData);
      await Promise.all(
        _.map(appointmentData, async (doc) => {
          let result = await Appointment.findById(doc._id).populate([
            "patientId",
            "providerId",
          ]);
          SMSQueue(
            COUNTRYCODE + result.patientId.phone,
            NOTIFICATION_MESSAGE.APPOINTMENT_REMINDER()
          );
          SMSQueue(
            COUNTRYCODE + result.providerId.phone,
            NOTIFICATION_MESSAGE.APPOINTMENT_REMINDER()
          );
          notificationService.pushNotificationQueue(
            result.providerId,
            NOTIFICATION_TITLE.VIDEO_CALL_REMINDER,
            NOTIFICATION_MESSAGE.APPOINTMENT_REMINDER(),
            NOTIFICATION.ACTIONS["VIDEO_CALL_REMINDER"]
          );
          notificationService.pushNotificationQueue(
            result.patientId,
            NOTIFICATION_TITLE.VIDEO_CALL_REMINDER,
            NOTIFICATION_MESSAGE.APPOINTMENT_REMINDER(),
            NOTIFICATION.ACTIONS["VIDEO_CALL_REMINDER"]
          );
        })
      );
      console.log("appointmentReminder cron executed");
      return;
    } catch (error) {
      console.error("Error - appointmentReminder", error);
      return;
    }
  },

  async refundPatient() {
    try {
      let date = new Date();
      let aggregate = [
        {
          $match: {
            availableSlotId: {
              $exists: true,
            },
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
        { $unwind: { path: "$availableSlot" } },
        {
          $addFields: {
            endTime: { $add: ["$availableSlot.endTime", 2 * 24 * 60 * 60000] },
          },
        },
        {
          $match: {
            endTime: {
              $gte: date,
            },
          },
        },
        {
          $match: {
            isAppointmentCompleted: true,
            isTreatmentPaid: false,
            isCancelled: false,
            isPaid: true,
            isRefunded: false,
          },
        },
      ];
      let appointmentData = await Appointment.aggregate(aggregate);
      await Promise.all(
        _.map(appointmentData, async (doc) => {
          let appointmentSummaryData = await AppointmentSummary.find({
            appointmentId: doc._id,
          });
          if (
            appointmentSummaryData === undefined ||
            appointmentSummaryData === null
          ) {
            let refundStatus = await refundPatient(doc._id);
            if (refundStatus !== undefined || refundStatus !== null) {
              await Appointment.findOneAndUpdate(
                { _id: doc._id },
                { isRefunded: true }
              );
            }
          } else if (
            appointmentSummaryData.treatmentIds === undefined ||
            appointmentSummaryData.treatmentIds === null
          ) {
            let refundStatus = await refundPatient(doc._id);
            if (refundStatus !== undefined || refundStatus !== null) {
              await Appointment.findOneAndUpdate(
                { _id: doc._id },
                { isRefunded: true }
              );
            }
          }
        })
      );
      console.log("refundPatient cron executed");
      return;
    } catch (error) {
      console.error("Error - refundPatient", error);
      return;
    }
  },

  async deleteUnfilledAppointments() {
    try {
      let date = new Date();
      let aggregate = [
        {
          $match: {
            $or: [
              {
                availableSlotId: {
                  $exists: false,
                },
              },
              {
                providerId: {
                  $exists: false,
                },
              },
            ],
          },
        },
        {
          $addFields: {
            createdAt: { $add: ["$createdAt", 24 * 60 * 60000] },
          },
        },
        {
          $match: {
            createdAt: {
              $gte: date,
            },
          },
        },
      ];
      let appointmentData = await Appointment.aggregate(aggregate);
      await Promise.all(
        _.map(appointmentData, async (doc) => {
          await Appointment.deleteOne({ _id: doc._id });
        })
      );
      console.log("deleteUnfilledAppointments cron executed");
      return;
    } catch (error) {
      console.error("Error - deleteUnfilledAppointments", error);
      return;
    }
  },

  async followUpMailForTreatment() {
    try {
      let date = moment().format("YYYY-MM-DD");
      let aggregate = [
        {
          $match: {
            $and: [
              {
                firstFollowUpTreatmentMail: {
                  $exists: true,
                },
              },
            ],
          },
        },
        {
          $addFields: {
            firstFollowUpTreatmentMail: {
              $dateToString: {
                format: "%Y-%m-%d",
                date: "$firstFollowUpTreatmentMail",
              },
            },
          },
        },
        {
          $addFields: {
            secondFollowUpTreatmentMail: {
              $dateToString: {
                format: "%Y-%m-%d",
                date: "$secondFollowUpTreatmentMail",
              },
            },
          },
        },
      ];
      aggregate.push({
        $match: {
          firstFollowUpTreatmentMail: {
            $eq: date,
          },
        },
      });
      let appointmentData = await Appointment.aggregate(aggregate);
      await Promise.all(
        _.map(appointmentData, async (doc) => {
          let appointmentData = Appointment.findById(doc._id).populate([
            "patientId",
            "providerId",
          ]);
          const emailHTML = await ejs.renderFile(
            path.join(__dirname, "../views/emailTemplate/email.ejs"),
            {
              user_name: appointmentData.patientId.name,
              content: NOTIFICATION_MESSAGE.FOLLOWUP_REMINDER_10_WEEKS_PATIENT(
                appointmentData.APID,
                appointmentData.providerId.name
              ),
            }
          );
          emailQueue(
            appointmentData.patientId.email,
            EMAIL_SUBJECT.FOLLOWUP_REMINDER_10_WEEKS,
            emailHTML
          );
          // await sendSESEmail(
          //   appointmentData.patientId.email,
          //   EMAIL_SUBJECT.FOLLOWUP_REMINDER_10_WEEKS,
          //   emailHTML
          // );
          SMSQueue(
            COUNTRYCODE + appointmentData.patientId.phone,
            NOTIFICATION_MESSAGE.FOLLOWUP_REMINDER_10_WEEKS_PATIENT(
              appointmentData.APID,
              appointmentData.providerId.name
            )
          );
        })
      );
      aggregate.pop();
      aggregate.push(
        {
          $addFields: {
            date: { $subtract: ["$date", 24 * 60 * 60000] },
          },
        },
        {
          $match: {
            firstFollowUpTreatmentMail: {
              $eq: date,
            },
            appointmentFollowUpId: {
              $exists: true,
              $ne: null,
              $not: { $size: 0 },
            },
          },
        }
      );
      appointmentData = await Appointment.aggregate(aggregate);
      await Promise.all(
        _.map(appointmentData, async (doc) => {
          let appointmentData = Appointment.findById(doc._id).populate([
            "patientId",
            "providerId",
          ]);
          const emailHTML = await ejs.renderFile(
            path.join(__dirname, "../views/emailTemplate/email.ejs"),
            {
              user_name: appointmentData.providerId.name,
              content:
                NOTIFICATION_MESSAGE.FOLLOWUP_REMINDER_10_WEEKS_PHYSICIAN(
                  appointmentData.APID
                ),
            }
          );
          emailQueue(
            appointmentData.providerId.email,
            EMAIL_SUBJECT.FOLLOWUP_REMINDER_10_WEEKS,
            emailHTML
          );
          // await sendSESEmail(
          //   appointmentData.providerId.email,
          //   EMAIL_SUBJECT.FOLLOWUP_REMINDER_10_WEEKS,
          //   emailHTML
          // );
          SMSQueue(
            COUNTRYCODE + appointmentData.patientId.phone,
            NOTIFICATION_MESSAGE.FOLLOWUP_REMINDER_10_WEEKS_PHYSICIAN(
              appointmentData.APID
            )
          );
        })
      );
      aggregate.splice(aggregate.length - 2, 2);
      aggregate.push({
        $match: {
          secondFollowUpTreatmentMail: {
            $eq: date,
          },
        },
      });
      appointmentData = await Appointment.aggregate(aggregate);
      await Promise.all(
        _.map(appointmentData, async (doc) => {
          let appointmentData = Appointment.findById(doc._id).populate([
            "patientId",
            "providerId",
          ]);
          const emailHTML = await ejs.renderFile(
            path.join(__dirname, "../views/emailTemplate/email.ejs"),
            {
              user_name: appointmentData.patientId.name,
              content: NOTIFICATION_MESSAGE.FOLLOWUP_REMINDER_12_WEEKS_PATIENT(
                appointmentData.APID,
                appointmentData.providerId.name
              ),
            }
          );
          emailQueue(
            appointmentData.patientId.email,
            EMAIL_SUBJECT.FOLLOWUP_REMINDER_12_WEEKS,
            emailHTML
          );
          // await sendSESEmail(
          //   appointmentData.patientId.email,
          //   EMAIL_SUBJECT.FOLLOWUP_REMINDER_12_WEEKS,
          //   emailHTML
          // );
          SMSQueue(
            COUNTRYCODE + appointmentData.patientId.phone,
            NOTIFICATION_MESSAGE.FOLLOWUP_REMINDER_12_WEEKS_PATIENT(
              appointmentData.APID,
              appointmentData.providerId.name
            )
          );
        })
      );
      aggregate.pop();
      aggregate.push(
        {
          $addFields: {
            date: { $subtract: ["$date", 24 * 60 * 60000] },
          },
        },
        {
          $match: {
            secondFollowUpTreatmentMail: {
              $eq: date,
            },
            appointmentFollowUpId: {
              $exists: true,
              $ne: null,
              $not: { $size: 0 },
            },
          },
        }
      );
      appointmentData = await Appointment.aggregate(aggregate);
      await Promise.all(
        _.map(appointmentData, async (doc) => {
          let appointmentData = Appointment.findById(doc._id).populate([
            "patientId",
            "providerId",
          ]);
          const emailHTML = await ejs.renderFile(
            path.join(__dirname, "../views/emailTemplate/email.ejs"),
            {
              user_name: appointmentData.providerId.name,
              content:
                NOTIFICATION_MESSAGE.FOLLOWUP_REMINDER_12_WEEKS_PHYSICIAN(
                  appointmentData.APID
                ),
            }
          );
          emailQueue(
            appointmentData.providerId.email,
            EMAIL_SUBJECT.FOLLOWUP_REMINDER_12_WEEKS,
            emailHTML
          );
          // await sendSESEmail(
          //   appointmentData.providerId.email,
          //   EMAIL_SUBJECT.FOLLOWUP_REMINDER_12_WEEKS,
          //   emailHTML
          // );
          SMSQueue(
            COUNTRYCODE + appointmentData.patientId.phone,
            NOTIFICATION_MESSAGE.FOLLOWUP_REMINDER_12_WEEKS_PHYSICIAN(
              appointmentData.APID
            )
          );
        })
      );
      console.log("followUpMailForTreatment cron executed");
      return;
    } catch (error) {
      console.error("Error - followUpMailForTreatment", error);
      return;
    }
  },

  async treatmentPaymentReminder() {
    try {
      let date = moment().format("YYYY-MM-DD");
      let aggregate = [
        {
          $match: {
            $and: [
              { treatmentAvailable: true },
              { treatmentAssignedOn: { $exists: true } },
              { firstTreatmentReminderPaymentMail: { $exists: true } },
              { secondTreatmentReminderPaymentMail: { $exists: true } },
              {
                treatmentPaidOn: {
                  $exists: false,
                },
              },
            ],
          },
        },
        {
          $addFields: {
            firstTreatmentReminderPaymentMail: {
              $dateToString: {
                format: "%Y-%m-%d",
                date: "$firstTreatmentReminderPaymentMail",
              },
            },
          },
        },
        {
          $addFields: {
            secondTreatmentReminderPaymentMail: {
              $dateToString: {
                format: "%Y-%m-%d",
                date: "$secondTreatmentReminderPaymentMail",
              },
            },
          },
        },
      ];
      aggregate.push({
        $match: {
          firstTreatmentReminderPaymentMail: {
            $eq: date,
          },
        },
      });
      let appointmentData = await Appointment.aggregate(aggregate);
      await Promise.all(
        _.map(appointmentData, async (doc) => {
          let appointmentData = Appointment.findById(doc._id).populate([
            "patientId",
            "providerId",
          ]);
          await notificationService.create(
            appointmentData.patientId,
            NOTIFICATION_TITLE.TREATMENT_ASSIGNED,
            NOTIFICATION_MESSAGE.TREATMENT_PAYMENT_REMINDER_10_WEEKS(
              appointmentData.APID
            )
          );
          const emailHTML = await ejs.renderFile(
            path.join(__dirname, "../views/emailTemplate/email.ejs"),
            {
              user_name: appointmentData.patientId.name,
              content: NOTIFICATION_MESSAGE.TREATMENT_PAYMENT_REMINDER_10_WEEKS(
                appointmentData.APID
              ),
            }
          );
          emailQueue(
            appointmentData.patientId.email,
            EMAIL_SUBJECT.TREATMENT_PAYMENT_REMINDER_10_WEEKS,
            emailHTML
          );
          // await sendSESEmail(
          //   appointmentData.patientId.email,
          //   EMAIL_SUBJECT.FOLLOWUP_REMINDER_12_WEEKS,
          //   emailHTML
          // );
          SMSQueue(
            COUNTRYCODE + appointmentData.patientId.phone,
            NOTIFICATION_MESSAGE.TREATMENT_PAYMENT_REMINDER_10_WEEKS(
              appointmentData.APID
            )
          );
        })
      );
      aggregate.pop();
      aggregate.push({
        $match: {
          secondTreatmentReminderPaymentMail: {
            $eq: date,
          },
        },
      });
      appointmentData = await Appointment.aggregate(aggregate);
      await Promise.all(
        _.map(appointmentData, async (doc) => {
          let appointmentData = Appointment.findById(doc._id).populate([
            "patientId",
            "providerId",
          ]);
          await notificationService.create(
            appointmentData.patientId,
            NOTIFICATION_TITLE.TREATMENT_ASSIGNED,
            NOTIFICATION_MESSAGE.TREATMENT_PAYMENT_REMINDER_12_WEEKS(
              appointmentData.APID
            )
          );
          const emailHTML = await ejs.renderFile(
            path.join(__dirname, "../views/emailTemplate/email.ejs"),
            {
              user_name: appointmentData.patientId.name,
              content: NOTIFICATION_MESSAGE.TREATMENT_PAYMENT_REMINDER_12_WEEKS(
                appointmentData.APID
              ),
            }
          );
          emailQueue(
            appointmentData.patientId.email,
            EMAIL_SUBJECT.TREATMENT_PAYMENT_REMINDER_12_WEEKS,
            emailHTML
          );
          // await sendSESEmail(
          //   appointmentData.patientId.email,
          //   EMAIL_SUBJECT.FOLLOWUP_REMINDER_12_WEEKS,
          //   emailHTML
          // );
          SMSQueue(
            COUNTRYCODE + appointmentData.patientId.phone,
            NOTIFICATION_MESSAGE.TREATMENT_PAYMENT_REMINDER_12_WEEKS(
              appointmentData.APID
            )
          );
        })
      );
      console.log("treatmentPaymentReminder cron executed");
      return;
    } catch (error) {
      console.error("Error - treatmentPaymentReminder", error);
      return;
    }
  },
};
