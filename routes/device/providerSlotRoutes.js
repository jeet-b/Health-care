const express = require('express');
const router = express.Router();
const providerSlotController = require('../../controller/device/providerSlot');
const adaptRequest = require('../../helpers/adaptRequest');
const sendResponse = require('../../helpers/sendResponse');
const auth = require('../../middleware/auth');
const checkRolePermission = require('../../middleware/checkRolePermission');

router.get('/device/api/v1/slot/list',auth(...[ 'getAllByUserInDevicePlatform', 'getAllByAdminInDevicePlatform' ]),(req,res,next)=>{
  req = adaptRequest(req);
  providerSlotController.defaultSlot().then((result)=>{
    sendResponse(res,result);
  })
    .catch((e) => {
      sendResponse(res,e);
    });
});

router.post('/device/api/v1/providerSlot/create',auth(...[ 'createByUserInDevicePlatform', 'createByAdminInDevicePlatform' ]),checkRolePermission,(req,res,next)=>{
  req = adaptRequest(req);
  providerSlotController.addProviderSlot({ req }).then((result)=>{
    sendResponse(res, result);
  })
    .catch((e) => {
      sendResponse(res,e);
    });
});
router.put('/device/api/v1/providerSlot/update',auth(...[ 'updateByUserInDevicePlatform', 'updateByAdminInDevicePlatform' ]),checkRolePermission,(req,res,next)=>{
  req = adaptRequest(req);
  providerSlotController.updateProviderSlot({req}).then((result)=>{
    sendResponse(res,result);
  })
    .catch((e) => {
      sendResponse(res,e);
    });
});

router.post('/device/api/v1/providerSlot/get-all-provider',auth(...[ 'getAllByUserInDevicePlatform', 'getAllByAdminInDevicePlatform' ]),checkRolePermission,(req,res,next)=>{
  req = adaptRequest(req);
  providerSlotController.getAllAvailableProviderSlot({req}).then((result)=>{
    sendResponse(res, result);
  })
    .catch((e) => {
      sendResponse(res,e);
    });
});
router.get('/device/api/v1/providerSlot/list',auth(...[ 'getAllByUserInDevicePlatform', 'getAllByAdminInDevicePlatform' ]),(req,res,next)=>{
  req = adaptRequest(req);
  providerSlotController.getProviderSlotByProviderId(req).then((result)=>{
    sendResponse(res,result);
  })
    .catch((e) => {
      sendResponse(res,e);
    });
});
router.post('/device/api/v1/providerSlot/get-available/:id',auth(...[ 'getByUserInDevicePlatform', 'getByAdminInDevicePlatform' ]),checkRolePermission,(req,res,next)=>{
  req = adaptRequest(req);
  providerSlotController.getAvailableProviderSlot({ req }).then((result)=>{
    sendResponse(res, result);
  })
    .catch((e) => {
      sendResponse(res,e);
    });
});  
// router.post('/device/api/v1/providerSlot/list',auth(...[ 'getAllByUserInDevicePlatform', 'getAllByAdminInDevicePlatform' ]),checkRolePermission,(req,res,next)=>{
//   req = adaptRequest(req);
//   providerSlotController.findAllProviderSlot({ data:req.body }).then((result)=>{
//     sendResponse(res,result);
//   })
//     .catch((e) => {
//       sendResponse(res,e);
//     });
// });
router.get('/device/api/v1/providerSlot/:id',auth(...[ 'getByUserInDevicePlatform', 'getByAdminInDevicePlatform' ]),checkRolePermission,(req,res,next)=>{
  req = adaptRequest(req);
  providerSlotController.getProviderSlotById(req.pathParams.id).then((result)=>{
    sendResponse(res,result);
  })
    .catch((e) => {
      sendResponse(res,e);
    });
});
router.route('/device/api/v1/providerSlot/count').post(auth(...[ 'getCountByUserInDevicePlatform', 'getCountByAdminInDevicePlatform' ]),checkRolePermission,(req,res,next)=>{
  req = adaptRequest(req);
  providerSlotController.getProviderSlotCount(req.body).then((result)=>{
    sendResponse(res,result);
  })
    .catch((e) => {
      sendResponse(res,e);
    });
});
router.route('/device/api/v1/providerSlot/aggregate').post(auth(...[
  'aggregateByUserInDevicePlatform',
  'aggregateByAdminInDevicePlatform'
]),checkRolePermission,(req,res,next)=>{
  req = adaptRequest(req);
  providerSlotController.getProviderSlotByAggregate({ data:req.body }).then((result)=>{
    sendResponse(res,result);
  })
    .catch((e) => {
      sendResponse(res,e);
    });
});
 
router.put('/device/api/v1/providerSlot/softDelete/:id',auth(...[
  'softDeleteByUserInDevicePlatform',
  'softDeleteByAdminInDevicePlatform'
]),checkRolePermission,(req,res,next)=>{
  req = adaptRequest(req);
  providerSlotController.softDeleteProviderSlot(req.pathParams.id).then((result)=>{
    sendResponse(res,result);
  })
    .catch((e) => {
      sendResponse(res,e);
    });
});
router.post('/device/api/v1/providerSlot/addBulk',auth(...[ 'addBulkByUserInDevicePlatform', 'addBulkByAdminInDevicePlatform' ]),checkRolePermission,(req,res,next)=>{
  providerSlotController.bulkInsertProviderSlot({ body:req.body }).then((result)=>{
    sendResponse(res,result);
  })
    .catch((e) => {
      sendResponse(res,e);
    });
});
router.put('/device/api/v1/providerSlot/updateBulk',auth(...[
  'updateBulkByUserInDevicePlatform',
  'updateBulkByAdminInDevicePlatform'
]),checkRolePermission,(req,res,next)=>{
  req = adaptRequest(req);
  providerSlotController.bulkUpdateProviderSlot(req.body).then((result)=>{
    sendResponse(res,result);
  })
    .catch((e) => {
      sendResponse(res,e);
    });
}); 
router.delete('/device/api/v1/providerSlot/delete/:id',auth(...[ 'deleteByUserInDevicePlatform', 'deleteByAdminInDevicePlatform' ]),checkRolePermission,(req,res,next)=>{
  req = adaptRequest(req);
  providerSlotController.deleteProviderSlot(req.body,req.pathParams.id).then((result)=>{
    sendResponse(res,result);
  })
    .catch((e) => {
      sendResponse(res,e);
    });
});

module.exports = router;