const {
  JWT,
  LOGIN_ACCESS,
  PLATFORM,
  MAX_LOGIN_RETRY_LIMIT,
  LOGIN_REACTIVE_TIME,
  FORGOT_PASSWORD_WITH,
  COUNTRYCODE,
  EMAIL_SUBJECT,
  EMAIL_CONTENT,
  SMS_MESSAGE,
  DEVICE_TYPE,
} = require("../config/authConstant");
const jwt = require("jsonwebtoken");
const common = require("../utils/common");
const {
  sendOTP,
  resendOTP,
  verifyOTP,
  sendMessage,
  SMSQueue,
} = require("../config/sms");
const moment = require("moment");
const ejs = require("ejs");
const path = require("path");
const _ = require("lodash");
const SnsAwsService = require("../services/sns/snsAws.js");
const { sendSESEmail, emailQueue } = require("./email/emailService");
const bcrypt = require("bcrypt");
const db = require("../config/db");
let Role = require("../model/role")(db);
let User = require("../model/user")(db);
const { AWS_SNS } = require("../config/constant/thirdPartyApi");
const { MASTER, POPULATE } = require("../config/constant/user");
const SNS = require("sns-mobile");
const { NOTIFICATION_MESSAGE } = require("../config/message");
const notificationService = require("../services/notification");
const { NOTIFICATION } = require("../config/constant/notification");

function makeAuthService({ model, userService }) {
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

  const loginUser = async (username, password, url) => {
    try {
      let where = {
        email: username,
      };
      const user = await model.findOne(where).populate(POPULATE);
      if (user) {
        if (user.isActive === false) {
          return {
            flag: true,
            data: `You have been deactivated. Please contact admin.`,
          };
        }
        if (user.loginRetryLimit >= MAX_LOGIN_RETRY_LIMIT) {
          if (user.loginReactiveTime) {
            let now = moment();
            let limitTime = moment(user.loginReactiveTime);
            if (limitTime > now) {
              let expireTime = moment()
                .add(LOGIN_REACTIVE_TIME, "minutes")
                .toISOString();
              await userService.updateDocument(user.id, {
                loginReactiveTime: expireTime,
                loginRetryLimit: user.loginRetryLimit + 1,
              });
              return {
                flag: true,
                data: `You have exceed the number of limit.you can login after ${LOGIN_REACTIVE_TIME} minutes.`,
              };
            }
          } else {
            // send error
            let expireTime = moment()
              .add(LOGIN_REACTIVE_TIME, "minutes")
              .toISOString();
            await userService.updateDocument(user.id, {
              loginReactiveTime: expireTime,
              loginRetryLimit: user.loginRetryLimit + 1,
            });
            return {
              flag: true,
              data: `You have exceed the number of limit.you can login after ${LOGIN_REACTIVE_TIME} minutes.`,
            };
          }
        }
        const isPasswordMatched = await user.isPasswordMatch(password);
        if (isPasswordMatched) {
          const userData = user.toJSON();
          let token;
          const roleRef = await Role.find({
            _id: {
              $in: user.roleIds,
            },
          });
          let userRole = roleRef[0].code;
          if (!userRole) {
            return {
              flag: true,
              data: "You have not been assigned role.",
            };
          }
          let emailVerified = userData.emails[0].isVerified;
          let phoneVerified = userData.phones[0].isVerified;
          if (!emailVerified || !phoneVerified) {
            // send email and phone verification again
            let data = {
              email: userData.email,
              message: "Please verify your email and phone",
              emailVerified: emailVerified,
              phoneVerified: phoneVerified,
            };
            if (!phoneVerified) {
              let otpSent = await resendOTP(
                COUNTRYCODE + userData.phones[0].phone
              );
              data.requestId = otpSent.requestId;
            }
            if (!emailVerified) {
              const OTP = Math.floor(100000 + Math.random() * 900000);
              const emailHTML = await ejs.renderFile(
                path.join(__dirname, "../views/emailTemplate/email.ejs"),
                {
                  user_name: userData.name,
                  content: NOTIFICATION_MESSAGE.FORGOT_PASSWORD(OTP),
                }
              );
              emailQueue(userData.email, EMAIL_SUBJECT.OTP, emailHTML);
              const sysDate = moment().format("YYYY-MM-DD HH:mm:ss");
              const codeExpiresTime = moment(sysDate)
                .add(1, "days")
                .format("YYYY-MM-DD HH:mm:ss");
              let emails = [
                {
                  email: data.email.toLowerCase(),
                  isPrimary: true,
                  isVerified: false,
                  verificationCode: OTP,
                  codeExpiresOn: codeExpiresTime,
                },
              ];
              await model.update(where, {
                emails: emails,
                requestId: data.requestId,
              });
            }
            return {
              flag: false,
              data: data,
            };

            // set email verification code and time again
          }
          if (url.includes("admin")) {
            if (!PLATFORM.ADMIN.includes(userRole)) {
              return {
                flag: true,
                data: "You are unable to access this platform",
              };
            }
            token = await generateToken(userData, JWT.ADMIN_SECRET);
            await User.findOneAndUpdate(
              { _id: userData.id },
              { loginToken: token }
            );
          } else if (url.includes("device")) {
            // if (!LOGIN_ACCESS[user.role].includes(PLATFORM.DEVICE)){
            if (!PLATFORM.DEVICE.includes(userRole)) {
              return {
                flag: true,
                data: "You are unable to access this platform",
              };
            }
            token = await generateToken(userData, JWT.DEVICE_SECRET);
            await User.findOneAndUpdate(
              { _id: userData.id },
              { loginToken: token }
            );
          }
          if (user.loginRetryLimit) {
            await userService.updateDocument(user.id, {
              loginRetryLimit: 0,
              loginReactiveTime: "",
            });
          }
          const userToReturn = {
            ...userData,
            ...{
              token,
            },
          };
          return {
            flag: false,
            data: userToReturn,
          };
        } else {
          await userService.updateDocument(user.id, {
            loginRetryLimit: user.loginRetryLimit + 1,
          });
          return {
            flag: true,
            data: "Incorrect password",
          };
        }
      } else {
        return {
          flag: true,
          data: "This Email does not exist.",
        };
      }
    } catch (error) {
      console.error(error);
      throw new Error(error);
    }
  };
  const emailVerify = async (email, otp, i18n) => {
    try {
      email = email.toLowerCase();
      let where = {
        email: email,
      };
      const user = await model.findOne(where).populate(POPULATE);
      if (user) {
        const userData = user.toJSON();
        let data = user.emails[0];
        if (data.isVerified) {
          return {
            flag: true,
            data: i18n.t("auth.email_already_verified"),
          };
        }
        let sysDate = new Date(moment().format("YYYY-MM-DD HH:mm:ss"));

        if (otp != data.verificationCode && otp != MASTER.OTP) {
          return {
            flag: true,
            data: i18n.t("auth.otp_invalid"),
          };
        } else if (otp == data.verificationCode || otp == MASTER.OTP) {
          if (sysDate >= data.codeExpiresOn) {
            return {
              flag: true,
              data: i18n.t("auth.otp_expired"),
            };
          }
        }
        delete userData.resetPasswordLink;
        data.isVerified = true;
        let emails = [data];
        await model.update(where, {
          emails: emails,
          emailVerified: true,
        });
        let token = await generateToken(userData, JWT.DEVICE_SECRET);
        await User.findOneAndUpdate(
          { _id: userData.id },
          { loginToken: token }
        );
        const userToReturn = {
          ...userData,
          ...{
            token,
          },
        };
        return {
          flag: false,
          data: userToReturn,
        };
      } else {
        return {
          flag: true,
          data: i18n.t("auth.account_not_found_email"),
        };
      }
    } catch (error) {
      console.error(error);
      throw new Error(error);
    }
  };
  const phoneVerify = async (email, body, i18n) => {
    try {
      email = email.toLowerCase();
      let where = {
        email: email,
      };
      let otp = body.otp;
      let user = await model.findOne(where).populate(POPULATE);
      if (user) {
        const userData = user.toJSON();
        let data = user.phones[0];
        if (data.isVerified) {
          return {
            flag: true,
            data: i18n.t("auth.phone_already_verified"),
          };
        }
        delete userData.resetPasswordLink;
        // if (!userData.requestId) {
        //   // Here we have to send otp if request id isn't stored in DB. and after that we have to verify.
        //   return {
        //     flag: true,
        //     data: "Please send resend otp request."
        //   }
        // }
        if (otp != MASTER.OTP) {
          let otpVerify = await verifyOTP(userData.requestId, otp);
          if (!otpVerify.verified) {
            return {
              flag: true,
              data: i18n.t("auth.otp_invalid"),
            };
          }
        }
        data.isVerified = true;
        let phones = [data];
        await model.update(where, {
          phones: phones,
          phoneVerified: true,
        });
        let token = await generateToken(userData, JWT.DEVICE_SECRET);
        await User.findOneAndUpdate(
          { _id: userData.id },
          { loginToken: token }
        );
        const userToReturn = {
          ...userData,
          ...{
            token,
          },
        };
        return {
          flag: false,
          data: userToReturn,
        };
      } else {
        return {
          flag: true,
          data: i18n.t("auth.account_not_found_phone"),
        };
      }
    } catch (error) {
      console.error(error);
      throw new Error(error);
    }
  };

  const changePassword = async (params) => {
    try {
      let password = params.newPassword;
      let oldPassword = params.oldPassword;
      let user = await userService.getSingleDocumentById(params.userId);
      if (user && user.id) {
        let isPasswordMatch = await user.isPasswordMatch(oldPassword);
        if (!isPasswordMatch) {
          return {
            flag: false,
            data: "Incorrect old password",
          };
        }
        password = await bcrypt.hash(password, 8);
        let updatedUser = userService.updateDocument(user.id, {
          password,
        });
        if (updatedUser) {
          return {
            flag: false,
            data: "Password changed successfully.",
          };
        }
        return {
          flag: true,
          data: "Password not updated",
        };
      }
      return {
        flag: true,
        data: "User not found",
      };
    } catch (error) {
      throw new Error(error);
    }
  };

  const sendResetPasswordNotification = async (user) => {
    // let resultOfEmail = false;
    // let resultOfSMS = false;
    try {
      // if (FORGOT_PASSWORD_WITH.OTP.email) {
      resultOfEmail = await sendEmailForResetPasswordOtp(user);
      // console.log("sendResetPasswordNotification", resultOfEmail);
      // }
      // if (FORGOT_PASSWORD_WITH.OTP.sms) {
      //   // call sms function
      //   resultOfSMS = await sendSMSForResetPasswordOtp(user);
      // }
      return resultOfEmail;
      //   ,
      //   resultOfSMS
      // };
    } catch (error) {
      console.error(error);
      throw new Error(error);
    }
  };

  const resetPassword = async (user, newPassword, i18n) => {
    try {
      let where = {
        _id: user.id,
      };
      const dbUser = await userService.getSingleDocumentByQuery(where);
      if (!dbUser) {
        return {
          flag: true,
          data: i18n.t("auth.user_not_found"),
        };
      }
      newPassword = await bcrypt.hash(newPassword, 8);
      await userService.updateDocument(user.id, {
        password: newPassword,
        resetPasswordLink: null,
        loginRetryLimit: 0,
      });
      // let mailObj = {
      //   subject: 'Reset Password',
      //   to: user.email,
      //   template: '/views/successfullyResetPassword',
      //   data: {
      //     isWidth: true,
      //     email: user.email || '-',
      //     message: 'Password Successfully Reset'
      //   }
      // };
      // await sendEmail(mailObj);
      return {
        flag: false,
        data: i18n.t("auth.change_password"),
      };
    } catch (error) {
      console.error("Error -resetPassword", error);
      throw new Error(error);
    }
  };

  const sendEmailForResetPasswordOtp = async (user) => {
    try {
      const otp = Math.floor(100000 + Math.random() * 900000);
      const emailHTML = await ejs.renderFile(
        path.join(__dirname, "../views/emailTemplate/email.ejs"),
        {
          user_name: user.name,
          content: NOTIFICATION_MESSAGE.FORGOT_PASSWORD(otp),
        }
      );
      emailQueue(user.email, EMAIL_SUBJECT.FORGOT_PASSWORD, emailHTML);
      SMSQueue(
        COUNTRYCODE + user.phone,
        NOTIFICATION_MESSAGE.FORGOT_PASSWORD(otp)
      );
      let expires = moment();
      expires = expires
        .add(FORGOT_PASSWORD_WITH.EXPIRETIME, "minutes")
        .toISOString();
      await userService.updateDocument(user.id, {
        resetPasswordLink: {
          code: otp,
          expireTime: expires,
        },
      });
      return true;
    } catch (error) {
      console.error("Error -sendEmailForResetPasswordOtp", error);
      throw new Error(error);
    }
  };
  const resendEmailOTP = async (email, i18n) => {
    try {
      let where = {
        email: email,
      };
      const user = await model.findOne(where);
      if (user && user.emailVerified) {
        return {
          flag: true,
          data: i18n.t("auth.account_not_found_email"),
        };
      }
      const OTP = Math.floor(100000 + Math.random() * 900000);
      // const htmlData = await ejs.renderFile(path.join(__dirname, '../views/email.ejs'), {
      //     user_name: body.firstName,
      //     otp: OTP,
      // });
      // await sendEmail(body.email, EMAIL_SUBJECT.EMAIL_OTP, htmlData);
      const sysDate = moment().format("YYYY-MM-DD HH:mm:ss");
      const codeExpiresTime = moment(sysDate)
        .add(1, "days")
        .format("YYYY-MM-DD HH:mm:ss");
      let emails = [
        {
          email: email.toLowerCase(),
          isPrimary: true,
          isVerified: false,
          verificationCode: OTP,
          codeExpiresOn: codeExpiresTime,
        },
      ];
      await model.update(where, {
        emails: emails,
      });
      return {
        flag: false,
        data: i18n.t("auth.resend_otp_success"),
      };
    } catch (e) {
      throw new Error(e);
    }
  };
  const resendPhoneOTP = async (email, i18n) => {
    try {
      let where = {
        email: email,
      };
      const user = await model.findOne(where);
      if (user.phoneVerified) {
        return {
          flag: true,
          data: i18n.t("auth.phone_already_verified"),
        };
      }
      if (user) {
        const userData = user.toJSON();
        let otpSent = await resendOTP(COUNTRYCODE + userData.phones[0].phone);
        return {
          flag: false,
          data: otpSent,
        };
      } else {
        return {
          flag: true,
          data: i18n.t("auth.account_not_found_phone"),
        };
      }
    } catch (error) {
      throw new Error(e);
    }
  };
  // async function sendSMSForResetPasswordOtp(user) {
  //   try {
  //     let otp = common.randomNumber();
  //     let expires = moment();
  //     expires = expires.add(FORGOT_PASSWORD_WITH.EXPIRETIME, 'minutes').toISOString();
  //     await userService.updateDocument(User, user.id, {
  //       resetPasswordLink: {
  //         code: otp,
  //         expireTime: expires
  //       }
  //     });
  //     let message = `OTP code for Reset password`;
  //     let otpMsg = `${message}: ${otp}`;
  //     let smsObj = {
  //       message: otpMsg,
  //       to: user.mobileNo,
  //     };
  //     await sendSMS(smsObj);
  //     return true;
  //   } catch (e) {
  //     return false;
  //   }
  // }
  const notificationIdentifierSnsUpsert = async (options) => {
    try {
      let params = _.cloneDeep(options);
      let loggedInUser = params.loginUser;
      let arnSetup = {};
      let token;
      // Generate ARN for device from device token
      if (params.deviceType === DEVICE_TYPE.ANDROID) {
        token = params.token;
        arnSetup["platform"] = SNS.SUPPORTED_PLATFORMS.ANDROID;
        arnSetup["platformApplicationArn"] = AWS_SNS.ANDROID_ARN;

        let arnObj = {
          token: token,
          arnSetup: arnSetup,
        };
        let arn = await SnsAwsService.createArn(arnObj);
        params["androidEndpointArn"] = {
          imei: "",
          arn: arn,
        };

        let androidEndpointArn = [];

        androidEndpointArn.push(params["androidEndpointArn"]);
        await User.findOneAndUpdate(
          { _id: loggedInUser },
          { androidEndpointArn: androidEndpointArn }
        );
        return { flag: true };
      } else if (params.deviceType === DEVICE_TYPE.IPHONE) {
        token = params.token;
        arnSetup["platform"] = SNS.SUPPORTED_PLATFORMS.IOS;
        arnSetup["platformApplicationArn"] = isSandBox
          ? AWS_SNS.IOS_SANDBOX_ARN
          : AWS_SNS.IOS_PRODUCTION_ARN;

        let arn_obj = {
          token: token,
          arnSetup: arnSetup,
        };

        let arn = await SnsAwsService.createArn(arn_obj);
        params["iosEndpointArn"] = arn;
        let iosEndpointArn = [];
        if (
          !loggedInUser["iosEndpointArn"] ||
          !loggedInUser["iosEndpointArn"].length
        ) {
          iosEndpointArn = [];
        }
        let arnObj = {
          arn: arn,
          deviceToken: token,
        };
        iosEndpointArn.push(arnObj);

        await User.findOneAndUpdate(
          { _id: loggedInUser },
          { iosEndpointArn: iosEndpointArn }
        );

        return { flag: true };
      } else {
        return { flag: false };
      }
    } catch (error) {
      throw new Error(error);
    }
  };

  return Object.freeze({
    generateToken,
    verifyToken,
    loginUser,
    emailVerify,
    phoneVerify,
    changePassword,
    resetPassword,
    resendEmailOTP,
    resendPhoneOTP,
    sendResetPasswordNotification,
    notificationIdentifierSnsUpsert,
  });
}
module.exports = makeAuthService;
