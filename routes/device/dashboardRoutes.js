const express = require('express');
const router = express.Router();
const dashboardController = require('../../controller/device/dashboard/dashboard');
const adaptRequest = require('../../helpers/adaptRequest');
const sendResponse = require('../../helpers/sendResponse');
const auth = require('../../middleware/auth');
const checkRolePermission = require('../../middleware/checkRolePermission');

router.post('/device/api/v1/dashboard/count',auth(...[ 'createByUserInDevicePlatform', 'createByAdminInDevicePlatform' ]),checkRolePermission,(req,res,next)=>{
  req = adaptRequest(req);
  dashboardController.dashboardCount({ req }).then((result)=>{
    sendResponse(res, result);
  })
    .catch((e) => {
      sendResponse(res,e);
    });
});

router.post('/device/api/v1/dashboard/count/chart',auth(...[ 'createByUserInDevicePlatform', 'createByAdminInDevicePlatform' ]),checkRolePermission,(req,res,next)=>{
  req = adaptRequest(req);
  dashboardController.dashboardChartCount({ req }).then((result)=>{
    sendResponse(res, result);
  })
    .catch((e) => {
      sendResponse(res,e);
    });
});

module.exports = router;