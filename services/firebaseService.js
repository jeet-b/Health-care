let admin = require("firebase-admin");
let serviceAccount = require("../fbase-service-account.json");
const constants = require("./../config/constant/socket");

//INITIALIZE FIREBASE
admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });

//INITIALIZING FIRESTORE DATABASE
const db = admin.firestore();

//WHEN NEW MESSAGE SENT
async function onSendNewMessage(userId) {
  getChannelPath(userId)
    .then((results) => {
      results
        .update({
          newMessage: { value: 1 },
        })
        .then((results) => {
          console.log(`Firestore onRequest created or updated at:: ${userId}`);
          return true;
        })
        .catch((err) => {
          return false;
        });
    })
    .catch((err) => {
      console.log(err.message);
      return false;
    });
}

//WHEN NEW CHAT ASSIGN
async function onRequestSent(userId, values) {
  getChannelPath(userId)
    .then((results) => {
      results
        .update({
          requestStatus: {
            value: values,
          },
        })
        .then((results) => {
          console.log(`Firestore onRequest created or updated at:: ${userId}`);
          return true;
        })
        .catch((err) => {
          return false;
        });
    })
    .catch((err) => {
      console.log(err.message);
      return false;
    });
}

//GET CHANNEL INFO OF GIVEN CHANNEL NAME
async function getChannelInfo(userId) {
  userId = userId.toString();
  await getChannelPath(userId);
  db.collection(constants.SOCKET_CHANNEL)
    .doc(userId)
    .get()
    .then((doc) => {
      return doc.data();
    })
    .catch((err) => {
      console.log(`->Firestore Error: while fetching ${channelName} data.`);
      console.log(err.message);
      return null;
    });
}

async function getChannelPath(userId) {
  try {
    userId = userId.toString();
    let document = await db.collection(constants.SOCKET_CHANNEL).doc(userId);
    return document;
  } catch (err) {
    console.error(err.message);
  }
}

module.exports = { onSendNewMessage, getChannelInfo, onRequestSent };
