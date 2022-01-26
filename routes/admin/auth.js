const express = require('express');
const router = express.Router();
const adaptRequest = require('../../helpers/adaptRequest');
const sendResponse = require('../../helpers/sendResponse');
const authController = require('../../controller/admin/authentication');
router.post('/register',(req,res,next)=>{
  req = adaptRequest(req);
  authController.register({ data:req.body }, req.i18n).then((result)=>{
    sendResponse(res,result);
  });
});
router.post('/login',(req,res,next)=>{
  req = adaptRequest(req);
  authController.authentication(req).then((result) => {
    sendResponse(res,result);
  })
    .catch((e) => {
      sendResponse(res,e);
    });
});
router.post('/forgot-password', (req, res, next) => {
  req = adaptRequest(req);
  authController.forgotPassword(req.body, req.i18n).then((result) => {
    sendResponse(res, result);
  })
    .catch((e) => {
      sendResponse(res, e);
    });
});

router.post('/validate-otp',(req,res,next)=>{
  req = adaptRequest(req);
  authController.validateResetPasswordOtp(req.body, req.i18n).then((result) => {
    sendResponse(res, result);
  })
    .catch((e) => {
      sendResponse(res, e);
    });
});

router.put('/reset-password',(req,res,next)=>{
  req = adaptRequest(req);
  authController.resetPassword(req.body, req.i18n).then((result) => {
    sendResponse(res, result);
  })
    .catch((e) => {
      sendResponse(res, e);
    });
});

module.exports = router;
