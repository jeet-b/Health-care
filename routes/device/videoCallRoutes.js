const express = require('express');
const router = express.Router();
const videoCallController = require('../../controller/device/videoCall/videoCallController');
const adaptRequest = require('../../helpers/adaptRequest');
const sendResponse = require('../../helpers/sendResponse');
const auth = require('../../middleware/auth');
const checkRolePermission = require('../../middleware/checkRolePermission');

router.post('/device/api/v1/video/updateCallStatus',auth(...[ 'updateByUserInDevicePlatform']),(req,res,next)=> {
    req = adaptRequest(req);
    videoCallController.updateCallStatus({ req }).then((result)=> {
      sendResponse(res, result);
    }).catch((e) => {
        sendResponse(res,e);
      });
  })

router.post('/device/api/v1/video/authenticate-call',auth(...[ 'updateByUserInDevicePlatform']),(req,res,next)=> {
    req = adaptRequest(req);
    videoCallController.authenticateCall({ req }).then((result)=> {
      sendResponse(res, result);
    }).catch((e) => {
        sendResponse(res,e);
      });
  })


  module.exports = router;