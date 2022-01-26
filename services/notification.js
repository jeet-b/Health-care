const db = require("../config/db");
const Notification = require("../model/notification")(db);
const User = require("../model/user")(db);
const Log = require("../model/log")(db);
const { NOTIFICATION } = require("../config/constant/notification");
const { USER_ROLE } = require("../config/authConstant");
const { AWS_SNS } = require("../config/constant/thirdPartyApi");
const SNS = require("sns-mobile");
const _ = require("lodash");
const SnsAwsService = require("./sns/snsAws");
const Queue = require("bull");
const {
  DELAY_QUEUE,
  RETRY_ATTEMPTS,
  PRIORITY,
} = require("../config/authConstant");
const superagent = require("superagent");
const logType = require("../config/constant/log");
// let admin = require("firebase-admin");
// let serviceAccount = require("../fbase-service-account.json");

// //INITIALIZE FIREBASE
// admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });

const sendPushNotificationQueue = new Queue("pushNotification", {
  redis: {
    host: process.env.REDIS_HOST || "127.0.0.1",
    port: process.env.REDIS_PORT || 6379,
    password: "",
  },
});

console.info("sendPushNotificationQueue loaded 🍺🍻");

const handleFailure = (job, err) => {
  Object.assign(job, { name: "pushNotification" });
  if (job.attemptsMade >= job.opts.attempts) {
    console.info(
      `sendPushNotificationQueue: Job failures above threshold ${job.name}`,
      err
    );
    job.remove();
    return null;
  }
  console.info(
    `sendPushNotificationQueue: Job ${job.name} failed with ${err.message}. ${
      job.opts.attempts - job.attemptsMade
    } attempts left`
  );
};

const handleCompleted = (job) => {
  Object.assign(job, { name: "pushNotification" });
  console.info(`🌿   sendPushNotificationQueue: Job ${job.name} completed`);
  job.remove();
};

const handleStalled = (job) => {
  Object.assign(job, { name: "pushNotification" });
  console.info(`🌿   sendPushNotificationQueue: Job ${job.name} stalled`);
};
sendPushNotificationQueue.on("failed", handleFailure);
sendPushNotificationQueue.on("completed", handleCompleted);
sendPushNotificationQueue.on("stalled", handleStalled);

const pushNotificationQueue = async (
  userId,
  title,
  body,
  type,
  appointmentId,
  delay,
  attempts,
  priority
) => {
  let userData = await User.findById(userId);
  // console.log(userData.firebaseToken);
  const data = {
    tokens: userData.firebaseToken,
    title: title,
    body: body,
    type: type,
    appointmentId: appointmentId,
  };

  const options = {
    delay: delay || DELAY_QUEUE,
    attempts: attempts || RETRY_ATTEMPTS,
    priority: priority || PRIORITY,
  };
  sendPushNotificationQueue.add(data, options);
};

sendPushNotificationQueue.process(async (job) => {
  return await pushNotification(
    job.data.tokens,
    job.data.title,
    job.data.body,
    job.data.type,
    job.data.appointmentId
  );
});

async function pushNotification(tokens, title, body, type, appointmentId) {
  // const options = {
  //   priority: "high",
  //   timeToLive: 1,
  // };
  // let registration_ids = tokens[0];

  // let jsonData = {
  //   notification: {
  //     title: title,
  //     body: body,
  //   },
  //   data: {
  //     notification_type: "type",
  //     appointmentId: appointmentId,
  //     // 'click_action': "FLUTTER_NOTIFICATION_CLICK",
  //   },
  // };
  // admin
  //   .messaging()
  //   .sendToDevice(registration_ids, jsonData, options)
  //   .then(function (response) {
  //     console.log("Successfully sent message:", response);
  //   })
  //   .catch(function (error) {
  //     console.log("Error sending message:", error);
  //   });
  try {
    let jsonData = {
      // notification: {
      //   title: title,
      //   body: body,
      // },
      data: {
        notification_type: type,
        appointmentId: appointmentId,
        title: title,
        message: body,
        // 'click_action': "FLUTTER_NOTIFICATION_CLICK",
      },
      registration_ids: tokens,
    };
    // console.log(jsonData);
    await Log.create({
      data: jsonData,
      type: logType.type.NOTIFICATION,
      name: logType.name.PUSH_NOTIFICATION,
    });
    let results = await superagent
      .post(process.env.FIREBASE_NOTIFICATION_LINK)
      .send(jsonData)
      .set("Authorization", "key=" + process.env.FIREBASE_SERVERKEY)
      .set("Content-Type", "application/json");

    if (results.statusCode == 200) {
      return true;
    } else {
      console.log("Notification Not Sent!");
      return false;
    }
  } catch (error) {
    console.log("Notification ->:" + error.message);
    return false;
  }
}

const create = async (userId, title, content) => {
  try {
    let data = {
      title: title,
      userId: userId,
      content: content,
    };
    await Notification.create(data);
  } catch (error) {
    console.error("Error -> createNotification", error);
  }
};
// const sendSnsNotification = async (user, action, data) => {
//   try {
//     let messageContent = data;
//     let notificationDataRef = {
//       // appointmentId: appointment._id,
//       action: action,
//       user: {
//         name: user.name,
//         _id: user._id,
//       },
//     };
//     let notificationData = {
//       users: user._id,
//       content: messageContent,
//       data: notificationDataRef,
//       action: action,
//     };
//     let notificationObj = {};
//     if (user.androidEndpointArn && user.androidEndpointArn.length > 0) {
//       notificationObj = {
//         platform: SNS.SUPPORTED_PLATFORMS.ANDROID,
//         endpointArn: _.map(user.androidEndpointArn, (a) => {
//           return a.arn;
//         }),
//         platformApplicationArn: AWS_SNS.ANDROID_ARN,
//         data: {
//           data: {
//             message: messageContent,
//             data: notificationData,
//           },
//         },
//       };
//     }
//     if (user.iosEndpointArn && user.iosEndpointArn.length > 0) {
//       notificationObj = {
//         platform: SNS.SUPPORTED_PLATFORMS.IOS,
//         endpointArn: _.map(user.iosEndpointArn, (a) => {
//           return a.arn;
//         }),
//         ios_sendbox: isSandBox,
//         platformApplicationArn: isSandBox
//           ? AWS_SNS.IOS_SANDBOX_ARN
//           : AWS_SNS.IOS_PRODUCTION_ARN,
//         data: {
//           aps: {
//             alert: messageContent,
//             data: notificationData,
//             sound: "default",
//           },
//         },
//       };
//     }

//     if (notificationObj.endpointArn && notificationObj.endpointArn.length > 0) {
//       // console.log("a");
//       _.each(notificationObj.endpointArn, function (iosAndroidEPA) {
//         // console.log("b");
//         notificationObj.arn = iosAndroidEPA;
//         SnsAwsService.send(notificationObj).then(
//           (result) => {
//             console.log(result);
//           },
//           (err) => {
//             console.log("err", err);
//           }
//         );
//       });
//     }
//   } catch (error) {
//     console.log(error);
//     return { flag: false };
//   }
// };

// const sendSnsNotificationReminder = async (user, action, data) => {
//   try {
//     let messageContent = data;

//     let notificationDataRef = {
//       action: action,
//       user: {
//         name: user.fullName,
//         _id: user._id,
//       },
//     };
//     let notificationData = {
//       users: user._id,
//       content: messageContent,
//       data: notificationDataRef,
//       action: action,
//     };
//     let notificationObj = {};
//     if (user.androidEndpointArn && user.androidEndpointArn.length > 0) {
//       notificationObj = {
//         platform: SNS.SUPPORTED_PLATFORMS.ANDROID,
//         endpointArn: _.map(user.androidEndpointArn, (a) => {
//           return a.arn;
//         }),
//         platformApplicationArn: AWS_SNS.ANDROID_ARN,
//         data: {
//           data: {
//             message: messageContent,
//             data: notificationData,
//           },
//         },
//       };
//     }
//     if (user.iosEndpointArn && user.iosEndpointArn.length > 0) {
//       notificationObj = {
//         platform: SNS.SUPPORTED_PLATFORMS.IOS,
//         endpointArn: _.map(user.iosEndpointArn, (a) => {
//           return a.arn;
//         }),
//         ios_sendbox: isSandBox,
//         platformApplicationArn: isSandBox
//           ? AWS_SNS.IOS_SANDBOX_ARN
//           : AWS_SNS.IOS_PRODUCTION_ARN,
//         data: {
//           aps: {
//             alert: messageContent,
//             data: notificationData,
//             sound: "default",
//           },
//         },
//       };
//     }

//     if (notificationObj.endpointArn && notificationObj.endpointArn.length > 0) {
//       console.log("a");
//       _.each(notificationObj.endpointArn, function (iosAndroidEPA) {
//         console.log("b");
//         notificationObj.arn = iosAndroidEPA;
//         SnsAwsService.send(notificationObj).then(
//           (r) => {
//             console.log("send or not", r);
//           },
//           (err) => {
//             console.log("err", err);
//           }
//         );
//       });
//     }
//   } catch (error) {
//     console.log(error);
//     return { flag: false };
//   }
// };
module.exports = {
  create: create,
  // sendSnsNotification: sendSnsNotification,
  // sendSnsNotificationReminder: sendSnsNotificationReminder,
  pushNotificationQueue: pushNotificationQueue,
  pushNotification: pushNotification,
};
