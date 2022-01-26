const _ = require("lodash");
const { AWS_SNS } = require("../../config/constant/thirdPartyApi");
var SNS = require("sns-mobile");
// const Config = require("../configs/constant/config")
// let config = new Config()

// let isSandBox = config.isSandBoxSns
//------------------------------------not use now
module.exports = {
  /**
   * @description: send push notification
   * @param options "{
   *                      "message":<string>,
   *                      "to":<string> // comma separated number(s)
   *                 }"
   * @param callback
   */
  send: async (obj) => {
    // console.log("****************", JSON.stringify(obj));
    var snsApp = new SNS({
      platform: obj.platform,
      //region: 'us-west-2',
      region: AWS_SNS.REGION,
      accessKeyId: AWS_SNS.ACCESS_KEY_ID,
      secretAccessKey: AWS_SNS.SECRET_ACCESS_KEY,
      platformApplicationArn: obj.platformApplicationArn,
    });
    // Send a simple String or data to the client

    if (_.isBoolean(obj.ios_sendbox) && obj.ios_sendbox) {
      snsApp.sandbox = true; //(This is required for targetting (iOS) APNS_SANDBOX only)
    }
    // let sendMessageResponse = await promiseSendMessages(obj.arn, obj.data)
    // snsApp.sendMessage(obj.arn, obj.data, (err, messageId) => {
    //     console.log("messageId", messageId)
    //     if (err) {
    //         console.log("push notification Error :- ", err, messageId)
    //     }
    // });
    let response = await new Promise((resolve, reject) => {
      snsApp.sendMessage(obj.arn, obj.data, (err, messageId) => {
        if (err) {
          console.log(err);
          let errObj = {
            flag: false,
            err: err,
            messageId: messageId,
          };
          resolve(errObj);
        }
        let resObj = {
          flag: true,
          messageId: messageId,
        };
        resolve(resObj);
      });
    });
    return response;
  },
  sendSnsNotification: async (obj) => {
    // console.log("2a");
    //androidApp.sandbox = true;
    this.send(obj)
      .then((result) => {
        console.log("result", result);
      })
      .catch((err) => {
        console.log("err", err);
      });
  },

  // Do basic setup with SNS credentials
  async snsSetup(obj) {
    // console.log("1a");

    if (!obj.platformApplicationArn || obj.platformApplicationArn == "") {
      // console.log("1b");

      switch (obj.platform) {
        case SNS.SUPPORTED_PLATFORMS.ANDROID:
          obj.platformApplicationArn = AWS_SNS.ANDROID_ARN;
          break;
        case SNS.SUPPORTED_PLATFORMS.IOS:
          obj.platformApplicationArn = isSandBox
            ? AWS_SNS.IOS_SANDBOX_ARN
            : AWS_SNS.IOS_SANDBOX_ARN;
          break;
      }
    }

    let setup = new SNS({
      platform: obj.platform,
      //region: 'us-west-2',
      region: AWS_SNS.REGION,
      apiVersion: AWS_SNS.API_VERSION,
      accessKeyId: AWS_SNS.ACCESS_KEY_ID,
      secretAccessKey: AWS_SNS.SECRET_ACCESS_KEY,
      platformApplicationArn: obj.platformApplicationArn,
    });

    // If IOS arn is for sandbox then => sandbox attribute - true
    if (
      setup.platform == SNS.SUPPORTED_PLATFORMS.IOS &&
      setup.platformApplicationArn
    ) {
      setup.sandbox =
        setup.platformApplicationArn.toLowerCase().indexOf("sandbox") >= 0
          ? true
          : false;
    }
    // console.log("1c");

    return setup;
  },

  /**
   * add user and generate arn
   * @param obj   {
   *                  token: <string> - device token,
   *                  arn_setup: arn_setup_obj
   *               }
   * @returns {Promise.<void>}
   */
  async createArn(obj) {
    // console.log("obj", obj);
    let snsObject = await this.snsSetup(obj.arnSetup);
    // console.log("snsObject", snsObject);
    let arn = await new Promise((resolve, reject) => {
      snsObject.addUser(obj.token, null, function (err, arn) {
        if (err) {
          console.log("error", err);
          reject(new Error(err));
        } else {
          console.log(arn);
          resolve(arn);
        }
      });
    });
    // console.log("g");
    return arn;
  },
};

async function promiseSendMessages(objArn, objData) {
  return new Promise(function (resolve, reject) {
    snsApp.sendMessage(objArn, objData, (err, messageId) => {
      console.log("messageId", messageId);
      if (err) {
        let errObj = {
          flag: false,
          err: err,
          messageId: messageId,
        };
        reject(errObj);
      } else {
        let resObj = {
          flag: true,
          messageId: messageId,
        };
        resolve(resObj);
      }
    });
  });
}
