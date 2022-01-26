const express = require('express');
const router = express.Router();
const dashboardController = require('../../controller/admin/dashboard/dashboard');
const adaptRequest = require('../../helpers/adaptRequest');
const sendResponse = require('../../helpers/sendResponse');
const auth = require('../../middleware/auth');
const checkRolePermission = require('../../middleware/checkRolePermission');

router.post('/admin/api/v1/dashboard/count',auth(...[ 'createByAdminInDevicePlatform' ]),checkRolePermission,(req,res,next)=>{
  req = adaptRequest(req);
  dashboardController.dashboardCount({ req }).then((result)=>{
    sendResponse(res, result);
  })
    .catch((e) => {
      sendResponse(res,e);
    });
});

router.post('/admin/api/v1/dashboard/count/ratio-appointment',auth(...[ 'createByAdminInDevicePlatform' ]),checkRolePermission,(req,res,next)=>{
  req = adaptRequest(req);
  dashboardController.ratioAppointment({ req }).then((result)=>{
    sendResponse(res, result);
  })
    .catch((e) => {
      sendResponse(res,e);
    });
});

module.exports = router;