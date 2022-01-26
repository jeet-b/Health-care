const moment = require("moment");
const message = require("../../../utils/messages");
const responseCode = require("../../../utils/responseCode");
const UtilService = require("../../../services/util");
const userModelService = require("../../../services/model/user");
const userConstant = require("../../../config/constant/user");
const {
  EMAIL_SUBJECT,
  EMAIL_CONTENT,
  SMS_MESSAGE,
  COUNTRYCODE,
  NOTIFICATION_TITLE,
} = require("../../../config/authConstant");
const PaymentService = require("../../../services/stripe/payment");
const { exist } = require("joi");
const _ = require("lodash");
const db = require("../../../config/db");
let Role = require("../../../model/role")(db);
let User = require("../../../model/user")(db);
const { MESSAGE, NOTIFICATION_MESSAGE } = require("../../../config/message");
const ejs = require("ejs");
const path = require("path");
const jwt = require("jsonwebtoken");
const {
  sendOTP,
  resendOTP,
  verifyOTP,
  sendMessage,
  SMSQueue,
} = require("../../../config/sms");
const { JWT } = require("../../../config/authConstant");
const { MASTER, POPULATE } = require("../../../config/constant/user");
const { model } = require("mongoose");
const {
  sendSESEmail,
  emailQueue,
} = require("../../../services/email/emailService");
const notificationService = require("../../../services/notification");
const bcrypt = require("bcrypt");

async function generateToken(user, secret) {
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
}
async function verifyToken(token, secret) {
  return jwt.decode(token, secret);
}

function makeAuthController({ authService, userService, makeUser }) {
  const register = async ({ data }, i18n) => {
    try {
      if (
        ![userConstant.ROLE.PATIENT, userConstant.ROLE.PHYSICIAN].includes(
          data.role
        )
      ) {
        return message.failureResponse(
          {
            "Content-Type": "application/json",
          },
          responseCode.validationError,
          i18n.t("auth.role_not_found")
        );
      } else {
        const role = await Role.find({
          code: data.role,
        });
        data.roleIds = [role[0].id] || [];
        delete data.role;
      }
      const messageObj = await userModelService.checkDuplication(data, i18n);
      if (_.isObject(messageObj)) {
        return message.failureResponse(
          {
            "Content-Type": "application/json",
          },
          responseCode.validationError,
          messageObj
        );
      }
      const user = await userModelService.register(data, userService, makeUser);
      if (user.result.roleIds[0].code === userConstant.ROLE.PATIENT) {
        const emailHTML = await ejs.renderFile(
          path.join(__dirname, "../../../views/emailTemplate/email.ejs"),
          {
            user_name: user.result.name,
            content: NOTIFICATION_MESSAGE.WELCOME_MESSAGE(),
          }
        );
        emailQueue(user.result.email, EMAIL_SUBJECT.SIGN_UP, emailHTML);
        SMSQueue(
          COUNTRYCODE + user.result.phone,
          NOTIFICATION_MESSAGE.WELCOME_MESSAGE()
        );
      } else if (user.result.roleIds[0].code === userConstant.ROLE.PHYSICIAN) {
        let adminRole = await Role.findOne({ code: userConstant.ROLE.ADMIN });
        let adminUser = await User.findOne({ roleIds: adminRole._id });
        await notificationService.create(
          adminUser._id,
          NOTIFICATION_TITLE.NEW_PHYSICIAN_SIGNED_UP,
          NOTIFICATION_MESSAGE.NEW_PHYSICIAN_SIGNED_UP(user.result.name)
        );
        SMSQueue(
          COUNTRYCODE + adminUser.phone,
          NOTIFICATION_MESSAGE.PENDING_APPROVAL()
        );
      }
      const stripeCustomerData = await PaymentService.createCustomer(
        user.result.id,
        user.result.email
      );
      // console.log(stripeCustomerData)
      if (!user.status) {
        return message.failureResponse(
          {
            "Content-Type": "application/json",
          },
          responseCode.validationError,
          i18n.t("auth.register_error")
        );
      }
      let token = await generateToken(user.result, JWT.DEVICE_SECRET);
      await User.findOneAndUpdate(
        { _id: user.result.id },
        { loginToken: token }
      );
      const userToReturn = {
        ...user,
        ...{
          token,
        },
      };
      return message.successResponse(
        {
          "Content-Type": "application/json",
        },
        responseCode.success,
        userToReturn,
        i18n.t("auth.register")
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

  const forgotPassword = async (data, i18n) => {
    try {
      if (!data.email) {
        return message.insufficientParameters(
          {
            "Content-Type": "application/json",
          },
          responseCode.validationError,
          i18n.t("response_message.insufficientParameters")
        );
      }
      let where = {
        email: data.email,
      };
      data.email = data.email.toString().toLowerCase();
      let user = await userService.getSingleDocumentByQuery(where);
      if (user) {
        let resultOfEmail = await authService.sendResetPasswordNotification(
          user
        );
        // console.log("resultOfEmail", resultOfEmail);
        if (resultOfEmail) {
          return message.successResponse(
            {
              "Content-Type": "application/json",
            },
            responseCode.success,
            resultOfEmail,
            i18n.t("auth.email_otp_sent")
          );
        } else {
          return message.failureResponse(
            {
              "Content-Type": "application/json",
            },
            responseCode.success,
            i18n.t("auth.otp_failed")
          );
        }
      } else {
        return message.failureResponse(
          {
            "Content-Type": "application/json",
          },
          responseCode.badRequest,
          i18n.t("auth.account_not_found_email")
        );
      }
    } catch (error) {
      return message.failureResponse(
        {
          "Content-Type": "application/json",
        },
        responseCode.internalServerError,
        error.message
      );
    }
  };

  const validateResetPasswordOtp = async (data, i18n) => {
    try {
      if (!data || !data.otp) {
        return message.insufficientParameters(
          {
            "Content-Type": "application/json",
          },
          responseCode.validationError,
          i18n.t("response_message.insufficientParameters")
        );
      }
      if (data.otp === MASTER.OTP) {
        let user = await userService.getSingleDocumentByQuery({
          email: data.email,
        });
        if (user) {
          let token = await generateToken(user, JWT.DEVICE_SECRET);
          await User.findOneAndUpdate({ _id: user.id }, { loginToken: token });
          return message.successResponse(
            {
              "Content-Type": "application/json",
            },
            responseCode.success,
            {
              token: token,
            },
            i18n.t("auth.otp_verify")
          );
        } else {
          return message.failureResponse(
            {
              "Content-Type": "application/json",
            },
            responseCode.badRequest,
            i18n.t("auth.account_not_found_email")
          );
        }
      }
      let user = await userService.getSingleDocumentByQuery({
        "resetPasswordLink.code": data.otp,
        email: data.email,
      });
      // const emailHTML = await ejs.renderFile(
      //   path.join(__dirname, "../../../views/emailTemplate/email.ejs"),
      //   {
      //     user_name: user.name,
      //     content: NOTIFICATION_MESSAGE.WELCOME_MESSAGE(),
      //   }
      // );
      // await emailQueue(user.email, EMAIL_SUBJECT.SIGN_UP, emailHTML);
      if (!user || !user.resetPasswordLink.expireTime) {
        return message.failureResponse(
          {
            "Content-Type": "application/json",
          },
          responseCode.badRequest,
          i18n.t("auth.otp_invalid")
        );
      }
      // link expire
      if (
        moment(new Date()).isAfter(moment(user.resetPasswordLink.expireTime))
      ) {
        return message.successResponse(
          {
            "Content-Type": "application/json",
          },
          responseCode.success,
          i18n.t("auth.otp_expired")
        );
      }
      let token = await generateToken(user, JWT.DEVICE_SECRET);
      await User.findOneAndUpdate({ _id: user.id }, { loginToken: token });
      return message.successResponse(
        {
          "Content-Type": "application/json",
        },
        responseCode.success,
        {
          token: token,
        },
        i18n.t("auth.otp_verify")
      );
    } catch (error) {
      console.error(error);
      return message.failureResponse(
        {
          "Content-Type": "application/json",
        },
        responseCode.internalServerError,
        error.message
      );
    }
  };

  const resetPassword = async (data, i18n) => {
    try {
      if (!data.token || !data.password) {
        return message.insufficientParameters(
          {
            "Content-Type": "application/json",
          },
          responseCode.validationError,
          i18n.t("response_message.insufficientParameters")
        );
      }

      let payload = null;
      payload = await verifyToken(data.token, JWT.SECRET);
      // console.log("payload", payload);
      if (payload) {
        let user = await User.findOne({
          _id: payload.id,
        });
        let response = await authService.resetPassword(
          user,
          data.password,
          i18n
        );
        if (response) {
          const emailHTML = await ejs.renderFile(
            path.join(__dirname, "../../../views/emailTemplate/email.ejs"),
            {
              user_name: user.name,
              content: NOTIFICATION_MESSAGE.RESET_PASSWORD(),
            }
          );
          emailQueue(user.email, EMAIL_SUBJECT.RESET_PASSWORD, emailHTML);
          return message.successResponse(
            {
              "Content-Type": "application/json",
            },
            responseCode.success,
            response.data,
            i18n.t("auth.password_changed")
          );
        }
      }

      return message.failureResponse(
        {
          "Content-Type": "application/json",
        },
        responseCode.validationError,
        i18n.t("auth.invalid_token")
      );
    } catch (error) {
      return message.failureResponse(
        {
          "Content-Type": "application/json",
        },
        responseCode.internalServerError,
        error.message
      );
    }
  };

  const resetPasswordByLink = async (data, i18n) => {
    try {
      if (!data.email || !data.password) {
        return message.insufficientParameters(
          {
            "Content-Type": "application/json",
          },
          responseCode.validationError,
          i18n.t("response_message.insufficientParameters")
        );
      }

      let userData = await User.findOne({ email: data.email });
      if (userData.resetPasswordLinkUsed) {
        throw new Error(i18n.t("auth.link_used"));
      }
      if (userData) {
        let newPassword = await bcrypt.hash(data.password, 8);
        let response = await User.findOneAndUpdate(
          { email: data.email },
          {
            password: newPassword,
            resetPasswordLinkUsed: true,
          },
          { new: true }
        );
        if (response) {
          return message.successResponse(
            {
              "Content-Type": "application/json",
            },
            responseCode.success,
            response,
            i18n.t("auth.password_changed")
          );
        }
      }

      return message.failureResponse(
        {
          "Content-Type": "application/json",
        },
        responseCode.validationError,
        i18n.t("auth.account_not_found_email")
      );
    } catch (error) {
      return message.failureResponse(
        {
          "Content-Type": "application/json",
        },
        responseCode.internalServerError,
        error.message
      );
    }
  };

  const verifyEmail = async (data) => {
    try {
      let email = data.body.email;
      let otp = data.body.otp;
      if (email && otp) {
        let result = await authService.emailVerify(email, otp, data.i18n);
        // console.log(result)
        if (!result.flag) {
          return message.successResponse(
            {
              "Content-Type": "application/json",
            },
            responseCode.success,
            result.data,
            data.i18n.t("auth.email_verify_success")
          );
        }
        return message.failureResponse(
          {
            "Content-Type": "application/json",
          },
          responseCode.validationError,
          result.data
        );
      }
      return message.insufficientParameters(
        {
          "Content-Type": "application/json",
        },
        responseCode.validationError,
        req.i18n.t("response_message.insufficientParameters")
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
  const resendEmail = async (data, i18n) => {
    try {
      let email = data.email;
      if (email) {
        let result = await authService.resendEmailOTP(email, i18n);
        if (!result.flag) {
          return message.successResponse(
            {
              "Content-Type": "application/json",
            },
            responseCode.success,
            result.data,
            i18n.t("auth.resend_otp_success")
          );
        }
        return message.failureResponse(
          {
            "Content-Type": "application/json",
          },
          responseCode.validationError,
          result.data
        );
      }
      return message.insufficientParameters(
        {
          "Content-Type": "application/json",
        },
        responseCode.validationError,
        i18n.t("response_message.insufficientParameters")
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

  const verifyPhone = async (data) => {
    try {
      let email = data.body.email;
      let otp = data.body.otp;
      if (email && otp) {
        let result = await authService.phoneVerify(email, data.body, data.i18n);
        if (!result.flag) {
          return message.successResponse(
            {
              "Content-Type": "application/json",
            },
            responseCode.success,
            result.data,
            data.i18n.t("auth.phone_verify_success")
          );
        }
        return message.failureResponse(
          {
            "Content-Type": "application/json",
          },
          responseCode.validationError,
          result.data
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
        responseCode.internalServerError,
        error.message
      );
    }
  };

  const resendPhone = async (data, i18n) => {
    try {
      let email = data.email;
      if (email) {
        let result = await authService.resendPhoneOTP(email, i18n);
        if (!result.flag) {
          return message.successResponse(
            {
              "Content-Type": "application/json",
            },
            responseCode.success,
            result.data,
            i18n.t("auth.resend_otp_success")
          );
        }
        return message.failureResponse(
          {
            "Content-Type": "application/json",
          },
          responseCode.validationError,
          result.data
        );
      }
      return message.insufficientParameters(
        {
          "Content-Type": "application/json",
        },
        responseCode.validationError,
        i18n.t("response_message.insufficientParameters")
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

  const authentication = async (data) => {
    try {
      let username = data.body.email.toLowerCase();
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
            result.data,
            data.i18n.t("auth.loginFailed")
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

  const logout = async ({ req }) => {
    try {
      let id = req.user.id;
      let result = await User.findByIdAndUpdate(
        { _id: id },
        {
          $unset: { loginToken: 1 },
          $set: { firebaseToken: [] },
        },
        { new: true }
      );
      return message.logoutSuccess(
        {
          "Content-Type": "application/json",
        },
        responseCode.success,
        result,
        req.i18n.t("auth.logoutSuccess")
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

  const notificationIdentifierSnsUpsert = async ({ req }) => {
    try {
      // console.log(req.body.token);
      const params = _.extend(req.queryParams || {}, req.body || {});
      let token = params.token;
      let deviceType = params.deviceType;
      let loginUser = req.user.id;
      if (!token || !deviceType) {
        throw new Error("Parameters are missing");
      }
      // let response = await authService.notificationIdentifierSnsUpsert({
      //   token,
      //   deviceType,
      //   loginUser,
      // });
      let response = await User.findOneAndUpdate(
        { _id: loginUser },
        { firebaseToken: req.body.token }
      );
      if (response) {
        result = {
          flag: true,
        };
        return message.successResponse(
          {
            "Content-Type": "application/json",
          },
          responseCode.success,
          result,
          req.i18n.t("auth.sns_added")
        );
      } else {
        return message.insufficientParameters(
          {
            "Content-Type": "application/json",
          },
          responseCode.validationError,
          req.i18n.t("response_message.insufficientParameters")
        );
      }
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
    verifyEmail,
    verifyPhone,
    resendEmail,
    resendPhone,
    forgotPassword,
    resetPassword,
    resetPasswordByLink,
    validateResetPasswordOtp,
    notificationIdentifierSnsUpsert,
    logout,
  });
}

module.exports = makeAuthController;
