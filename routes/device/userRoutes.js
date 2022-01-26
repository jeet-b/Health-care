const express = require('express');
const router = express.Router();
const userController = require('../../controller/device/user');
const adaptRequest = require('../../helpers/adaptRequest');
const sendResponse = require('../../helpers/sendResponse');
const auth = require('../../middleware/auth');
const checkRolePermission = require('../../middleware/checkRolePermission');

router.post('/device/api/v1/user/create',checkRolePermission,(req,res,next)=>{
  req = adaptRequest(req);
  userController.addUser({ data:req.body }).then((result)=>{
    sendResponse(res, result);
  })
    .catch((e) => {
      sendResponse(res,e);
    });
});
router.post('/device/api/v1/user/list',auth(...[ 'getAllByUserInDevicePlatform', 'getAllByAdminInDevicePlatform' ]),checkRolePermission,(req,res,next)=>{
  req = adaptRequest(req);
  userController.findAllUser({ data:req.body }).then((result)=>{
    sendResponse(res,result);
  })
    .catch((e) => {
      sendResponse(res,e);
    });
});
router.get('/device/api/v1/user/:id',auth(...[ 'getByUserInDevicePlatform', 'getByAdminInDevicePlatform' ]),checkRolePermission,(req,res,next)=>{
  req = adaptRequest(req);
  userController.getUserById(req.pathParams.id, req.i18n).then((result)=>{
    sendResponse(res,result);
  })
    .catch((e) => {
      sendResponse(res,e);
    });
});
router.route('/device/api/v1/user/count').post(auth(...[ 'getCountByUserInDevicePlatform', 'getCountByAdminInDevicePlatform' ]),checkRolePermission,(req,res,next)=>{
  req = adaptRequest(req);
  userController.getUserCount(req.body).then((result)=>{
    sendResponse(res,result);
  })
    .catch((e) => {
      sendResponse(res,e);
    });
});
router.route('/device/api/v1/user/aggregate').post(auth(...[
  'aggregateByUserInDevicePlatform',
  'aggregateByAdminInDevicePlatform'
]),checkRolePermission,(req,res,next)=>{
  req = adaptRequest(req);
  userController.getUserByAggregate({ data:req.body }).then((result)=>{
    sendResponse(res,result);
  })
    .catch((e) => {
      sendResponse(res,e);
    });
});
router.put('/device/api/v1/user/update/:id',auth(...[ 'updateByUserInDevicePlatform', 'updateByAdminInDevicePlatform' ]),checkRolePermission,(req,res,next)=>{
  req = adaptRequest(req);
  userController.updateUser(req.body,req.pathParams.id, req.i18n).then((result)=>{
    sendResponse(res,result);
  })
    .catch((e) => {
      sendResponse(res,e);
    });
});   
router.put('/device/api/v1/user/softDelete/:id',auth(...[
  'softDeleteByUserInDevicePlatform',
  'softDeleteByAdminInDevicePlatform'
]),checkRolePermission,(req,res,next)=>{
  req = adaptRequest(req);
  userController.softDeleteUser(req.pathParams.id).then((result)=>{
    sendResponse(res,result);
  })
    .catch((e) => {
      sendResponse(res,e);
    });
});
router.post('/device/api/v1/user/addBulk',checkRolePermission,(req,res,next)=>{
  req = adaptRequest(req);
  userController.bulkInsertUser({ body: req.body }).then((result)=>{
    sendResponse(res,result);
  })
    .catch((e) => {
      sendResponse(res,e);
    });
});
router.put('/device/api/v1/user/updateBulk',auth(...[
  'updateBulkByUserInDevicePlatform',
  'updateBulkByAdminInDevicePlatform'
]),checkRolePermission,(req,res,next)=>{
  req = adaptRequest(req);
  userController.bulkUpdateUser(req.body).then((result)=>{
    sendResponse(res,result);
  })
    .catch((e) => {
      sendResponse(res,e);
    });
}); 
router.delete('/device/api/v1/user/delete/:id',auth(...[ 'deleteByUserInDevicePlatform', 'deleteByAdminInDevicePlatform' ]),checkRolePermission,(req,res,next)=>{
  req = adaptRequest(req);
  userController.deleteUser(req.body,req.pathParams.id).then((result)=>{
    sendResponse(res,result);
  })
    .catch((e) => {
      sendResponse(res,e);
    });
});

router.route('/device/api/v1/user/change-password').put(auth(...[
  'changePasswordByUserInDevicePlatform',
  'changePasswordByAdminInDevicePlatform'
]),(req,res,next)=>{
  req = adaptRequest(req);
  let params = {
    ...req.body,
    userId:req.user.id
  };
  userController.changePassword(params, req.i18n).then((result)=>{
    sendResponse(res,result);
  })
    .catch((e) => {
      sendResponse(res,e);
    });
});
router.route('/device/api/v1/user/update-profile').put(auth(...[
  'updateProfileByUserInDevicePlatform',
  'updateProfileByAdminInDevicePlatform'
]),(req,res,next)=>{
  req = adaptRequest(req);
  userController.updateProfile(req.body,req.user.id, req.i18n).then((result)=>{
    sendResponse(res,result);
  })
    .catch((e) => {
      sendResponse(res,e);
    });
});

router.route('/device/api/v1/user/change-details').post(auth(...[
  'updateProfileByUserInDevicePlatform',
  'updateProfileByAdminInDevicePlatform'
]),(req,res,next)=>{
  req = adaptRequest(req);
  userController.changeDetails(req.body,req.user, req.i18n).then((result)=>{
    sendResponse(res,result);
  })
    .catch((e) => {
      sendResponse(res,e);
    });
});
router.route('/device/api/v1/user/verify-details').post(auth(...[
  'updateProfileByUserInDevicePlatform',
  'updateProfileByAdminInDevicePlatform'
]),(req,res,next)=>{
  req = adaptRequest(req);
  userController.verifyDetails(req.body,req.user, req.i18n).then((result)=>{
    sendResponse(res,result);
  })
    .catch((e) => {
      sendResponse(res,e);
    });
});

router.route('/device/api/v1/user-profile').get(auth(...[
  'getProfileByUserInDevicePlatform',
  'getProfileByAdminInDevicePlatform'
]),(req,res,next)=>{
  req = adaptRequest(req);
  userController.getProfile(req.user.id, req.i18n).then((result)=>{
    sendResponse(res,result);
  })
    .catch((e) => {
      sendResponse(res,e);
    });
});

router.post('/device/api/v1/user/patients-by-provider', auth(...[ 'getByUserInDevicePlatform', 'getByAdminInDevicePlatform' ]), checkRolePermission, (req, res, next) => {
  req = adaptRequest(req);
  userController.getPatientsByProviderId(req.body, req.i18n).then((results) => {
    sendResponse(res, results);
  }).catch((e) => {
    sendResponse(res, e);
  });
});
router.post('/device/user/patients-photo-gallery', auth(...[ 'getByUserInDevicePlatform', 'getByAdminInDevicePlatform' ]), checkRolePermission, (req, res, next) => {
  req = adaptRequest(req);
  userController.getPhotoGallery({req}).then((results) => {
    sendResponse(res, results);
  }).catch((e) => {
    sendResponse(res, e);
  });
});

module.exports = router;