const moment = require("moment");
const db = require("../../../config/db");
const message = require("../../../utils/messages");
const responseCode = require("../../../utils/responseCode");
const {
  EMAIL_SUBJECT,
  EMAIL_CONTENT,
  SMS_MESSAGE,
  COUNTRYCODE,
  ADMIN_EMAIL_CONTENT,
  USER_ROLE,
  JWT,
} = require("../../../config/authConstant");
const {
  sendSESEmail,
  emailQueue,
} = require("../../../services/email/emailService");
const { MESSAGE, NOTIFICATION_MESSAGE } = require("../../../config/message");
const ejs = require("ejs");
const path = require("path");
const Role = require("../../../model/role")(db);
const User = require("../../../model/user")(db);
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

function makeAuthController({ authService, userService, makeUser }) {
  const generateToken = async (user, secret) => {
    return jwt.sign(
      {
        id: user.id,
        email: user.email,
      },
      secret,
      {
        expiresIn: JWT.EXPIRESIN,
      }
    );
  };

  const verifyToken = async (token, secret) => {
    return jwt.decode(token, secret);
  };

  const register = async ({ data }, i18n) => {
    try {
      const originalData = data;
      const user = makeUser(originalData, "insertUserValidator");
      const result = await userService.createDocument(user);
      return message.successResponse(
        { "Content-Type": "application/json" },
        responseCode.success,
        result,
        i18n.t("auth.register")
      );
    } catch (e) {
      return message.failureResponse(
        { "Content-Type": "application/json" },
        responseCode.internalServerError,
        e.message
      );
    }
  };
  const forgotPassword = async (params, i18n) => {
    try {
      if (!params.email) {
        return message.insufficientParameters(
          { "Content-Type": "application/json" },
          responseCode.validationError,
          i18n.t("response_message.insufficientParameters")
        );
      }
      let role = await Role.findOne({ code: USER_ROLE.Admin });
      let where = { email: params.email, roleIds: role._id };
      params.email = params.email.toString().toLowerCase();
      let user = await userService.getSingleDocumentByQuery(where);
      if (user) {
        let token = null;
        token = await generateToken(user, JWT.ADMIN_SECRET);
        let url = `${process.env.ADMIN_PANEL_URL}/setnewpassword?email=${user.email}&token=${token}`;
        const emailHTML = await ejs.renderFile(
          path.join(__dirname, "../../../views/emailTemplate/email.ejs"),
          {
            user_name: user.name,
            content: NOTIFICATION_MESSAGE.ADMIN_FORGOT_PASSWORD(url),
          }
        );
        emailQueue(user.email, EMAIL_SUBJECT.FORGOT_PASSWORD, emailHTML);
        return message.successResponse(
          { "Content-Type": "application/json" },
          responseCode.success,
          true,
          i18n.t("auth.email_sent")
        );
      } else {
        return message.failureResponse(
          { "Content-Type": "application/json" },
          responseCode.success,
          false,
          i18n.t("auth.admin_not_found")
        );
      }
    } catch (error) {
      console.error("Error - forgotPassword", error);
      return message.failureResponse(
        { "Content-Type": "application/json" },
        responseCode.internalServerError,
        error.message
      );
    }
  };

  const validateResetPasswordOtp = async (params, i18n) => {
    try {
      if (!params || !params.otp) {
        return message.insufficientParameters(
          { "Content-Type": "application/json" },
          responseCode.validationError,
          i18n.t("response_message.insufficientParameters")
        );
      }
      let user = await userService.getSingleDocumentByQuery({
        "resetPasswordLink.code": params.otp,
      });
      if (!user || !user.resetPasswordLink.expireTime) {
        return message.successResponse(
          { "Content-Type": "application/json" },
          responseCode.success,
          i18n.t("auth.otp_invalid")
        );
      }
      // link expire
      if (
        moment(new Date()).isAfter(moment(user.resetPasswordLink.expireTime))
      ) {
        return message.successResponse(
          { "Content-Type": "application/json" },
          responseCode.success,
          i18n.t("auth.reset_password_link_expired")
        );
      }
      return message.successResponse(
        { "Content-Type": "application/json" },
        responseCode.success,
        i18n.t("auth.otp_verify")
      );
    } catch (error) {
      return message.failureResponse(
        { "Content-Type": "application/json" },
        responseCode.internalServerError,
        error.message
      );
    }
  };

  const resetPassword = async (params, i18n) => {
    try {
      if (!params.token || !params.password) {
        return message.insufficientParameters(
          { "Content-Type": "application/json" },
          responseCode.validationError,
          i18n.t("response_message.insufficientParameters")
        );
      }
      let payload = null;
      payload = await verifyToken(params.token, JWT.ADMIN_SECRET);
      if (payload) {
        const password = await bcrypt.hash(params.password, 8);
        let user = await User.findOneAndUpdate(
          { _id: payload.id },
          { password: password },
          { new: true }
        );
        return message.successResponse(
          { "Content-Type": "application/json" },
          responseCode.success,
          user,
          i18n.t("auth.change_password")
        );
      } else {
        throw new Error(req.i18n.t("auth.reset_password_link_expired"));
      }
    } catch (error) {
      return message.failureResponse(
        { "Content-Type": "application/json" },
        responseCode.internalServerError,
        error.message
      );
    }
  };
  const authentication = async (data) => {
    try {
      let username = data.body.email;
      let password = data.body.password;
      let url = data.url;
      if (username && password) {
        let result = await authService.loginUser(username, password, url);
        if (result.requestId === undefined) {
          delete result.requestId;
        }
        if (result.flag) {
          return message.loginFailed(
            {
              "Content-Type": "application/json",
            },
            responseCode.badRequest,
            data.i18n.t("auth.loginFailed"),
            result.data
          );
        }

        if (
          !result.data.emailVerified ||
          !result.data.phoneVerified ||
          !result.flag
        ) {
          return message.loginSuccess(
            {
              "Content-Type": "application/json",
            },
            responseCode.success,
            result.data,
            data.i18n.t("auth.loginSuccess")
          );
        }
        return message.loginFailed(
          {
            "Content-Type": "application/json",
          },
          responseCode.validationError,
          result.data,
          data.i18n.t("auth.loginFailed")
        );
      }
      return message.insufficientParameters(
        {
          "Content-Type": "application/json",
        },
        responseCode.validationError,
        data.i18n.t("response_message.insufficientParameters")
      );
    } catch (error) {
      console.error(error);
      return message.failureResponse(
        {
          "Content-Type": "application/json",
        },
        responseCode.validationError,
        error.message
      );
    }
  };
  return Object.freeze({
    register,
    authentication,
    forgotPassword,
    resetPassword,
    validateResetPasswordOtp,
  });
}

module.exports = makeAuthController;
