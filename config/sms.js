const { BRAND_NAME, CMD_CANCEL } = require("../config/authConstant");
const Nexmo = require("nexmo");
const Queue = require("bull");
const { DELAY_QUEUE, RETRY_ATTEMPTS } = require("../config/authConstant");
const nexmo = new Nexmo({
  apiKey: process.env.NEXMO_API,
  apiSecret: process.env.NEXMO_SECRET,
});
const sendOTP = async (phoneNumber) =>
  new Promise(async (resolve, reject) => {
    try {
      nexmo.verify.request(
        {
          number: phoneNumber,
          brand: BRAND_NAME,
          workflow_id: 6,
          pin_expiry: 120,
          code_length: 6,
        },
        (err, result) => {
          if (err) {
            // throw new Error(err);
            return resolve(err);
          } else {
            let requestId = result.request_id;
            if (result.status == "0") {
              return resolve({
                requestId: requestId,
              });
            } else {
              return resolve(result.error_text);
            }
          }
        }
      );
    } catch (err) {
      return resolve(err);
    }
  });
const resendOTP = async (phoneNumber) =>
  new Promise(async (resolve, reject) => {
    try {
      nexmo.verify.request(
        {
          number: phoneNumber,
          brand: BRAND_NAME,
          workflow_id: 6,
          pin_expiry: 120,
          code_length: 6,
        },
        (err, result) => {
          if (err) {
            // throw new Error(err);
            return resolve(err);
          } else {
            let requestId = result.request_id;
            if (result.status == "0") {
              return resolve({
                requestId: requestId,
              });
            } else {
              return resolve(result.error_text);
            }
          }
        }
      );
    } catch (err) {
      return resolve(err);
    }
  });
const verifyOTP = async (requestId, pin) =>
  new Promise(async (resolve, reject) => {
    nexmo.verify.check(
      {
        request_id: requestId,
        code: pin,
      },
      (err, result) => {
        if (err) {
          // handle the error
          return resolve(err);
        } else {
          if (result && result.status == "0") {
            // Success!
            return resolve({
              verified: true,
            });
          } else {
            return resolve("wrong pin");
            // handle the error - e.g. wrong PIN
          }
        }
      }
    );
  });

const sendMessage = async (phoneNumber, message) =>
  new Promise(async (resolve, reject) => {
    try {
      const from = BRAND_NAME;
      const to = phoneNumber;
      const text = message;

      nexmo.message.sendSms(from, to, text, (err, responseData) => {
        if (err) {
          console.log(err);
        } else {
          if (responseData.messages[0]["status"] === "0") {
            console.log("Message sent successfully.");
            return resolve("Message Sent Successfully");
          } else {
            console.log(
              `Message failed with error: ${responseData.messages[0]["error-text"]}`
            );
            return reject({
              message: `Message failed with error: ${responseData.messages[0]["error-text"]}`,
            });
          }
        }
      });
    } catch (err) {
      return reject(err);
    }
  });

const sendSMSQueue = new Queue("sendMessage", {
  redis: {
    host: process.env.REDIS_HOST || "127.0.0.1",
    port: process.env.REDIS_PORT || 6379,
    password: "",
  },
});

console.info('sendSMSQueue loaded 🍺🍻')

const handleFailure = (job, err) => {
  Object.assign(job, {name: "sendMessage"});
    if (job.attemptsMade >= job.opts.attempts) {
        console.info(
            `sendSMSQueue: Job failures above threshold ${job.name}`,
            err
        );
        job.remove();
        return null;
    }
    console.info(
        `sendSMSQueue: Job ${job.name} failed with ${
            err.message
        }. ${job.opts.attempts - job.attemptsMade} attempts left`
    );
};

const handleCompleted = job => {
  Object.assign(job, {name: "sendMessage"});
    console.info(
        `🌿   sendSMSQueue: Job ${job.name} completed`
    );
    job.remove();
};

const handleStalled = job => {
  Object.assign(job, {name: "sendMessage"});
    console.info(
        `🌿   sendSMSQueue: Job ${job.name} stalled`
    );
};
sendSMSQueue.on("failed", handleFailure);
sendSMSQueue.on("completed", handleCompleted);
sendSMSQueue.on("stalled", handleStalled);

const SMSQueue = async (phoneNumber, message) => {
  const data = {
    phoneNumber: phoneNumber,
    message: message,
  };

  const options = {
    delay: DELAY_QUEUE,
    attempts: RETRY_ATTEMPTS,
  };
  sendSMSQueue.add(data, options);
};
sendSMSQueue.process(async (job) => {
  return await sendMessage(job.data.phoneNumber, job.data.message);
});

module.exports = {
  sendOTP: sendOTP,
  verifyOTP: verifyOTP,
  resendOTP: resendOTP,
  sendMessage: sendMessage,
  SMSQueue: SMSQueue,
};
