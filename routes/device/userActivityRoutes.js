const express = require('express');
const router = express.Router();
const userActivityController = require('../../controller/device/userActivity');
const adaptRequest = require('../../helpers/adaptRequest');
const sendResponse = require('../../helpers/sendResponse');
const auth = require('../../middleware/auth');
const checkRolePermission = require('../../middleware/checkRolePermission');

router.post('/device/api/v1/userActivity/create',auth(...[ 'createByUserInDevicePlatform', 'createByAdminInDevicePlatform' ]),checkRolePermission,(req,res,next)=>{
  req = adaptRequest(req);
  userActivityController.addUserActivity({ data:req.body }).then((result)=>{
    sendResponse(res, result);
  })
    .catch((e) => {
      sendResponse(res,e);
    });
});
router.post('/device/api/v1/userActivity/list',auth(...[ 'getAllByUserInDevicePlatform', 'getAllByAdminInDevicePlatform' ]),checkRolePermission,(req,res,next)=>{
  req = adaptRequest(req);
  userActivityController.findAllUserActivity({ data:req.body }).then((result)=>{
    sendResponse(res,result);
  })
    .catch((e) => {
      sendResponse(res,e);
    });
});
router.get('/device/api/v1/userActivity/:id',auth(...[ 'getByUserInDevicePlatform', 'getByAdminInDevicePlatform' ]),checkRolePermission,(req,res,next)=>{
  req = adaptRequest(req);
  userActivityController.getUserActivityById(req.pathParams.id).then((result)=>{
    sendResponse(res,result);
  })
    .catch((e) => {
      sendResponse(res,e);
    });
});
router.route('/device/api/v1/userActivity/count').post(auth(...[ 'getCountByUserInDevicePlatform', 'getCountByAdminInDevicePlatform' ]),checkRolePermission,(req,res,next)=>{
  req = adaptRequest(req);
  userActivityController.getUserActivityCount(req.body).then((result)=>{
    sendResponse(res,result);
  })
    .catch((e) => {
      sendResponse(res,e);
    });
});
router.route('/device/api/v1/userActivity/aggregate').post(auth(...[
  'aggregateByUserInDevicePlatform',
  'aggregateByAdminInDevicePlatform'
]),checkRolePermission,(req,res,next)=>{
  req = adaptRequest(req);
  userActivityController.getUserActivityByAggregate({ data:req.body }).then((result)=>{
    sendResponse(res,result);
  })
    .catch((e) => {
      sendResponse(res,e);
    });
});
router.put('/device/api/v1/userActivity/update/:id',auth(...[ 'updateByUserInDevicePlatform', 'updateByAdminInDevicePlatform' ]),checkRolePermission,(req,res,next)=>{
  req = adaptRequest(req);
  userActivityController.updateUserActivity(req.body,req.pathParams.id).then((result)=>{
    sendResponse(res,result);
  })
    .catch((e) => {
      sendResponse(res,e);
    });
});   
router.put('/device/api/v1/userActivity/softDelete/:id',auth(...[
  'softDeleteByUserInDevicePlatform',
  'softDeleteByAdminInDevicePlatform'
]),checkRolePermission,(req,res,next)=>{
  req = adaptRequest(req);
  userActivityController.softDeleteUserActivity(req.pathParams.id).then((result)=>{
    sendResponse(res,result);
  })
    .catch((e) => {
      sendResponse(res,e);
    });
});
router.post('/device/api/v1/userActivity/addBulk',auth(...[ 'addBulkByUserInDevicePlatform', 'addBulkByAdminInDevicePlatform' ]),checkRolePermission,(req,res,next)=>{
  userActivityController.bulkInsertUserActivity({ body:req.body }).then((result)=>{
    sendResponse(res,result);
  })
    .catch((e) => {
      sendResponse(res,e);
    });
});
router.put('/device/api/v1/userActivity/updateBulk',auth(...[
  'updateBulkByUserInDevicePlatform',
  'updateBulkByAdminInDevicePlatform'
]),checkRolePermission,(req,res,next)=>{
  req = adaptRequest(req);
  userActivityController.bulkUpdateUserActivity(req.body).then((result)=>{
    sendResponse(res,result);
  })
    .catch((e) => {
      sendResponse(res,e);
    });
}); 
router.delete('/device/api/v1/userActivity/delete/:id',auth(...[ 'deleteByUserInDevicePlatform', 'deleteByAdminInDevicePlatform' ]),checkRolePermission,(req,res,next)=>{
  req = adaptRequest(req);
  userActivityController.deleteUserActivity(req.body,req.pathParams.id).then((result)=>{
    sendResponse(res,result);
  })
    .catch((e) => {
      sendResponse(res,e);
    });
});

module.exports = router;