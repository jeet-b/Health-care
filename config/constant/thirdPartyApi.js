const dotenv = require("dotenv");
dotenv.config();
module.exports = {
  AWS_SNS: {
    REGION: process.env.AWS_SNS_REGION,
    ACCESS_KEY_ID: process.env.AWS_SNS_ACCESS_KEY_ID ,
    SECRET_ACCESS_KEY: process.env.AWS_SNS_SECRET_ACCESS_KEY,
    API_VERSION: "",
    IOS_PRODUCTION_ARN: "",
    ANDROID_ARN: process.env.AWS_SNS_ANDROID_ARN,
    IOS_SANDBOX_ARN: process.env.AWS_SNS_IOS_SANDBOX_ARN,
  },
};
