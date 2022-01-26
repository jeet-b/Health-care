const express = require('express');
const router = express.Router();
const stripeController = require('../../controller/device/stripe');
const adaptRequest = require('../../helpers/adaptRequest');
const sendResponse = require('../../helpers/sendResponse');
const auth = require('../../middleware/auth');

router.post('/device/api/v1/stripe/add-card',auth(...[ 'createByUserInDevicePlatform']),(req,res,next)=> {
  req = adaptRequest(req);
  stripeController.addCard({ req }).then((result)=>{
    sendResponse(res, result);
  }).catch((e) => {
      sendResponse(res,e);
    });
});
router.post('/device/api/v1/stripe/get-token',auth(...[ 'getByUserInDevicePlatform']),(req,res,next)=> {
  req = adaptRequest(req);
  stripeController.getToken({ req }).then((result)=> {
    sendResponse(res, result);
  }).catch((e) => {
      sendResponse(res,e);
    });
});
router.post('/device/api/v1/stripe/remove-card',auth(...[ 'deleteByUserInDevicePlatform']),(req,res,next)=> {
  req = adaptRequest(req);
  stripeController.removeCard({ req }).then((result)=> {
    sendResponse(res, result);
  }).catch((e) => {
      sendResponse(res,e);
    });
})
router.post('/device/api/v1/stripe/set-default-card',auth(...[ 'updateByUserInDevicePlatform']),(req,res,next)=> {
  req = adaptRequest(req);
  stripeController.setDefaultCard({ req }).then((result)=> {
    sendResponse(res, result);
  }).catch((e) => {
      sendResponse(res,e);
    });
})

// router
//   .route("/update-card")
//   .post(authentication, checkPermission, stripeController.updateCard)
//   .descriptor("client.stripe.updateCard");

//   router
//   .route("/cards-list")
//   .get(authentication, checkPermission, stripeController.listOfCards)
//   .descriptor("client.stripe.cardsList");


// router
//   .route("/get-token")
//   .post(stripeController.getToken)
//   .descriptor("client.stripe.getToken");

// router
//   .route("/remove-card")
//   .post(authentication, checkPermission, stripeController.removeCard)
//   .descriptor("client.stripe.removeCard");

// router
//   .route("/set-default-card")
//   .post(authentication, checkPermission, stripeController.setDefaultCard)
//   .descriptor("client.stripe.setDefaultCard");

// router
//   .route("/add-bank-account")
//   .post(authentication, checkPermission, stripeController.addBankAccount)
//   .descriptor("client.stripe.addBankAccount");

// router
//   .route("/update-bank-account")
//   .post(authentication, checkPermission, stripeController.updateBankAccount)
//   .descriptor("client.stripe.updateBankAccount");

// router
//   .route("/remove-bank-account")
//   .post(authentication, checkPermission, stripeController.removeBankAccount)
//   .descriptor("client.stripe.removeBankAccount");

// router
//   .route("/set-default-bank-account")
//   .post(authentication, checkPermission, stripeController.setDefaultBankAccount)
//   .descriptor("client.stripe.setDefaultBankAccount");

  

module.exports = router;