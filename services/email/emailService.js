const nodemailer = require("nodemailer");
const ejs = require("ejs");
const AWS = require("aws-sdk");
const Queue = require("bull");
const {
  DELAY_QUEUE,
  RETRY_ATTEMPTS,
  PRIORITY,
} = require("../../config/authConstant");
const MailComposer = require("nodemailer/lib/mail-composer");
const SESConfig = {
  apiVersion: "2010-12-01",
  accessKeyId: process.env.AWS_SES_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SES_SECRET_ACCESS_KEY,
  region: process.env.AWS_SES_REGION,
};

const sendMailQueue = new Queue("sendSESEmail", {
  redis: {
    host: process.env.REDIS_HOST || "127.0.0.1",
    port: process.env.REDIS_PORT || 6379,
    password: "",
  },
});

console.info('sendMailQueue loaded 🍺🍻')

const handleFailure = (job, err) => {
  Object.assign(job, {name: "sendSESEmail"});
    if (job.attemptsMade >= job.opts.attempts) {
        console.info(
            `sendMailQueue: Job failures above threshold ${job.name}`,
            err
        );
        job.remove();
        return null;
    }
    console.info(
        `sendMailQueue: Job ${job.name} failed with ${
            err.message
        }. ${job.opts.attempts - job.attemptsMade} attempts left`
    );
};

const handleCompleted = job => {
  Object.assign(job, {name: "sendSESEmail"});
    console.info(
        `🌿   sendMailQueue: Job ${job.name} completed`
    );
    job.remove();
};

const handleStalled = job => {
  Object.assign(job, {name: "sendSESEmail"});
    console.info(
        `🌿   sendMailQueue: Job ${job.name} stalled`
    );
};
sendMailQueue.on("failed", handleFailure);
sendMailQueue.on("completed", handleCompleted);
sendMailQueue.on("stalled", handleStalled);

const emailQueue = async (
  email,
  subjectData,
  htmlContentData,
  delay,
  attempts,
  priority
) => {
  const data = {
    email: email,
    subjectData: subjectData,
    htmlContentData: htmlContentData,
  };

  const options = {
    delay: delay || DELAY_QUEUE,
    attempts: attempts || RETRY_ATTEMPTS,
    priority: priority || PRIORITY,
  };
  sendMailQueue.add(data, options);
};

sendMailQueue.process(async (job) => {
  return await sendSESEmail(
    job.data.email,
    job.data.subjectData,
    job.data.htmlContentData
  );
});

const generateRawMailData = (message) => {
  let mailOptions = {
    from: message.fromEmail,
    to: message.to,
    subject: message.subject,
    html: message.bodyHtml,
    attachments: message.attachments.map((a) => ({
      filename: a.filename,
      content: a.content,
      encoding: "base64",
    })),
  };
  return new MailComposer(mailOptions).compile().build();
};

const sendEmailPdf = async (
  email,
  subjectData,
  htmlContentData,
  attachment
) => {
  var message = {
    fromEmail: "hello@qr8list.com",
    to: email,
    subject: subjectData,
    bodyHtml: htmlContentData,
    attachments: attachment,
  };

  params = {
    Content: { Raw: { Data: await generateRawMailData(message) } },
    Destination: {
      ToAddresses: [message.to],
    },
    FromEmailAddress: message.fromEmail,
  };

  SESConfig.apiVersion = "2019-09-27";
  new AWS.SESV2(SESConfig)
    .sendEmail(params)
    .promise()
    .then((res) => {
      console.log(res);
    })
    .catch((error) => {
      console.error(error);
      return error;
    });
};

const sendEmail = async (obj) => {
  let transporter = nodemailer.createTransport({
    service: "Mailgun",
    auth: {
      user: "",
      pass: "",
    },
  });
  if (!Array.isArray(obj.to)) {
    obj.to = [obj.to];
  }
  const htmlText = await ejs.renderFile(
    `${__basedir}${obj.template}/html.ejs`,
    obj.data
  );

  return await Promise.all(
    obj.to.map((emailId) => {
      var mailOpts = {
        from: obj.from || "noreply@yoyo.co",
        to: emailId,
        subject: obj.subject,
        html: htmlText,
      };
      transporter.sendMail(mailOpts, function (err, response) {
        if (err) {
          console.log(err);
        } else {
          console.log(response);
        }
      });
    })
  );
};

const sendSESEmail = async (email, subjectData, htmlContentData) => {
  var params = {
    Source: "hello@qr8list.com",
    Destination: {
      ToAddresses: [email],
    },
    Message: {
      Body: {
        Html: {
          Charset: "UTF-8",
          Data: htmlContentData,
        },
      },
      Subject: {
        Charset: "UTF-8",
        Data: subjectData,
      },
    },
  };

  new AWS.SES(SESConfig)
    .sendEmail(params)
    .promise()
    .then((res) => {
      console.log(res);
    })
    .catch((err) => {
      console.log("error", err);
      return err;
    });
};

module.exports = {
  sendEmail: sendEmail,
  sendSESEmail: sendSESEmail,
  emailQueue: emailQueue,
  sendEmailPdf: sendEmailPdf
};
