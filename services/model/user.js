const db = require("../../config/db");
let User = require("../../model/user")(db);
const Role = require("../../model/role")(db);
const UtilService = require("../util");
const userConstant = require("../../config/constant/user");
const { MESSAGE, NOTIFICATION_MESSAGE } = require("../../config/message");
const moment = require("moment");
const {
  sendOTP,
  resendOTP,
  sendMessage,
  SMSQueue,
} = require("../../config/sms");
const {
  COUNTRYCODE,
  EMAIL_SUBJECT,
  USER_ROLE,
} = require("../../config/authConstant");
const ejs = require("ejs");
const path = require("path");
const { sendSESEmail, emailQueue } = require("../email/emailService");
const utils = require("../../utils/common");
const {
  PATIENT_UNIQUE_PREFIX,
  PHYSICIAN_UNIQUE_PREFIX,
} = require("../../config/constant/user");

module.exports = {
  async register(data, userService, makeUser) {
    try {
      data.firstName = UtilService.capitalize(data.firstName);
      data.lastName = UtilService.capitalize(data.lastName);
      data.email = data.email.toLowerCase();
      data.name = `${data.firstName} ${data.lastName}`;
      data = await this.populateEmailAndPhoneData(data);
      // data.isApproved = true;
      const roleCode = await Role.findById(data.roleIds[0]);
      if (roleCode.code === USER_ROLE.Physician) {
        data.uniqueId = PHYSICIAN_UNIQUE_PREFIX + utils.randomNumber(9);
      } else if (roleCode.code === USER_ROLE.Patient) {
        data.uniqueId = PATIENT_UNIQUE_PREFIX + utils.randomNumber(9);
      }
      const originalData = data;
      const user = makeUser(originalData, "insertUserValidator");
      let result = await User.create(user);
      result = await result.populate(userConstant.POPULATE).execPopulate();
      result.requestId = data.requestId;
      let requestData = {
        result: result || null,
        status: true,
      };
      if (data.requestId !== undefined) {
        requestData.requestId = data.requestId;
      }
      return requestData;
    } catch (error) {
      console.error(error);
      throw new Error(error);
      //return {result: null, status : false}
    }
  },
  async populateEmailAndPhoneData(data) {
    const emailOTP = Math.floor(100000 + Math.random() * 900000);

    const htmlData = await ejs.renderFile(
      path.join(__dirname, "../../views/emailTemplate/email.ejs"),
      {
        user_name: data.name,
        content: NOTIFICATION_MESSAGE.OTP(emailOTP),
      }
    );
    emailQueue(data.email, EMAIL_SUBJECT.OTP, htmlData, 5000);
    let requestId = await sendOTP(COUNTRYCODE + data.phone);
    const sysDate = moment().format("YYYY-MM-DD HH:mm:ss");
    const codeExpiresTime = moment(sysDate)
      .add(1, "days")
      .format("YYYY-MM-DD HH:mm:ss");
    if (data.email) {
      data.emails = [
        {
          email: data.email.toLowerCase(),
          isDefault: true,
          isVerified: false,
          verificationCode: emailOTP,
          codeExpiresOn: codeExpiresTime,
        },
      ];
    }
    if (data.phone) {
      data.phones = [
        {
          countryCode: data.countryCode || COUNTRYCODE,
          phone: data.phone,
          isDefault: true,
          isVerified: false,
        },
      ];
    }
    data.requestId = requestId.requestId;
    return data;
  },
  async checkDuplication(params, i18n) {
    if (params.email) {
      let query = {
        $or: [
          {
            "emails.email": params.email,
          },
          {
            email: params.email,
          },
        ],
      };
      // update
      if (params.id) {
        query["_id"] = {
          $ne: params.id,
        };
      }
      let users = await User.find(query);
      if (users && users.length > 0) {
        let user = users[0];
        if (user.isActive == false) {
          let updatedMessage = i18n.t("auth.deactivated_email");
          return {
            ...MESSAGE.EMAIL_REGISTERED,
            message: updatedMessage,
          };
        }
        return MESSAGE.EMAIL_REGISTERED;
      }
    }
    if (params.phone) {
      let query = {
        $or: [
          {
            "phones.phone": params.phone,
          },
          {
            phone: params.phone,
          },
        ],
      };
      // update
      if (params.id) {
        query["_id"] = {
          $ne: params.id,
        };
      }
      let users = await User.find(query);
      if (users && users.length > 0) {
        let user = users[0];
        if (user.isActive == false) {
          let updatedMessage = i18n.t("auth.deactivated_phone");
          return {
            ...MESSAGE.MOBILE_REGISTERED,
            message: updatedMessage,
          };
        }
        return MESSAGE.MOBILE_REGISTERED;
      }
    }
  },
};
