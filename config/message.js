/**
 * Configuration file where you can store error codes for responses
 */
module.exports = {
  MESSAGE: {
    NO_FILE: {
      message: "No one file is selected now, so please choose file to upload.",
    },
    FILE_UPLOADED: {
      message: "File uploaded successfully.",
    },
    ADDRESS_CREATED: {
      message: "Address created successfully.",
    },
    ADDRESS_UPDATED: {
      message: "Address updated successfully.",
    },
    ADDRESS_FETCHED: {
      message: "Address retrieved successfully.",
    },
    PATIENT_SUBSCRIPTION: {
      message: "Prescription fax sent successfully.",
    },
    BAD_REQUEST: {
      code: "E_BAD_REQUEST",
      message: "The request cannot be fulfilled due to bad syntax",
      status: 400,
    },
    CREATED: {
      code: "CREATED",
      message:
        "The request has been fulfilled and resulted in a new resource being created.",
      status: 201,
    },
    CREATE_FAILED: {
      code: "CREATE_FAILED",
      message: "The request has not been fulfilled, Please try again",
      status: 500,
    },
    IS_REQUIRED: {
      message: "is required.",
      code: "UNPROCESSABLE_ENTITY",
      status: 422,
    },
    IS_DUPLICATE: {
      message: "already exists.",
      code: "UNPROCESSABLE_ENTITY",
      status: 422,
    },
    FORBIDDEN: {
      code: "E_FORBIDDEN",
      message: "User not authorized to perform the operation",
      status: 403,
    },
    NOT_FOUND: {
      message:
        "The requested resource could not be found but may be available again in the future",
    },
    RECORD_NOT_FOUND: {
      message: "Record not found",
    },
    OK: {
      message: "Operation is successfully executed.",
      status: 200,
    },
    FAX_RESEND_SUCCESSFULLY: {
      code: "OK",
      message: "Fax resend successfully.",
      status: 200,
    },
    FAX_STATUS_UPDATED: {
      code: "OK",
      message: "Fax status updated successfully.",
      status: 200,
    },
    LOGOUT: {
      code: "OK",
      message: "Successfully logout.",
      status: 200,
    },
    SERVER_ERROR: {
      code: "E_INTERNAL_SERVER_ERROR",
      message: "Something bad happened on the server.",
      status: 500,
    },
    UNAUTHORIZED: {
      code: "E_UNAUTHORIZED",
      message: "Missing or invalid authentication token.",
      status: 401,
    },
    USER_NOT_FOUND: {
      code: "E_USER_NOT_FOUND",
      message: "User with specified credentials is not found.",
      status: 401,
    },
    EMAIL_PASS_NOT_MATCHED: {
      code: "E_USER_NOT_FOUND",
      message: "Email address and password doesn't match.",
      status: 401,
    },
    BLOCKED_FOR_WRONG_ATTEMPTS: {
      code: "E_USER_NOT_FOUND",
      message:
        "Your account has been blocked for multiple wrong password attempts. Please try again later.",
      status: 401,
    },
    USER_REGISTERED: {
      code: "OK",
      message: "User registered successfully.",
      status: 200,
    },
    USER_ADDED: {
      code: "OK",
      message: "User added successfully.",
      status: 200,
    },
    USER_UPDATED: {
      code: "OK",
      message: "User updated successfully.",
      status: 200,
    },
    EMAIL_REGISTERED: {
      code: "E_DUPLICATE",
      message: "This Email Address is already registered",
      status: 401,
    },
    MOBILE_REGISTERED: {
      code: "E_DUPLICATE",
      message: "This phone number is already registered.",
      status: 401,
    },
    USER_NOT_ACTIVE: {
      code: "E_UNAUTHORIZED",
      message: "Your account is deactivated.",
      status: 200,
    },
    USER_EMAIL_NOT_VERIFIED: {
      code: "E_UNAUTHORIZED",
      message: "Your email is not verified.",
      status: 200,
    },
    USER_MOBILE_NOT_VERIFIED: {
      code: "E_UNAUTHORIZED",
      message: "Your mobile is not verified.",
      status: 200,
    },
    USERNAME_REGISTERED: {
      code: "E_DUPLICATE",
      message: "Username already registered.",
      status: 200,
    },
    USER_CONTACT_DETAILS: {
      code: "OK",
      message: "Contact details are successfully retrieved.",
      status: 200,
    },
    USER_CONTACT_DETAILS_UPDATED: {
      code: "OK",
      message: "Contact details are successfully updated.",
      status: 200,
    },
    USER_CONTACT_DETAILS_DELETED: {
      code: "OK",
      message: "Contact details are successfully deleted.",
      status: 200,
    },
    USER_REGISTER_FAILED: {
      code: "E_INTERNAL_SERVER_ERROR",
      message: " Failed to registered user.",
      status: 401,
    },
    LOGIN: {
      code: "OK",
      message: "Successfully login.",
      status: 200,
    },
    INVALID_USERNAME: {
      code: "E_BAD_REQUEST",
      message: "Invalid username.",
      status: 401,
    },
    INVALID_PASSWORD: {
      code: "E_BAD_REQUEST",
      message: "Invalid password.",
      status: 401,
    },
    INVALID_PASSWORD_CURRENT: {
      code: "E_BAD_REQUEST",
      message: "Current password is wrong.",
      status: 401,
    },
    INVALID_TOKEN: {
      code: "E_BAD_REQUEST",
      message: "Invalid token.",
      status: 401,
    },
    INVALID_OTP: {
      code: "E_BAD_REQUEST",
      message: "Entered code is incorrect. Try again",
      status: 401,
    },
    PROFILE_UPDATED: {
      code: "OK",
      message: "Profile updated successfully.",
      status: 200,
    },

    USER_LIST_NOT_FOUND: {
      code: "E_NOT_FOUND",
      message: "User not found.",
      status: 404,
    },
    USER_DELETED: {
      code: "OK",
      message: "User(s) deleted successfully.",
      status: 200,
    },
    USER_PASSWORD_RESET: {
      code: "OK",
      message: "Password changed successfully.",
      status: 200,
    },
    USER_OTP_SENT: {
      code: "OK",
      message: "Password reset otp sent successfully.",
      status: 200,
    },

    OTP_VERIFIED: {
      code: "OK",
      message: "OTP verified successfully.",
      status: 200,
    },

    OTP_SENT: {
      code: "OK",
      message: "OTP sent successfully.",
      status: 200,
    },
    RESET_PASSWORD_LINK_EXPIRE: {
      code: "E_BAD_REQUEST",
      message: "Your reset password link is expired or invalid",
      status: 401,
    },
    OTP_EXPIRE: {
      code: "E_BAD_REQUEST",
      message: "Your OTP has been expired.",
      status: 401,
    },
    EMAIL_VERIFIED: {
      code: "OK",
      message: "Your email address has been successfully verified.",
      status: 200,
    },
    MOBILE_VERIFIED: {
      code: "OK",
      message: "Your mobile number has been successfully verified.",
      status: 200,
    },
    USER_MOBILE_NOT_VERIFIED_UPDATE: {
      code: "BAD_REQUEST",
      message: "Verify your mobile number before update.",
      status: 200,
    },
    INVALID_VERIFICATION_TOKEN: {
      code: "E_USER_NOT_FOUND",
      message: "Your token is invalid or expired.",
      status: 401,
    },
    EMAIL_ALREADY_VERIFIED: {
      code: "E_BAD_REQUEST",
      message: "Email is already verified.",
      status: 401,
    },
    MOBILE_ALREADY_VERIFIED: {
      code: "E_BAD_REQUEST",
      message: "Mobile number is already verified.",
      status: 401,
    },
    EMAIL_VERIFICATION: {
      code: "OK",
      message: "Please check your email for verification link.",
      status: 200,
    },
    MOBILE_VERIFICATION: {
      code: "OK",
      message: "OTP has been sent to your mobile number.",
      status: 200,
    },
    RESET_PASSWORD_LINK: {
      code: "OK",
      message: "Please check your email to reset your password.",
      status: 200,
    },
    RESET_PASSWORD_LINK_MOBILE: {
      code: "OK",
      message: "Please check your mobile to reset your password.",
      status: 200,
    },
    USER_NOT_EXIST_FOR_EMAIL: {
      code: "E_NOT_FOUND",
      message: "This email address is not registered.",
      status: 200,
    },

    NO_RECORD_FOUND: {
      code: "E_NOT_FOUND",
      message: "No record found.",
      status: 402,
    },

    LIST_NOT_FOUND: {
      code: "E_NOT_FOUND",
      message: "List not found.",
      status: 200,
    },
    EMAIL_NOT_REGISTERED: {
      code: "E_DUPLICATE",
      message: "This isn't an email we know.",
      status: 200,
    },
    EMAIL_NOT_FOUND: {
      code: "E_USER_NOT_FOUND",
      message: "Email address does not exist.",
      status: 200,
    },
    EMAIL_CANT_LOGIN_PATIENT: {
      code: "E_USER_NOT_FOUND",
      message: "You can't login as patient with this email.",
      status: 200,
    },
    EMAIL_CANT_LOGIN_PHYSICIAN: {
      code: "E_USER_NOT_FOUND",
      message: "You can't login as physician with this email.",
      status: 200,
    },
    CONTACT_US_CREATED: {
      code: "OK",
      message:
        "Your contact enquiry is submitted. Our support team will contact you soon.",
      status: 200,
    },
    NOTIFICATION_SEND_SUCCESSFULLY: {
      message: "Notification send Successfully",
    },
    SOMETHING_WENT_WRONG: {
      message: "Something went wrong.",
    },
    FAILED_TO_UPDATE_ALL_RECORDS: {
      message: "Failed to update all records",
    },
    ERROR: {
      message: "Error.",
    },
    REQUEST_IS_NOT_VALID_TRY_AGAIN: {
      message: "This request is not valid , Please try again !.",
    },
    SUCCESS: {
      message: "success",
    },
    FILE_UPLOADED_SUCCESSFULLY: {
      message: " file uploaded successfully",
    },
    FILE_DELETED_SUCCESSFULLY: {
      message: " file deleted successfully",
    },
    DELETE_SUCCESSFULLY: {
      message: "deleted successfully.",
    },
    LINK_SHARE_SUCCESSFULLY: {
      message: "Link Shared successfully.",
    },
    CONFIG_NOT_FOUND: {
      code: "E_NOT_FOUND",
      message: "Configuration not found.",
      status: 200,
    },
    CONFIG_UPDATED: {
      code: "OK",
      message: "Configuration is successfully updated.",
      status: 200,
    },
    EMAIL_VERIFICATION_OTP: {
      code: "OK",
      message: "OTP has been sent to your email.",
      status: 200,
    },
    LOGIN_OTP_VERIFIED: {
      code: "OK",
      message: "Your log in OTP has been successfully verified.",
      status: 200,
    },
    UPDATE_PROFILE_OTP_VERIFIED: {
      code: "OK",
      message: "Your mobile verification OTP has been successfully verified.",
      status: 200,
    },
    RECORDS_STATUS_UPDATE: {
      code: "OK",
      message: "Records status updated successfully.",
      status: 200,
    },
    RECORD_DELETED_SUCCESSFULLY: {
      code: "OK",
      message: "Record deleted successfully.",
      status: 200,
    },
    MASTER_NAME_DUPLICATE: {
      code: "E_DUPLICATE",
      message: "Name must not be duplicate.",
    },

    //Appointment

    //Patient
    PATIENT_HAS_UPCOMING_APPOINTMENTS: {
      code: "UNPROCESSABLE_ENTITY",
      message: `Patient has upcoming appointments.`,
      status: 401,
    },

    PATIENT_HAS_ONGOING_APPOINTMENT: {
      code: "BAD_REQUEST",
      message: `Patient has an ongoing appointment. can't deactivate patient.`,
      status: 401,
    },

    //Physician
    PHYSICIAN_HAS_UPCOMING_APPOINTMENTS: {
      code: "UNPROCESSABLE_ENTITY",
      message: `Physician has upcoming appointments.`,
      status: 401,
    },

    PHYSICIAN_HAS_ONGOING_APPOINTMENT: {
      code: "BAD_REQUEST",
      message: `Physician has an ongoing appointment. can't deactivate physician.`,
      status: 401,
    },

    //Specialization
    SPECIALIZATION_NAME: {
      code: "E_DUPLICATE",
      message: "Specialization name must not be a duplicate.",
      status: 200,
    },
    SPECIALIZATION_CREATED: {
      code: "OK",
      message: "Specialization added successfully.",
      status: 200,
    },
    SPECIALIZATION_FAILED: {
      code: "E_INTERNAL_SERVER_ERROR",
      message: "Failed to add Specialization.",
      status: 401,
    },
    SPECIALIZATION_RETRIEVE: {
      code: "OK",
      message: "Specialization retrieve successfully.",
      status: 200,
    },
    SPECIALIZATION_UPDATED: {
      code: "OK",
      message: "Specialization updated successfully.",
      status: 200,
    },
    SPECIALIZATION_DELETED: {
      code: "OK",
      message: "Specialization deleted successfully.",
      status: 200,
    },

    RESET_PASSWORD_OTP_VERIFIED: {
      code: "OK",
      message: "Your reset password OTP has been successfully verified.",
      status: 200,
    },

    RESET_PASSWORD_SUCCESSFULLY: {
      code: "OK",
      message: "Your password has been successfully reset.",
      status: 200,
    },

    EMAIL_NOT_EXISTS: {
      code: "E_NOT_FOUND",
      message: "Entered email does not exists.",
      status: 200,
    },

    //NOTIFICATIONS

    NOTIFICATION_CLEAR_ALL: {
      code: "OK",
      message: "All notifications cleared.",
      status: 200,
    },
    NOTIFICATION_READ_ALL: {
      code: "OK",
      message: "All notifications read.",
      status: 200,
    },
    NOTIFICATION_STATUS_UPDATE: {
      code: "OK",
      message: "Notification status updated successfully.",
      status: 200,
    },

    //CRUD Messages

    PHARMACY_ADDED: {
      code: "OK",
      message: "Pharmacy added successfully.",
      status: 200,
    },
    PHARMACY_UPDATED: {
      code: "OK",
      message: "Pharmacy updated successfully.",
      status: 200,
    },
    PHARMACY_DELETED: {
      code: "OK",
      message: "Pharmacy deleted successfully.",
      status: 200,
    },
    SPECIALIZATION_ADDED: {
      code: "OK",
      message: "Specialization added successfully.",
      status: 200,
    },
    SPECIALIZATION_UPDATED: {
      code: "OK",
      message: "Specialization updated successfully.",
      status: 200,
    },
    SPECIALIZATION_DELETED: {
      code: "OK",
      message: "Specialization deleted successfully.",
      status: 200,
    },
    VERSION_ADDED: {
      code: "OK",
      message: "Version added successfully.",
      status: 200,
    },
    VERSION_UPDATED: {
      code: "OK",
      message: "Version updated successfully.",
      status: 200,
    },
    VERSION_DELETED: {
      code: "OK",
      message: "Version deleted successfully.",
      status: 200,
    },
    FAQ_ADDED: {
      code: "OK",
      message: "FAQs added successfully.",
      status: 200,
    },
    FAQ_UPDATED: {
      code: "OK",
      message: "FAQs updated successfully.",
      status: 200,
    },
    PROMOCODE_DELETED: {
      code: "OK",
      message: "Promocode deleted successfully.",
      status: 200,
    },
    PROMOCODE_ADDED: {
      code: "OK",
      message: "Promocode added successfully.",
      status: 200,
    },
    PROMOCODE_CODE_DUPLICATE: {
      code: "E_DUPLICATE",
      message: "Promocode code must not be a duplicate.",
      status: 200,
    },
    PROMOCODE_UPDATED: {
      code: "OK",
      message: "Promocode updated successfully.",
      status: 200,
    },
    PROMOCODE_DELETED: {
      code: "OK",
      message: "Promocode deleted successfully.",
      status: 200,
    },
    PROMOCODE_INVALID: {
      code: "BAD_REQUEST",
      message: "Promocode is not valid.",
      status: 200,
    },
    PROMOCODE_APPLIED: {
      code: "OK",
      message: "Promocode applied successfully.",
      status: 200,
    },
    PROMO_CODE_LIMIT_REACHED: {
      code: "UNPROCESSABLE_ENTITY",
      message: `Maximum limit reached for the Promo Code.`,
      status: 401,
    },

    MASTER_CREATED: {
      code: "OK",
      message: "Master added successfully.",
      status: 200,
    },
    SUB_MASTER_CREATED: {
      code: "OK",
      message: "Submaster added successfully.",
      status: 200,
    },
    MASTER_UPDATED: {
      code: "OK",
      message: "Master updated successfully.",
      status: 200,
    },
    SUB_MASTER_UPDATED: {
      code: "OK",
      message: "Submaster updated successfully.",
      status: 200,
    },

    STRIPE_CARD_SUCCESS: {
      code: "OK",
      message: "Card added successfully.",
      status: 200,
    },
    STRIPE_CARD_PRIMARY_NOT_REMOVED: {
      code: "UNPROCESSABLE_ENTITY",
      status: 422,
      message: "Primary card cannot be removed.",
    },
    STRIPE_CARD_UPDATED: {
      code: "OK",
      message: "Card updated successfully.",
      status: 200,
    },
    STRIPE_CARD_REMOVED: {
      code: "OK",
      message: "Card removed successfully.",
      status: 200,
    },
    STRIPE_CARD_PRIMARY: {
      code: "OK",
      message: "Card set default successfully.",
      status: 200,
    },
    STRIPE_CUSTOMER_CARD_ALREADY_EXISTS: {
      code: "E_BAD_REQUEST",
      message: "This card already exists in your account.",
      status: 401,
    },
    APPOINTMENT_NOT_FOUND: {
      code: "E_NOT_FOUND",
      message: "Appointment not found.",
      status: 404,
    },
    APPOINTMENT_LIST_NOT_FOUND: {
      code: "E_NOT_FOUND",
      message: "Appointments not found.",
      status: 404,
    },
    APPOINTMENT_ALREADY_PAID: {
      code: "OK",
      message: "Appointment payment already done.",
      status: 200,
    },
    APPOINTMENT_CHARGE_SUCCESS: {
      code: "OK",
      message: "Appointment payment successfull.",
      status: 200,
    },
    APPOINTMENT_CHARGE_FAILED: {
      code: "OK",
      message: "Appointment payment failed.",
      status: 200,
    },
    NOTIFICATIONS: {
      code: "OK",
      message: "Notifications routes are retrieved successfully.",
      status: 200,
    },
    NOTIFICATIONS_UPADTED: {
      code: "OK",
      message: "Notifications routes are updated successfully.",
      status: 200,
    },
    FAX_RETRIEVED: {
      code: "OK",
      message: "Fax details retrieved successfully.",
      status: 200,
    },
    FAX_FILTER_RETRIEVED: {
      code: "OK",
      message: "Fax filters are retrieved successfully.",
      status: 200,
    },
    ROLE_NOT_FOUND: {
      message: "Role not found",
    },
    ERROR_IN_REGISTER: {
      message: "Error in Register",
    },
  },
  NOTIFICATION_MESSAGE: {
    WELCOME_MESSAGE: () => {
      return `Thank you for joining QR8! We're sure you'll love connecting through our platform.`;
    },
    LOGIN_SUCCESSFUL: () => {
      return `Login Successful`;
    },
    RESET_PASSWORD: () => {
      return `Your password has been successfully updated.`;
    },
    EMAIL_CHANGED: () => {
      return `Email Changed Successfully`;
    },
    DEACTIVATION: () => {
      return `After being inactive for while. Your Qr8 account has been deactivated`;
    },
    CONTACT_CHANGED: () => {
      return `Contact/Cell/Mobile number details are updated.`;
    },
    APPROVED: () => {
      return `Your data is verified and approved`;
    },
    PENDING_APPROVAL: () => {
      return `Pending approval`;
    },
    SERVICE_ADDED: () => {
      return `Admin Created New Services.`;
    },
    SERVICE_UPDATED: () => {
      return `Existing Service Updated`;
    },
    OTP: (otp) => {
      return `Here is your QR8 otp: ${otp}`;
    },
    FORGOT_PASSWORD: (otp) => {
      return `The OTP  for reset password is ${otp}.`;
    },
    ADMIN_FORGOT_PASSWORD: (url) => {
      return `The link for changing the password is <a href=${url} target='_blank'>here</a>`;
    },
    APPOINTMENT_REMINDER: () => {
      return `Get ready! Your appointment on QR8 is in 10 minutes.`;
    },
    APPOINTMENT_BOOKED_PATIENT: (providerName) => {
      return `Your appointment with ${providerName} has been successfully scheduled.`;
    },
    APPOINTMENT_BOOKED_PHYSICIAN: (patientName, date, startTime) => {
      return `${patientName} has scheduled an appointment with you on ${date} at ${startTime}`;
    },
    VIDEO_CALL_COMPLETED: () => {
      return `Video Call has been completed.`;
    },
    VIDEO_CALL_NO_SHOW_PHYSICIAN: (patientName, providerName) => {
      return `An appointment has been cancelled because ${patientName} joined the call but the ${providerName} did not after 10 minutes `;
    },
    VIDEO_CALL_NO_SHOW_PATIENT: (patientName, providerName) => {
      return `An appointment has been cancelled because ${providerName} joined the call but the ${patientName} did not after 10 minutes `;
    },
    APPOINTMENT_MISSED: () => {
      return `You have missed your appointment.`;
    },
    FOLLOWUP_REMINDER_10_WEEKS_PATIENT: (apid, providerName) => {
      return `Please schedule a followup appointment for  ${apid} as you have completed the treatment assigned to you  by the ${providerName}.`;
    },
    FOLLOWUP_REMINDER_10_WEEKS_PHYSICIAN: (apid) => {
      return `Please schedule a followup appointment for ${apid} as patient has completed 3 months of treatment.`;
    },
    FOLLOWUP_REMINDER_12_WEEKS_PATIENT: (apid, providerName) => {
      return `Its been 12 weeks since you have started the treatment assigned by ${providerName} for an appointment ${apid}. You can now schedule followup appointment.`;
    },
    FOLLOWUP_REMINDER_12_WEEKS_PHYSICIAN: (apid) => {
      return `Its been 12 weeks since your patient has started the treatment assigned by you for an appointment ${apid}. You can now schedule followup appointment.`;
    },
    TREATMENT_PAYMENT_REMINDER_10_WEEKS: (apid) => {
      return `Please pay for the treatment for ${apid}.`;
    },
    TREATMENT_PAYMENT_REMINDER_12_WEEKS: (apid) => {
      return `Please pay for the treatment for ${apid}.`;
    },
    // TREATMENT_ASSIGNED: () => {
    //   return `New Treatment assigned`;
    // },
    VIDEOCALL_REMINDER_PHYSICIAN: () => {
      return `Please join the call the patient is waiting for the call`;
    },
    VIDEOCALL_REMINDER_PATIENT: () => {
      return `Please join the call the physician is waiting for the call`;
    },
    PHYSICIAN_VIDEO_CALL_REMINDER_1: () => {
      return `Reminder alert! You have a QR8 appointment now! The patient is waiting for you. Please log in and join the call immediately!`;
    },
    PHYSICIAN_VIDEO_CALL_REMINDER_5: () => {
      return `Reminder alert! Your QR8 appointment started 5 minutes ago! The patient is waiting for you now. If you are having trouble connecting, you may also use the direct phone calling feature to complete the virtual appointment. Please log in and join your call now!`;
    },
    PHYSICIAN_VIDEO_CALL_REMINDER_10: () => {
      return `Your appointment cannot be completed. We are committed to resolving any issues that may have contributed to today’s cancellation. Thank you for your patience while we look into the matter.`;
    },
    PATIENT_VIDEO_CALL_REMINDER_1: () => {
      return `Reminder alert! You have a QR8 appointment now! Your Physician is waiting for you. Please log in and join the call immediately.`;
    },
    PATIENT_VIDEO_CALL_REMINDER_5: () => {
      return `Reminder alert! You have a QR8 appointment that was booked 5 minutes ago! Your Physician is waiting for you now. If you are having trouble using the video services, please keep trying or the consultant may try to contact you on your phone. Thank you and keep trying to connect!`;
    },
    PATIENT_VIDEO_CALL_REMINDER_10: () => {
      return `Your appointment cannot be completed. We are committed to resolving any issues that may have contributed to today’s cancellation. Thank you for your patience while we look into the matter.`;
    },
    APPOINTMENT_INVOICE: () => {
      return `Your payment invoice.`;
    },
    TREATMENT_NOT_ASSIGNED: (patientName, apid) => {
      return `You have not assigned treatment for appointment ${apid} with ${patientName}`;
    },
    TREATMENT_ASSIGNED: (apid) => {
      return `You have been assigned treatment for appointment ${apid}`;
    },
    PHYSICIAN_RATED: (patientName, apid) => {
      return `You have been rated for appointment ${apid} from ${patientName}`;
    },
    FOLLOW_UP_APPOINTMENT_BOOK: (patientName, apid) => {
      return `Your follow up appointment is booked with ${patientName} and booking appointment ID is ${apid}`;
    },
    RESCHEDULE_APPOINTMENT_PHYSICIAN: (patientName, apid) => {
      return `Your appointment has been rescheduled with ${patientName} and booking appointment ID is ${apid}`;
    },
    RESCHEDULE_APPOINTMENT_PATIENT: (providerName, apid) => {
      return `Your appointment has been rescheduled with ${providerName} and booking appointment ID is ${apid}`;
    },
    APPOINTMENT_CANCELLED_PHYSICIAN: (patientName, apid) => {
      return `Your appointment has been cancelled with ${patientName} and appointment ID is ${apid}`;
    },
    APPOINTMENT_CANCELLED_PATIENT: (providerName, apid) => {
      return `Your appointment has been cancelled with ${providerName} and appointment ID is ${apid}`;
    },
    PAYMENT_FAILED_PHYSICIAN: (patientName, apid) => {
      return `Payment failed by ${patientName} for appointment ID ${apid}`;
    },
    PAYMENT_SUCCESS_PHYSICIAN: (patientName, apid) => {
      return `Payment success by ${patientName} for appointment ID ${apid}`;
    },
    PAYMENT_FAILED_PATIENT: (apid) => {
      return `Payment failed for appointment ID ${apid}`;
    },
    PAYMENT_SUCCESS_PATIENT: (apid) => {
      return `Payment success for appointment ID ${apid}`;
    },
    PAYMENT_SUCCESS_ADMIN: (apid, date, time, transactionId) => {
      return `Payment success for appointment ID ${apid} on ${date} at ${time} having transaction ID ${transactionId}`;
    },
    PAYMENT_FAILED_ADMIN: (apid, date, time, transactionId) => {
      return `Payment failed for appointment ID ${apid} on ${date} at ${time} having transaction ID ${transactionId}`;
    },
    ADMIN_BOOKED_APPOINTMENT_PHYSICIAN: (patientName, apid) => {
      return `Qr8 Created An appointment with ${patientName} and booking appointment ID is ${apid}`;
    },
    ADMIN_BOOKED_APPOINTMENT_PATIENT: (providerName, apid) => {
      return `Qr8 Created An appointment for you with ${providerName} and booking appointment ID is ${apid}`;
    },
    FOLLOW_UP_AVAILABLE: (apid) => {
      return `You have been assigned follow up date for appointment ${apid}`;
    },
    NEW_PHYSICIAN_SIGNED_UP: (providerName) => {
      return `A new physician ${providerName} signed up on QR8`;
    },
    CHAT_REQUESTED: (username) => {
      return `${username} has requested to chat with you`;
    },
    PHYSICIAN_APPROVED: () => {
      return `You have been approved by QR8`;
    },
    RESET_PASSWORD_LINK: (link) => {
      return `The reset password link provided by Qr8 is <a href=${link} target='_blank'>here</a>`;
    },
    INVITE_LINK: (link) => {
      return `The invite link provided by Qr8 is <a href=${link} target='_blank'>here</a>`;
    },
  },
};
