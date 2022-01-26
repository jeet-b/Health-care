const JWT = {
  ADMIN_SECRET: "myjwtadminsecret",
  DEVICE_SECRET: "myjwtdevicesecret",
  EXPIRESIN: 10000,
};

const TIMESLOT_TYPE = {
  DAILY: "DAILY",
  TIMESLOT: "TIMESLOT",
};

const USER_ROLE = {
  Admin: "ADMIN",
  User: "USER",
  Patient: "PATIENT",
  Physician: "PHYSICIAN",
};

const DEVICE_TYPE = {
  WEB: "WEB",
  ANDROID: "ANDROID",
  IPHONE: "IPHONE",
};

const PLATFORM = {
  ADMIN: ["ADMIN"],
  DEVICE: ["PATIENT", "PHYSICIAN"],
};

let LOGIN_ACCESS = {
  [USER_ROLE.PHYSICIAN]: [PLATFORM.DEVICE],
  [USER_ROLE.PATIENT]: [PLATFORM.DEVICE],
  [USER_ROLE.Admin]: [PLATFORM.DEVICE, PLATFORM.ADMIN],
};

const DEFAULT_ROLE = 1;

const ROLE_RIGHTS = {
  [USER_ROLE.Patient]: [
    "getAllByUserInDevicePlatform",
    "getByUserInDevicePlatform",
    "aggregateByUserInDevicePlatform",
    "getCountByUserInDevicePlatform",
    "createByUserInDevicePlatform",
    "addBulkByUserInDevicePlatform",
    "updateByUserInDevicePlatform",
    "updateBulkByUserInDevicePlatform",
    "partialUpdateByUserInDevicePlatform",
    "deleteByUserInDevicePlatform",
    "softDeleteByUserInDevicePlatform",
    "upsertByUserInDevicePlatform",
    "fileUploadByUserInDevicePlatform",
    "changePasswordByUserInDevicePlatform",
    "getProfileByUserInDevicePlatform",
    "updateProfileByUserInDevicePlatform",
  ],
  [USER_ROLE.Physician]: [
    "getAllByUserInDevicePlatform",
    "getByUserInDevicePlatform",
    "aggregateByUserInDevicePlatform",
    "getCountByUserInDevicePlatform",
    "createByUserInDevicePlatform",
    "addBulkByUserInDevicePlatform",
    "updateByUserInDevicePlatform",
    "updateBulkByUserInDevicePlatform",
    "partialUpdateByUserInDevicePlatform",
    "deleteByUserInDevicePlatform",
    "softDeleteByUserInDevicePlatform",
    "upsertByUserInDevicePlatform",
    "fileUploadByUserInDevicePlatform",
    "changePasswordByUserInDevicePlatform",
    "getProfileByUserInDevicePlatform",
    "updateProfileByUserInDevicePlatform",
  ],

  [USER_ROLE.Admin]: [
    "getAllByAdminInDevicePlatform",
    "getByAdminInDevicePlatform",
    "aggregateByAdminInDevicePlatform",
    "getCountByAdminInDevicePlatform",
    "createByAdminInDevicePlatform",
    "addBulkByAdminInDevicePlatform",
    "updateByAdminInDevicePlatform",
    "updateBulkByAdminInDevicePlatform",
    "partialUpdateByAdminInDevicePlatform",
    "deleteByAdminInDevicePlatform",
    "softDeleteByAdminInDevicePlatform",
    "upsertByAdminInDevicePlatform",
    "fileUploadByAdminInDevicePlatform",
    "changePasswordByAdminInDevicePlatform",
    "getProfileByAdminInDevicePlatform",
    "updateProfileByAdminInDevicePlatform",
    "getAllByAdminInAdminPlatform",
    "getByAdminInAdminPlatform",
    "aggregateByAdminInAdminPlatform",
    "getCountByAdminInAdminPlatform",
    "createByAdminInAdminPlatform",
    "addBulkByAdminInAdminPlatform",
    "updateByAdminInAdminPlatform",
    "updateBulkByAdminInAdminPlatform",
    "partialUpdateByAdminInAdminPlatform",
    "deleteByAdminInAdminPlatform",
    "softDeleteByAdminInAdminPlatform",
    "upsertByAdminInAdminPlatform",
    "fileUploadByAdminInAdminPlatform",
    "changePasswordByAdminInAdminPlatform",
    "updateProfileByAdminInAdminPlatform",
  ],
};
const MAX_LOGIN_RETRY_LIMIT = 3;
const LOGIN_REACTIVE_TIME = 1;

const MAX_TIME_PER_REQUEST = 60 * 1000;
const MAX_REQUEST_PER_TIME = 200;
const TOO_MANY_REQUEST_MESSAGE =
  "Too many accounts created from this IP, please try again after a while";

const BRAND_NAME = "QR 8";
const CMD_CANCEL = "cancel";

const FORGOT_PASSWORD_WITH = {
  OTP: {
    email: true,
    sms: false,
  },
  EXPIRETIME: 20,
};

const TAX_PERCENTAGE = 0;

const PAYMENT_STATUS = {
  PENDING: "PENDING",
  COMPLETED: "COMPLETED",
  SUCCESS: "SUCCESS",
  PAYMENT_FAILED: "PAYMENT_FAILED",
  REFUNDED: "REFUNDED",
};

const SETUP = {
  DEFAULT_PAYMENT_METHOD: "STRIPE",
  COUNTRY_ISO_CODE: "AUS",
  CURRENCY_CODE: "aud",
  ACCOUNT_TYPE: "individual",
};

const COUNTRYCODE = process.env.COUNTRYCODE ? process.env.COUNTRYCODE : "+91";

const TRANSACTION_LOG = {
  CHARGE_TYPE: {
    CARD_VERIFY: "CARD_VERIFY",
    APPOINTMENT_BOOKED: "APPOINTMENT_BOOKED",
    FAILED_PAYMENT_CHARGE: "FAILED_PAYMENT_CHARGE",
    REFUND: "REFUND",
  },
  TRANSACTION_TYPE: {
    CREDIT: "CREDIT",
    DEBIT: "DEBIT",
    REFUND: "REFUND",
    COD: "COD",
  },
};
const CALL_STATUS = {
  JOINED: "JOINED",
  CONNECTED: "CONNECTED",
  LEAVE: "LEAVE",
  INTERRUPTED: "INTERRUPTED",
  DISCONNECTED: "DISCONNECTED",
  COMPLETED: "COMPLETED",
};
const APPOINTMENT_TYPE = {
  NEW: "NEW",
  FOLLOW_UP: "FOLLOW_UP",
};
const CHARGE_TYPE = {
  BOOK_APPOINTMENT: "BOOK_APPOINTMENT",
  TREATMENT_PAYMENT: "TREATMENT_PAYMENT",
};
const DASHBOARD_FILTER = {
  WEEK: "WEEK",
  FORTNIGHT: "FORTNIGHT",
  MONTH: "MONTH",
};
const REPORT_FILTER = {
  WEEK: "WEEK",
  MONTH: "MONTH",
  HALFYEAR: "HALFYEAR",
  YEAR: "YEAR",
};
const INVOICE_PREFIX = "QR8";
const PHYSICIAN_AMOUNT = 50;
const BUFFERAVAILABLESLOT_IN_DAYS = 182;
const SLOT_INTERVAL = 30;
const TIMEZONE = "Asia/Calcutta";
const OFFSET = 330;
const APPOINTMENT_PREFIX = "APID-";
const DELAY_QUEUE = 1000;
const RETRY_ATTEMPTS = 2;
const PRIORITY = 3;
const ADMIN_PANEL_FORGOT_PASSWORD_URL = "";
const EMAIL_SUBJECT = {
  SIGN_UP: "Welcome to QR8",
  OTP: "QR8 OTP",
  DEACTIVATION: "Your Qr8 account has been deactivated",
  FORGOT_PASSWORD: "Qr8 Account Reset Password",
  RESET_PASSWORD: "Password Reset Successful",
  VIDEO_CALL_NO_SHOW: "We Missed You!",
  APPOINTMENT_BOOKED: "Appointment Scheduled",
  EMAIL_CHANGED: "Qr8 Email Change Sucessful",
  CONTACT_CHANGED: "Please Provide Us With Your Contact Details",
  FOLLOWUP_REMINDER_10_WEEKS: "Time to check in with your doctor",
  FOLLOWUP_REMINDER_12_WEEKS: "Time Flies!",
  TREATMENT_PAYMENT_REMINDER_10_WEEKS: "Still thinking about those skin goals?",
  TREATMENT_PAYMENT_REMINDER_12_WEEKS: "Can we help?",
  SERVICE_ADDED: "Qr8 added new services",
  SERVICE_UPDATED: "Qr8 updated their services",
  TREATMENT_ASSIGNED: "New Treatment assigned",
  APPOINTMENT_INVOICE: "Invoice",
  RESET_PASSWORD_LINK: "Reset Password Link",
  INVITE_LINK: "Invite Link",
};
const ADMIN_EMAIL_CONTENT = {
  FORGOT_PASSWORD: "The link for changing the password is ",
};
const EMAIL_CONTENT = {
  WELCOME_MESSAGE:
    "Thank you for joining QR8! We're sure you'll love connecting through our platform.",
  RESET_PASSWORD: "Your password has been successfully updated.",
  EMAIL_CHANGED: "Email Changed Successfully",
  CONTACT_CHANGED: "Contact/Cell/Mobile number details are updated.",
  APPROVED: "Your data is verified and approverd",
  SERVICE_ADDED: "Admin Created New Services.",
  SERVICE_UPDATED: "Existing Service Updated",
};
const SMS_MESSAGE = {
  WELCOME_MESSAGE:
    "Thank you for joining QR8! We're sure you'll love connecting through our platform.",
  FORGOT_PASSWORD: "The OTP  for reset password is ",
  APPOINTMENT_REMINDER: "Get ready! Your appointment on QR8 is in 30 minutes.",
  PENDING_APPROVAL: "Pending approval",
  CONTACT_CHANGED: "Contact/Cell/Mobile number details are updated.",
};
const NOTIFICATION_TITLE = {
  APPOINTMENT_BOOK: "Appointment Booked",
  TREATMENT_NOT_ASSIGNED: "Treatment Not Assigned",
  TREATMENT_ASSIGNED: "Treatment Assigned",
  PHYSICIAN_RATED: "Rating Received",
  FOLLOW_UP_APPOINTMENT_BOOK: "Follow Up Appointment Booked",
  RESCHEDULE_APPOINTMENT: "Appointment Rescheduled",
  APPOINTMENT_CANCELLED: "Appointment Cancelled",
  PHYSICIAN_APPROVED: "Approved By Qr8",
  PAYMENT_FAILED: "Payment Failed",
  PAYMENT_SUCCESS: "Payment Success",
  ADMIN_BOOKED_APPOINTMENT: "Qr8 Created An Appointment",
  FOLLOW_UP_AVAILABLE: "Follow Up Available",
  NEW_PHYSICIAN_SIGNED_UP: "New Provider Signed up",
  CHAT_REQUESTED: "Chat Requested",
  CHAT_ENDED: "Chat ended",
  VIDEO_CALL_COMPLETED: "Video Call Completed",
  SERVICE_ADDED: "Service Added",
  SERVICE_UPDATED: "Service Updated",
  PHYSICIAN_DEACTIVATED: "Deactivated",
  EMAIL_CHANGED: "Email Changed",
  CONTACT_CHANGED: "Contact Changed",
  VIDEO_CALL_REMINDER: "Appointment Reminder",
};
module.exports = {
  JWT,
  TIMESLOT_TYPE,
  USER_ROLE,
  DEFAULT_ROLE,
  ROLE_RIGHTS,
  PLATFORM,
  MAX_LOGIN_RETRY_LIMIT,
  LOGIN_REACTIVE_TIME,
  FORGOT_PASSWORD_WITH,
  LOGIN_ACCESS,
  BRAND_NAME,
  CMD_CANCEL,
  COUNTRYCODE,
  TAX_PERCENTAGE,
  PAYMENT_STATUS,
  SETUP,
  TRANSACTION_LOG,
  CALL_STATUS,
  APPOINTMENT_TYPE,
  CHARGE_TYPE,
  DASHBOARD_FILTER,
  REPORT_FILTER,
  BUFFERAVAILABLESLOT_IN_DAYS,
  PHYSICIAN_AMOUNT,
  SLOT_INTERVAL,
  TIMEZONE,
  OFFSET,
  APPOINTMENT_PREFIX,
  EMAIL_SUBJECT,
  EMAIL_CONTENT,
  SMS_MESSAGE,
  ADMIN_EMAIL_CONTENT,
  DELAY_QUEUE,
  RETRY_ATTEMPTS,
  PRIORITY,
  DEVICE_TYPE,
  INVOICE_PREFIX,
  MAX_TIME_PER_REQUEST,
  MAX_REQUEST_PER_TIME,
  TOO_MANY_REQUEST_MESSAGE,
  NOTIFICATION_TITLE,
};
