const message = require("../../../utils/messages");
const responseCode = require("../../../utils/responseCode");
const db = require("../../../config/db");
const Role = require("../../../model/role")(db);
const User = require("../../../model/user")(db);
const Transaction = require("../../../model/transaction")(db);
const Master = require("../../../model/master")(db);
const userActivity = require("../../../model/userActivity")(db);
const Appointment = require("../../../model/appointment")(db);
const mongoose = require("mongoose");
const QuestionnaireResponse = require("../../../model/questionnaireResponse")(
  db
);
const {
  USER_ROLE,
  PAYMENT_STATUS,
  TRANSACTION_LOG,
  COUNTRYCODE,
  CALL_STATUS,
  BUFFERAVAILABLESLOT_IN_DAYS,
  APPOINTMENT_REMINDER,
  EMAIL_SUBJECT,
  EMAIL_CONTENT,
  SMS_MESSAGE,
  NOTIFICATION_TITLE,
} = require("../../../config/authConstant");
const { MASTER, POPULATE } = require("../../../config/constant/user");
const _ = require("lodash");
const ObjectId = require("mongodb").ObjectId;
const ejs = require("ejs");
const path = require("path");
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
const { NOTIFICATION_MESSAGE } = require("../../../config/message");
const notificationService = require("../../../services/notification");
const { NOTIFICATION } = require("../../../config/constant/notification");
const { FirebaseDynamicLinks } = require("firebase-dynamic-links");
const { ISO_8601 } = require("moment-timezone");

function makeUserController({ userService, makeUser, authService }) {
  const addUser = async ({ data }, i18n) => {
    try {
      const originalData = data;

      const user = makeUser(originalData, "insertUserValidator");
      let createdUser = await userService.createDocument(user);

      return message.successResponse(
        { "Content-Type": "application/json" },
        responseCode.success,
        createdUser,
        i18n.t("user.admin_createPhysician")
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
  const findAllUser = async ({ data }) => {
    try {
      let options = {};
      let query = {};
      let result;
      if (data.query.roleIds == USER_ROLE.Physician) {
        const roleCodes = await Role.find({
          code: USER_ROLE.Physician,
        });
        data.query.roleIds = roleCodes[0]._id;
      } else if (data.query.roleIds == USER_ROLE.Patient) {
        const roleCodes = await Role.find({
          code: USER_ROLE.Patient,
        });
        data.query.roleIds = roleCodes[0]._id;
      }

      if (data.isCountOnly) {
        if (data.query !== undefined) {
          query = { ...data.query };
        }
        result = await userService.countDocument(query);
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
        if (data.options !== undefined) {
          options = { ...data.options };
        }
        if (data.query !== undefined) {
          query = { ...data.query };
        }
        result = await userService.getAllDocuments(query, options);
      }

      if (result) {
        return message.successResponse(
          { "Content-Type": "application/json" },
          responseCode.success,
          result
        );
      } else {
        return message.badRequest(
          { "Content-Type": "application/json" },
          responseCode.badRequest,
          {}
        );
      }
    } catch (error) {
      return message.failureResponse(
        { "Content-Type": "application/json" },
        responseCode.internalServerError,
        error.message
      );
    }
  };
  const userRevenue = async (id) => {
    try {
      if (id) {
        let aggregate = [];
        let userRole = await User.findOne({ _id: id }).populate(["roleIds"]);
        let status = await Master.findOne({
          code: PAYMENT_STATUS.SUCCESS,
        }).select("_id");
        if (userRole.roleIds[0].code === USER_ROLE.Physician) {
          aggregate = [
            {
              $match: {
                providerId: ObjectId(id),
              },
            },
            {
              $group: {
                _id: "$providerId",
                totalRevenue: {
                  $sum: {
                    $cond: [
                      {
                        $and: [
                          {
                            $eq: [ObjectId(status._id), "$status"],
                          },
                          {
                            $eq: [
                              TRANSACTION_LOG.TRANSACTION_TYPE.CREDIT,
                              "$type",
                            ],
                          },
                        ],
                      },
                      "$physicianAmount",
                      0,
                    ],
                  },
                },
              },
            },
          ];
        } else if (userRole.roleIds[0].code === USER_ROLE.Patient) {
          aggregate = [
            {
              $match: {
                patientId: ObjectId(id),
              },
            },
            {
              $group: {
                _id: "$patientId",
                totalRevenue: {
                  $sum: {
                    $cond: [
                      {
                        $and: [
                          {
                            $eq: [ObjectId(status._id), "$status"],
                          },
                          {
                            $eq: [
                              TRANSACTION_LOG.TRANSACTION_TYPE.CREDIT,
                              "$type",
                            ],
                          },
                        ],
                      },
                      "$amount",
                      0,
                    ],
                  },
                },
              },
            },
          ];
        }
        const result = await Transaction.aggregate(aggregate);
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
  const totalAppointment = async (id) => {
    try {
      if (id) {
        let aggregate = [];
        let userRole = await User.findOne({ _id: id }).populate(["roleIds"]);
        if (userRole.roleIds[0].code === USER_ROLE.Physician) {
          aggregate = [
            {
              $match: {
                providerId: ObjectId(id),
                availableSlotId: { $exists: true },
                isBooked: true,
              },
            },
            {
              $group: {
                _id: "$providerId",
                total: {
                  $sum: 1,
                },
              },
            },
          ];
        } else if (userRole.roleIds[0].code === USER_ROLE.Patient) {
          aggregate = [
            {
              $match: {
                patientId: ObjectId(id),
                availableSlotId: { $exists: true },
                isBooked: true,
              },
            },
            {
              $group: {
                _id: "$patientId",
                total: {
                  $sum: 1,
                },
              },
            },
          ];
        }
        const result = await Appointment.aggregate(aggregate);
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
  const getUserById = async (id) => {
    try {
      if (id) {
        const user = await User.findOne({ _id: id }).populate(POPULATE);
        return message.successResponse(
          { "Content-Type": "application/json" },
          responseCode.success,
          user
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
  const getUserCount = async (data) => {
    try {
      let where = {};
      if (data.where) {
        where = data.where;
      }
      let result = await userService.countDocument(where);
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
  const getUserByAggregate = async ({ data }) => {
    try {
      if (data) {
        let result = await userService.getDocumentByAggregation(data);
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
  const updateUser = async (data, id) => {
    try {
      if (id && data) {
        if (data) {
          data = _.omit(data, [
            "password",
            "emails",
            "phones",
            "roleIds",
            // "isActive",
            "isDeleted",
            // "isApproved",
          ]);
        }
        const filterData = data;
        let updatedUser = await userService.findOneAndUpdateDocument(
          { _id: id },
          filterData,
          { new: true }
        );
        if (updatedUser) {
          if (data.isApproved != undefined && data.isApproved === true) {
            await notificationService.create(
              updatedUser._id,
              NOTIFICATION_TITLE.PHYSICIAN_APPROVED,
              NOTIFICATION_MESSAGE.PHYSICIAN_APPROVED()
            );
          }
          if (data.isActive != undefined && data.isActive === false) {
            const emailHTML = await ejs.renderFile(
              path.join(__dirname, "../../../views/emailTemplate/email.ejs"),
              {
                user_name: updatedUser.name,
                content: NOTIFICATION_MESSAGE.DEACTIVATION(),
              }
            );
            emailQueue(
              updatedUser.email,
              EMAIL_SUBJECT.DEACTIVATION,
              emailHTML
            );
            SMSQueue(
              COUNTRYCODE + updatedUser.phone,
              NOTIFICATION_MESSAGE.DEACTIVATION()
            );
            notificationService.pushNotificationQueue(
              updatedUser._id,
              NOTIFICATION_TITLE.PHYSICIAN_DEACTIVATED,
              NOTIFICATION_MESSAGE.DEACTIVATION(),
              NOTIFICATION.ACTIONS["PHYSICIAN_DEACTIVATED"]
            );
          }
        }
        return message.successResponse(
          { "Content-Type": "application/json" },
          responseCode.success,
          updatedUser
        );
      }
      return message.badRequest(
        { "Content-Type": "application/json" },
        responseCode.badRequest,
        {}
      );
    } catch (error) {
      console.error("Error - updateUser Admin", error);
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
  const softDeleteUser = async (id) => {
    try {
      const deleteDependentService = require("../../../utils/deleteDependent");
      let pos = [
        {
          model: "chat",
          refId: "fromId",
        },
        {
          model: "messages",
          refId: "fromId",
        },
        {
          model: "invoice",
          refId: "patientId",
        },
        {
          model: "invoice",
          refId: "providerId",
        },
        {
          model: "userActivity",
          refId: "userId",
        },
        {
          model: "userActivity",
          refId: "adminId",
        },
        {
          model: "appointmentSummary",
          refId: "patientId",
        },
        {
          model: "appointmentSummary",
          refId: "providerId",
        },
        {
          model: "order",
          refId: "patientId",
        },
        {
          model: "order",
          refId: "providerId",
        },
        {
          model: "appointment",
          refId: "cancelledBy",
        },
        {
          model: "appointment",
          refId: "providerId",
        },
        {
          model: "ratingReview",
          refId: "to",
        },
        {
          model: "ratingReview",
          refId: "from",
        },
        {
          model: "ratingReview",
          refId: "appointmentId",
        },
        {
          model: "transaction",
          refId: "transactionBy",
        },
        {
          model: "transaction",
          refId: "providerId",
        },
        {
          model: "transaction",
          refId: "appointmentId",
        },
        {
          model: "providerSlot",
          refId: "userId",
        },
        {
          model: "userRole",
          refId: "userId",
        },
      ];
      await userService.softDeleteDocument(id);
      let result = await deleteDependentService.softDeleteUser({ _id: id });
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
  const bulkInsertUser = async ({ body }) => {
    try {
      let data = body.data;
      const userEntities = body.data.map((item) =>
        makeUser(item, "insertUserValidator")
      );
      const results = await userService.bulkInsert(userEntities);
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
  const bulkUpdateUser = async (data) => {
    try {
      if (data.filter && data.data) {
        const user = makeUser(data.data, "updateUserValidator");
        const filterData = removeEmpty(user);
        const updatedUsers = await userService.bulkUpdate(
          data.filter,
          filterData
        );
        return message.successResponse(
          { "Content-Type": "application/json" },
          responseCode.success,
          updatedUsers
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
  const deleteUser = async (data, id) => {
    try {
      let possibleDependent = [
        {
          model: "chat",
          refId: "fromId",
        },
        {
          model: "messages",
          refId: "fromId",
        },
        {
          model: "invoice",
          refId: "patientId",
        },
        {
          model: "invoice",
          refId: "providerId",
        },
        {
          model: "userActivity",
          refId: "userId",
        },
        {
          model: "userActivity",
          refId: "adminId",
        },
        {
          model: "appointmentSummary",
          refId: "patientId",
        },
        {
          model: "appointmentSummary",
          refId: "providerId",
        },
        {
          model: "order",
          refId: "patientId",
        },
        {
          model: "order",
          refId: "providerId",
        },
        {
          model: "appointment",
          refId: "cancelledBy",
        },
        {
          model: "appointment",
          refId: "providerId",
        },
        {
          model: "ratingReview",
          refId: "to",
        },
        {
          model: "ratingReview",
          refId: "from",
        },
        {
          model: "ratingReview",
          refId: "appointmentId",
        },
        {
          model: "transaction",
          refId: "transactionBy",
        },
        {
          model: "transaction",
          refId: "providerId",
        },
        {
          model: "transaction",
          refId: "appointmentId",
        },
        {
          model: "providerSlot",
          refId: "userId",
        },
        {
          model: "userRole",
          refId: "userId",
        },
      ];
      const deleteDependentService = require("../../../utils/deleteDependent");
      if (data.isWarning) {
        let all = await deleteDependentService.countUser({ _id: id });
        return message.successResponse(
          { "Content-Type": "application/json" },
          responseCode.success,
          all
        );
      } else {
        let result = await deleteDependentService.deleteUser({ _id: id });
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
  const changePassword = async (params) => {
    try {
      if (!params.newPassword || !params.userId || !params.oldPassword) {
        return message.inValidParam(
          { "Content-Type": "application/json" },
          responseCode.validationError,
          "Please Provide userId and new Password and Old password"
        );
      }
      let result = await authService.changePassword(params);
      if (!result.flag) {
        return message.successResponse(
          { "Content-Type": "application/json" },
          responseCode.success,
          result.data
        );
      }
      return message.failureResponse(
        { "Content-Type": "application/json" },
        responseCode.internalServerError,
        result.data
      );
    } catch (error) {
      return message.failureResponse(
        { "Content-Type": "application/json" },
        responseCode.internalServerError,
        error.message
      );
    }
  };

  const updateProfile = async (data, id) => {
    try {
      if (id && data) {
        if (data.password) delete data.password;
        if (data.createdAt) delete data.createdAt;
        if (data.updatedAt) delete data.updatedAt;
        if (data.id) delete data.id;
        const user = makeUser(data, "updateUserValidator");
        const filterData = removeEmpty(user);
        let updatedUser = await userService.findOneAndUpdateDocument(
          { _id: id },
          filterData,
          { new: true }
        );
        return message.successResponse(
          { "Content-Type": "application/json" },
          responseCode.success,
          updatedUser
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

  const getPatientsByProviderId = async (data) => {
    try {
      if (
        data.query.providerId != undefined &&
        mongoose.Types.ObjectId.isValid(data.query.providerId)
      ) {
        let queryBe = { providerId: data.query.providerId };
        let patientIdsFromAppointments = await Appointment.find(queryBe)
          .distinct("patientId")
          .lean();

        let options = {};
        let patients;
        if (data.options !== undefined) {
          options = { ...data.options };
        }
        let nQuery = { _id: { $in: patientIdsFromAppointments } };
        if (data.query["$or"] != undefined) {
          nQuery["$or"] = data.query["$or"];
        }
        if (data.isCountOnly === true) {
          patients = await userService.countDocument(nQuery);
          if (patients) {
            patients = { totalRecords: patients };
          } else {
            return message.recordNotFound(
              { "Content-Type": "application/json" },
              responseCode.success,
              []
            );
          }
        } else {
          patients = await userService.getAllDocuments(nQuery, options);
          let patientDoc = patients.docs != undefined ? "docs" : "data";
          for (let i = 0; i < patients[patientDoc].length; i++) {
            let lastAppointmentAt = await Appointment.findOne({
              patientId: patients[patientDoc][i]._id,
              availableSlotId: { $exists: true },
            })
              .select("updatedAt  availableSlotId specialisationId APID")
              .populate({
                path: "availableSlotId",
                select: "startTime -_id",
              })
              .populate({
                path: "specialisationId",
                select: "name",
              })
              .sort({ updatedAt: -1 });
            if (lastAppointmentAt != null) {
              patients[patientDoc][i].lastVisitedOn =
                lastAppointmentAt.availableSlotId.startTime;
              patients[patientDoc][i].APID = lastAppointmentAt.APID;
              if (lastAppointmentAt.specialisationId != null) {
                patients[patientDoc][i].lastTreatment =
                  lastAppointmentAt.specialisationId.name;
              }
            }
          }
        }
        return message.successResponse(
          { "Content-Type": "application/json" },
          responseCode.success,
          patients
        );
      } else {
        return message.failureResponse(
          { "Content-Type": "application/json" },
          responseCode.badRequest,
          "Provider Id is Required!"
        );
      }
    } catch (error) {
      console.error("Error - getPatientsByProviderId Admin", error);
      return message.failureResponse(
        { "Content-Type": "application/json" },
        responseCode.internalServerError,
        error.message
      );
    }
  };

  const getPhotoGallery = async (data) => {
    try {
      const patientId = data.patientId;
      let photosFromQuestionnaire = await QuestionnaireResponse.aggregate([
        {
          $lookup: {
            from: "appointment",
            localField: "appointmentId",
            foreignField: "_id",
            as: "appointment",
          },
        },
        {
          $match: {
            userId: mongoose.Types.ObjectId(patientId),
            "appointment.0": { $exists: true },
            "answerImageIds.0": { $exists: true },
          },
        },
        { $unwind: "$answerImageIds" },
        { $unwind: "$appointment" },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            apId: { $first: "$appointment.APID" },
            answerImages: { $push: "$answerImageIds" },
          },
        },
        { $sort: { _id: 1 } },
        {
          $lookup: {
            from: "file",
            localField: "answerImages",
            foreignField: "_id",
            as: "answerImages",
          },
        },
        {
          $project: {
            _id: 1,
            apId: 1,
            totalImages: { $size: "$answerImages" },
            answerImages: 1,
          },
        },
      ]).exec();

      return message.successResponse(
        { "Content-Type": "application/json" },
        responseCode.success,
        photosFromQuestionnaire
      );
    } catch (error) {
      console.error("Error - getPatientsByProviderId Admin", error);
      return message.failureResponse(
        { "Content-Type": "application/json" },
        responseCode.internalServerError,
        error.message
      );
    }
  };

  const getUserActivity = async (data) => {
    try {
      let aggregate = [];
      aggregate.push(
        {
          $lookup: {
            from: "user",
            localField: "userId",
            foreignField: "_id",
            as: "userId",
          },
        },
        {
          $unwind: "$userId",
        },
        {
          $unwind: "$userId.roleIds",
        },
        {
          $project: {
            _id: 1,
            "userId._id": 1,
            "userId.roleIds": 1,
          },
        }
      );

      if (data.query && !_.isEmpty(data.query)) {
        let filterQuery = {};
        if (
          data.query.userId &&
          data.query.userId != null &&
          data.query.userId != ""
        ) {
          filterQuery["userId._id"] = mongoose.Types.ObjectId(
            data.query.userId
          );
        }
        if (
          data.query.roleId &&
          data.query.roleId != null &&
          data.query.roleId != ""
        ) {
          filterQuery["userId.roleIds"] = mongoose.Types.ObjectId(
            data.query.roleId
          );
        }
        aggregate.push({ $match: filterQuery });
      }
      aggregate.push({ $project: { _id: 1 } });
      let aggregateResult = await userActivity.aggregate(aggregate).exec();
      let activityIds = aggregateResult.map((element) => {
        return element._id;
      });
      // console.log(activityIds.length);
      if (data.query) {
        delete data.query.userId;
        delete data.query.roleId;
      }

      data.query._id = { $in: activityIds };
      let result = await userActivity.paginate(data.query, data.options);
      return message.successResponse(
        { "Content-Type": "application/json" },
        responseCode.success,
        result
      );
    } catch (error) {
      console.error("Error - getPatientsByProviderId Admin", error);
      return message.failureResponse(
        { "Content-Type": "application/json" },
        responseCode.internalServerError,
        error.message
      );
    }
  };

  const sendResetPasswordLink = async ({ req }) => {
    try {
      const firebaseDynamicLinks = new FirebaseDynamicLinks(
        process.env.FIREBASE_WEB_API_KEY
      );
      let user = await User.findOne({ _id: req.body.userId });
      const { shortLink } = await firebaseDynamicLinks.createLink({
        longDynamicLink: `https://qr8.page.link/?link=https://qr8/welcome?email=${user.email}&type=reset_password_link&apn=com.qr8&ibn=com.qr8`,
      });

      const emailHTML = await ejs.renderFile(
        path.join(__dirname, "../../../views/emailTemplate/email.ejs"),
        {
          user_name: user.name,
          content: NOTIFICATION_MESSAGE.RESET_PASSWORD_LINK(shortLink),
        }
      );
      emailQueue(user.email, EMAIL_SUBJECT.RESET_PASSWORD_LINK, emailHTML);
      if (shortLink) {
        await User.findOneAndUpdate(
          { _id: req.body.userId },
          { resetPasswordLinkUsed: false }
        );
        return message.successResponse(
          { "Content-Type": "application/json" },
          responseCode.success,
          shortLink,
          req.i18n.t("user.reset_password_link")
        );
      }
    } catch (error) {
      console.error("Error - sendResetPasswordLink Admin", error);
      return message.failureResponse(
        { "Content-Type": "application/json" },
        responseCode.internalServerError,
        error.message
      );
    }
  };

  const sendInviteLink = async ({ req }) => {
    try {
      let emailExists = await User.findOne({ email: req.body.email });
      let phoneExists = await User.findOne({ phone: req.body.phone });
      if (emailExists) {
        throw new Error("Account exists with this email");
      } else if (phoneExists) {
        throw new Error("Account exists with this phone");
      }
      const firebaseDynamicLinks = new FirebaseDynamicLinks(
        process.env.FIREBASE_WEB_API_KEY
      );
      const { shortLink } = await firebaseDynamicLinks.createLink({
        longDynamicLink: process.env.INVITE_LINK,
      });

      const emailHTML = await ejs.renderFile(
        path.join(__dirname, "../../../views/emailTemplate/email.ejs"),
        {
          user_name: req.body.firstName + " " + req.body.lastName,
          content: NOTIFICATION_MESSAGE.INVITE_LINK(shortLink),
        }
      );
      emailQueue(req.body.email, EMAIL_SUBJECT.INVITE_LINK, emailHTML);
      if (shortLink) {
        return message.successResponse(
          { "Content-Type": "application/json" },
          responseCode.success,
          shortLink,
          req.i18n.t("user.reset_password_link")
        );
      }
    } catch (error) {
      console.error("Error - sendInviteLink Admin", error);
      return message.failureResponse(
        { "Content-Type": "application/json" },
        responseCode.internalServerError,
        error.message
      );
    }
  };

  return Object.freeze({
    addUser,
    findAllUser,
    getUserById,
    userRevenue,
    totalAppointment,
    getUserCount,
    getUserByAggregate,
    updateUser,
    softDeleteUser,
    bulkInsertUser,
    bulkUpdateUser,
    deleteUser,
    removeEmpty,
    changePassword,
    updateProfile,
    getPatientsByProviderId,
    getPhotoGallery,
    getUserActivity,
    sendResetPasswordLink,
    sendInviteLink,
  });
}

module.exports = makeUserController;
