const message = require("../utils/messages");
const responseCode = require("../utils/responseCode");
const db = require("../config/db");
const user = require("../model/user")(db);
const appointment = require("../model/appointment")(db);
const utils = require("../utils/messages");
var OpenTok = require("opentok");

const opentok = new OpenTok(
  process.env.VONAGE_VIDEO_API,
  process.env.VONAGE_VIDEO_SECRET
);
const generateToken = async (sessionId, appointmentId) => {
  try {
    const tokenOptions = {
      role: "publisher",
      expireTime: new Date().getTime() / 1000 + 2 * 60 * 60,
    };
    let token = opentok.generateToken(sessionId, tokenOptions);
    let appointmentData = await appointment.findOneAndUpdate(
      { _id: appointmentId },
      { sessionId: sessionId, sessionToken: token },
      {
        new: true,
      }
    );
    obj = {
      Vonage_API_Key: process.env.VONAGE_VIDEO_API,
      sessionId: appointmentData.sessionId,
      tokenId: appointmentData.sessionToken,
    };
    return obj;
  } catch (error) {
    console.error("Error - generateToken", error);
    return message.failureResponse(
      { "Content-Type": "application/json" },
      responseCode.internalServerError,
      error.message
    );
  }
};

const createVideoCallSession = async (appointmentId) => {
  let sessionData = await createSession(appointmentId);
  if (sessionData.sessionId != null && sessionData.sessionId != undefined) {
    return sessionData;
  } else {
    createVideoCallSession(appointmentId);
  }
};

const createSession = async (appointmentId) => {
  return new Promise((resolve, reject) => {
    opentok.createSession({ mediaMode: "relayed" }, (err, session) => {
      if (err) {
        reject(err);
      }
      generateToken(session.sessionId, appointmentId)
        .then((results) => {
          resolve(results);
        })
        .catch((err) => {
          reject(err);
          console.log(`Video Call Promise Error: ${err.message}`);
        });
    });
  }).catch((err) => {
    reject(err);
    console.log(`Video Call Promise Error: ${err.message}`);
  });
};

module.exports = {
  createSession,
  generateToken,
  createVideoCallSession,
};
