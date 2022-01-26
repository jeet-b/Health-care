const express = require('express');
const router = express.Router();
const paymentController = require('../../controller/device/payment/payment');
const adaptRequest = require('../../helpers/adaptRequest');
const sendResponse = require('../../helpers/sendResponse');
const auth = require('../../middleware/auth');

router.post('/device/api/v1/payment/create',auth(...[ 'createByUserInDevicePlatform']),(req,res,next)=> {
  req = adaptRequest(req);
  paymentController.createPayment({ req }).then((result)=>{
    sendResponse(res, result);
  }).catch((e) => {
      sendResponse(res,e);
    });
});

router.post('/device/api/v1/payment/treatment/create',auth(...[ 'createByUserInDevicePlatform']),(req,res,next)=> {
  req = adaptRequest(req);
  paymentController.treatmentPayment({ req }).then((result)=>{
    sendResponse(res, result);
  }).catch((e) => {
      sendResponse(res,e);
    });
});

module.exports = router;