const message = require("../../../utils/messages");
const responseCode = require("../../../utils/responseCode");
const db = require("../../../config/db");
const userModel = require("../../../model/user")(db);
const Role = require("../../../model/role")(db);
const Appointments = require("../../../model/appointment")(db);
const QuestionnaireResponse = require("../../../model/questionnaireResponse")(
  db
);
const mongoose = require("mongoose");
const { MASTER, POPULATE } = require("../../../config/constant/user");
const {
  EMAIL_SUBJECT,
  EMAIL_CONTENT,
  SMS_MESSAGE,
  COUNTRYCODE,
  NOTIFICATION_TITLE,
  TIMEZONE,
} = require("../../../config/authConstant");
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
const ejs = require("ejs");
const path = require("path");
const { MESSAGE, NOTIFICATION_MESSAGE } = require("../../../config/message");
const notificationService = require("../../../services/notification");
const { NOTIFICATION } = require("../../../config/constant/notification");

function makeUserController({ userService, makeUser, authService }) {
  const addUser = async ({ data }) => {
    try {
      const originalData = data;

      const user = makeUser(originalData, "insertUserValidator");
      let createdUser = await userService.createDocument(user);

      return message.successResponse(
        { "Content-Type": "application/json" },
        responseCode.success,
        createdUser
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
        if (options.populate) {
          delete options.populate;
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
  const getUserById = async (id, i18n) => {
    try {
      if (id) {
        const user = await userModel.findOne({ _id: id }).populate(POPULATE);
        return message.successResponse(
          { "Content-Type": "application/json" },
          responseCode.success,
          user,
          i18n.t("user.getProfile")
        );
      }
      return message.badRequest(
        { "Content-Type": "application/json" },
        responseCode.badRequest,
        {},
        i18n.t("response_message.badRequest")
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
  const updateUser = async (data, id, i18n) => {
    try {
      if (id && data) {
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
          updatedUser,
          i18n.t("user.updateProfile")
        );
      }
      return message.badRequest(
        { "Content-Type": "application/json" },
        responseCode.badRequest,
        {},
        i18n.t("response_message.badRequest")
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
  const changePassword = async (params, i18n) => {
    try {
      if (!params.newPassword || !params.userId || !params.oldPassword) {
        return message.inValidParam(
          { "Content-Type": "application/json" },
          responseCode.validationError,
          i18n.t("user.get_parameters")
        );
      }
      let result = await authService.changePassword(params);
      if (!result.flag) {
        return message.successResponse(
          { "Content-Type": "application/json" },
          responseCode.success,
          result.data,
          i18n.t("auth.change_password")
        );
      }
      return message.failureResponse(
        { "Content-Type": "application/json" },
        responseCode.internalServerError,
        result.data,
        i18n.t("response_message.server_error")
      );
    } catch (error) {
      return message.failureResponse(
        { "Content-Type": "application/json" },
        responseCode.internalServerError,
        error.message
      );
    }
  };

  const getUserData = async (id) => {
    let populate = [
      { path: "specialisations", select: "name description" },
      { path: "languageIds", select: "name code" },
      // {path: "occupation",select:'name code'},
      {
        path: "practiceAddressId",
        populate: [
          { path: "countryId", select: "name code", model: "country" },
          {
            path: "provinceId",
            select: "name code countryId",
            model: "province",
          },
          { path: "cityId", select: "name code provinceId", model: "city" },
          {
            path: "postalCodeId",
            select: "postalCode cityId",
            model: "postalCode",
          },
        ],
      },
      "profilePictureId",
      {
        path: "shippingAddress",
        populate: [
          { path: "countryId", select: "name code", model: "country" },
          {
            path: "provinceId",
            select: "name code countryId",
            model: "province",
          },
          { path: "cityId", select: "name code provinceId", model: "city" },
          {
            path: "postalCodeId",
            select: "postalCode cityId",
            model: "postalCode",
          },
        ],
      },
      { path: "genderId", select: "name code" },
      { path: "hearAboutUs", select: "name code" },
      "libraryPhotos",
      { path: "deactivationReason", select: "name code" },
      { path: "roleIds", select: "name code" },
    ];
    return await userModel.findById(id).populate(populate);
  };
  const getProfile = async (id, i18n) => {
    try {
      let user = await getUserData(id);
      return message.successResponse(
        { "Content-Type": "application/json" },
        responseCode.success,
        user,
        i18n.t("user.getProfile")
      );
    } catch (error) {
      console.error(error);
      return message.failureResponse(
        { "Content-Type": "application/json" },
        responseCode.internalServerError,
        error.message
      );
    }
  };
  const updateProfile = async (data, id, i18n) => {
    try {
      if (id && data) {
        if (data.password) delete data.password;
        if (data.createdAt) delete data.createdAt;
        if (data.updatedAt) delete data.updatedAt;
        if (data.emails) delete data.emails;
        if (data.email) delete data.email;
        if (data.phones) delete data.phones;
        if (data.phone) delete data.phone;
        if (data.id) delete data.id;
        // const user = makeUser(data,'updateUserValidator');
        // console.log("user", user);
        // const filterData = removeEmpty(user);
        await userModel
          .findOneAndUpdate({ _id: id }, data, {
            new: true,
          })
          .populate(POPULATE);
        let user = await getUserData(id);
        return message.successResponse(
          { "Content-Type": "application/json" },
          responseCode.success,
          user,
          i18n.t("user.updateProfile")
        );
      }
      return message.badRequest(
        { "Content-Type": "application/json" },
        responseCode.badRequest,
        {},
        i18n.t("response_message.badRequest")
      );
    } catch (error) {
      console.error(error);
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

  const changeDetails = async (data, user, i18n) => {
    try {
      let id = user.id;
      // let userData = userModel.findById(id);
      if (id && data && (data.email || data.phone)) {
        let updateData = {};
        if (
          (data.email !== undefined && data.email == user.email) ||
          (data.phone !== undefined && data.phone == user.phone)
        ) {
          return message.badRequest(
            { "Content-Type": "application/json" },
            responseCode.badRequest,
            i18n.t("user.different_details")
          );
        }
        if (data.email) {
          const emailOTP = Math.floor(100000 + Math.random() * 900000);
          const htmlData = await ejs.renderFile(
            path.join(__dirname, "../../../views/emailTemplate/email.ejs"),
            {
              user_name: user.name,
              content: NOTIFICATION_MESSAGE.OTP(emailOTP),
            }
          );
          emailQueue(data.email, EMAIL_SUBJECT.OTP, htmlData);
          updateData = {
            temporaryEmails: {
              email: data.email,
              verificationCode: emailOTP || MASTER.OTP,
              isVerified: false,
            },
          };
        } else if (data.phone) {
          let requestId = await sendOTP(COUNTRYCODE + data.phone);
          // console.log(requestId);
          await userModel.findOneAndUpdate(
            { _id: id },
            { requestId: requestId.requestId }
          );
          updateData = {
            temporaryPhones: {
              phone: data.phone,
              isVerified: false,
            },
          };
        }

        await userService.findOneAndUpdateDocument({ _id: id }, updateData, {
          new: true,
        });
        return message.successResponse(
          { "Content-Type": "application/json" },
          responseCode.success,
          i18n.t("user.otp_sent")
        );
      }
      return message.inValidParam(
        { "Content-Type": "application/json" },
        responseCode.validationError,
        i18n.t("response_message.inValidParam")
      );
    } catch (error) {
      console.error(error);
      return message.failureResponse(
        { "Content-Type": "application/json" },
        responseCode.internalServerError,
        error.message
      );
    }
  };
  const verifyDetails = async (data, user, i18n) => {
    try {
      let id = user.id;
      // let userData = userModel.findById(id);
      if (id && data && (data.email || data.phone)) {
        let updateData = {};
        if (
          data.otp !== undefined &&
          ((user.temporaryEmails.verificationCode !== undefined &&
            user.temporaryEmails.verificationCode !== data.otp) ||
            (user.temporaryPhones.verificationCode !== undefined &&
              user.temporaryPhones.verificationCode !== data.otp))
        ) {
          return message.inValidParam(
            { "Content-Type": "application/json" },
            responseCode.validationError,
            i18n.t("auth.otp_invalid")
          );
        }
        if (
          (data.email !== undefined &&
            user.temporaryEmails.email !== undefined &&
            data.email !== user.temporaryEmails.email) ||
          (data.phone !== undefined &&
            user.temporaryPhones.phone !== undefined &&
            data.phone !== user.temporaryPhones.phone)
        ) {
          return message.inValidParam(
            { "Content-Type": "application/json" },
            responseCode.validationError,
            i18n.t("response_message.inValidParam")
          );
        }
        if (data.email) {
          if (
            data.otp == user.temporaryEmails.verificationCode ||
            data.otp == MASTER.OTP
          ) {
            let emails = [
              {
                isApproved: true,
                isDefault: true,
                email: data.email,
                isVerified: true,
              },
            ];
            updateData = {
              emails: emails,
              temporaryEmails: {
                email: data.email,
                isVerified: true,
              },
              email: data.email,
            };
          }
        } else if (data.phone) {
          let otpVerify = await verifyOTP(user.requestId, data.otp);
          // console.log(otpVerify);
          if (otpVerify.verified) {
            updateData = {
              temporaryPhones: {
                phone: data.phone,
                isVerified: true,
              },
              phones: [
                {
                  phone: data.phone,
                  isVerified: true,
                  isDefault: true,
                },
              ],
              phone: data.phone,
            };
          }
        }

        let updatedUser = await userService.findOneAndUpdateDocument(
          { _id: id },
          updateData,
          {
            new: true,
          }
        );
        if (updatedUser != undefined) {
          if (data.email != undefined) {
            const emailHTML = await ejs.renderFile(
              path.join(__dirname, "../../../views/emailTemplate/email.ejs"),
              {
                user_name: updatedUser.name,
                content: NOTIFICATION_MESSAGE.EMAIL_CHANGED(),
              }
            );
            emailQueue(
              updatedUser.email,
              EMAIL_SUBJECT.EMAIL_CHANGED,
              emailHTML
            );
            notificationService.pushNotificationQueue(
              updatedUser._id,
              NOTIFICATION_TITLE.EMAIL_CHANGED,
              NOTIFICATION_MESSAGE.EMAIL_CHANGED(),
              NOTIFICATION.ACTIONS["USER_UPDATED"]
            );
          }
          if (data.phone != undefined) {
            SMSQueue(
              COUNTRYCODE + updatedUser.phone,
              NOTIFICATION_MESSAGE.CONTACT_CHANGED()
            );
            notificationService.pushNotificationQueue(
              updatedUser._id,
              NOTIFICATION_TITLE.CONTACT_CHANGED,
              NOTIFICATION_MESSAGE.CONTACT_CHANGED(),
              NOTIFICATION.ACTIONS["USER_UPDATED"]
            );
          }
        }
        return message.successResponse(
          { "Content-Type": "application/json" },
          responseCode.success,
          i18n.t("auth.email_verify_success")
        );
      }
      return message.inValidParam(
        { "Content-Type": "application/json" },
        responseCode.validationError,
        i18n.t("response_message.inValidParam")
      );
    } catch (error) {
      console.error(error);
      return message.failureResponse(
        { "Content-Type": "application/json" },
        responseCode.internalServerError,
        error.message
      );
    }
  };

  const getPatientsByProviderId = async (data, i18n) => {
    try {
      if (
        data.query.providerId != undefined &&
        mongoose.Types.ObjectId.isValid(data.query.providerId)
      ) {
        let queryBe = { providerId: data.query.providerId };
        let patientIdsFromAppointments = await Appointments.find(queryBe)
          .distinct("patientId")
          .lean();

        let options = {};
        if (data.options !== undefined) {
          options = { ...data.options };
        }
        let nQuery = { _id: { $in: patientIdsFromAppointments } };
        if (data.query["$or"] != undefined) {
          nQuery["$or"] = data.query["$or"];
        }
        let patients = await userService.getAllDocuments(nQuery, options);
        let patientDoc = patients.docs != undefined ? "docs" : "data";
        for (let i = 0; i < patients[patientDoc].length; i++) {
          let lastAppointmentAt = await Appointments.findOne({
            patientId: patients[patientDoc][i]._id,
            availableSlotId: { $exists: true },
          })
            .select("APID patientId updatedAt availableSlotId")
            .populate({
              path: "availableSlotId",
              select: "-_id startTime",
            })
            .sort({ updatedAt: -1 });
          if (
            lastAppointmentAt != null ||
            lastAppointmentAt.availableSlotId != null
          ) {
            patients[patientDoc][i].APID = lastAppointmentAt.APID;
            patients[patientDoc][i].lastVisitedOn =
              lastAppointmentAt.availableSlotId.startTime;
          }
        }

        return message.successResponse(
          { "Content-Type": "application/json" },
          responseCode.success,
          patients,
          i18n.t("user.patient_by_provider")
        );
      } else {
        return message.failureResponse(
          { "Content-Type": "application/json" },
          responseCode.badRequest,
          i18n.t("response_message.badRequest")
        );
      }
    } catch (error) {
      console.error("Error - getPatientsByProviderId", error);
      return message.failureResponse(
        { "Content-Type": "application/json" },
        responseCode.internalServerError,
        error.message
      );
    }
  };
  const getPhotoGallery = async ({ req }) => {
    try {
      const timezoneOffset = req.headers.timezone
        ? req.headers.timezone
        : TIMEZONE;
      let data = req.body;
      let i18n = req.i18n;
      const patientId = data.patientId;
      let skip = 0;
      skip = data.page <= 0 ? 0 : (data.page - 1) * data.limit;
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
            // itemCount: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
        {
          $lookup: {
            from: "file",
            let: { ids: "$answerImages" },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $in: ["$_id", "$$ids"],
                  },
                },
              },
              {
                $addFields: {
                  createdAt: {
                    $dateToString: {
                      date: "$createdAt",
                      timezone: timezoneOffset,
                    },
                  },
                },
              },
              {
                $addFields: {
                  createdAt: {
                    $dateFromString: {
                      dateString: "$createdAt",
                      // timezone: timezoneOffset,
                    },
                  },
                },
              },
            ],
            as: "answerImages",
          },
        },
        {
          $project: {
            _id: 1,
            apId: 1,
            totalImages: { $size: "$answerImages" },
            answerImages: 1,
            itemCount: 1,
          },
        },
        {
          $facet: {
            metadata: [{ $count: "itemCount" }],
            data: [
              { $skip: skip },
              { $limit: data.limit },
              { $sort: { _id: data.sort } },
            ],
          },
        },
      ]).exec();

      return message.successResponse(
        { "Content-Type": "application/json" },
        responseCode.success,
        photosFromQuestionnaire,
        i18n.t("user.photos_from_questionnaire")
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

  return Object.freeze({
    addUser,
    findAllUser,
    getUserById,
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
    getProfile,
    changeDetails,
    verifyDetails,
    getPatientsByProviderId,
    getPhotoGallery,
  });
}

module.exports = makeUserController;
