const express = require('express');
const router = express.Router();
const reportController = require('../../controller/admin/report/reportController');
const adaptRequest = require('../../helpers/adaptRequest');
const sendResponse = require('../../helpers/sendResponse');
const auth = require('../../middleware/auth');
const checkRolePermission = require('../../middleware/checkRolePermission');

router.post('/admin/api/v1/reports/new-user-count',auth(...[ 'createByAdminInDevicePlatform' ]),checkRolePermission,(req,res,next)=>{
  req = adaptRequest(req);
  reportController.newUserCount({ req }).then((result)=>{
    sendResponse(res, result);
  })
    .catch((e) => {
      sendResponse(res,e);
    });
});
router.post('/admin/api/v1/reports/new-user-report',auth(...[ 'createByAdminInDevicePlatform' ]),checkRolePermission,(req,res,next)=>{
    req = adaptRequest(req);
    reportController.newUserReport({ req }).then((result)=>{
      sendResponse(res, result);
    })
      .catch((e) => {
        sendResponse(res,e);
      });
  });
router.post('/admin/api/v1/reports/physician-count',auth(...[ 'createByAdminInDevicePlatform' ]),checkRolePermission,(req,res,next)=>{
req = adaptRequest(req);
reportController.physicianAppointmentCount({ req }).then((result)=>{
    sendResponse(res, result);
})
    .catch((e) => {
    sendResponse(res,e);
    });
});
router.post('/admin/api/v1/reports/physician-report',auth(...[ 'createByAdminInDevicePlatform' ]),checkRolePermission,(req,res,next)=>{
  req = adaptRequest(req);
  reportController.physicianReport({ req }).then((result)=>{
      sendResponse(res, result);
  })
      .catch((e) => {
      sendResponse(res,e);
      });
});
router.post('/admin/api/v1/reports/transaction-frequency',auth(...[ 'createByAdminInDevicePlatform' ]),checkRolePermission,(req,res,next)=>{
  req = adaptRequest(req);
  reportController.transactionFrequency({ req }).then((result)=>{
      sendResponse(res, result);
  })
      .catch((e) => {
      sendResponse(res,e);
      });
});
router.post('/admin/api/v1/reports/transaction-frequency-report',auth(...[ 'createByAdminInDevicePlatform' ]),checkRolePermission,(req,res,next)=>{
  req = adaptRequest(req);
  reportController.transactionFrequencyReport({ req }).then((result)=>{
      sendResponse(res, result);
  })
      .catch((e) => {
      sendResponse(res,e);
      });
});
router.post('/admin/api/v1/reports/average-transaction',auth(...[ 'createByAdminInDevicePlatform' ]),checkRolePermission,(req,res,next)=>{
  req = adaptRequest(req);
  reportController.averageTransaction({ req }).then((result)=>{
      sendResponse(res, result);
  })
      .catch((e) => {
      sendResponse(res,e);
      });
});
router.post('/admin/api/v1/reports/average-transaction-report',auth(...[ 'createByAdminInDevicePlatform' ]),checkRolePermission,(req,res,next)=>{
  req = adaptRequest(req);
  reportController.transactionFrequencyReport({ req }).then((result)=>{
      sendResponse(res, result);
  })
      .catch((e) => {
      sendResponse(res,e);
      });
});
router.post('/admin/api/v1/reports/revenue-count',auth(...[ 'createByAdminInDevicePlatform' ]),checkRolePermission,(req,res,next)=>{
  req = adaptRequest(req);
  reportController.revenueCount({ req }).then((result)=>{
      sendResponse(res, result);
  })
      .catch((e) => {
      sendResponse(res,e);
      });
});
router.post('/admin/api/v1/reports/revenue-report',auth(...[ 'createByAdminInDevicePlatform' ]),checkRolePermission,(req,res,next)=>{
  req = adaptRequest(req);
  reportController.transactionFrequencyReport({ req }).then((result)=>{
      sendResponse(res, result);
  })
      .catch((e) => {
      sendResponse(res,e);
      });
});

module.exports = router;