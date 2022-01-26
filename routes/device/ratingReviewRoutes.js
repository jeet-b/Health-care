const express = require('express');
const router = express.Router();
const ratingReviewController = require('../../controller/device/ratingReview');
const adaptRequest = require('../../helpers/adaptRequest');
const sendResponse = require('../../helpers/sendResponse');
const auth = require('../../middleware/auth');
const checkRolePermission = require('../../middleware/checkRolePermission');

router.post('/device/api/v1/ratingReview/create',auth(...[ 'createByUserInDevicePlatform', 'createByAdminInDevicePlatform' ]),checkRolePermission,(req,res,next)=>{
  req = adaptRequest(req);
  ratingReviewController.addRatingReview({ data:req.body }, req.i18n).then((result)=>{
    sendResponse(res, result);
  })
    .catch((e) => {
      sendResponse(res,e);
    });
});
router.post('/device/api/v1/ratingReview/list',auth(...[ 'getAllByUserInDevicePlatform', 'getAllByAdminInDevicePlatform' ]),checkRolePermission,(req,res,next)=>{
  req = adaptRequest(req);
  ratingReviewController.findAllRatingReview({ data:req.body }, req.i18n).then((result)=>{
    sendResponse(res,result);
  })
    .catch((e) => {
      sendResponse(res,e);
    });
});
router.get('/device/api/v1/ratingReview/:id',auth(...[ 'getByUserInDevicePlatform', 'getByAdminInDevicePlatform' ]),checkRolePermission,(req,res,next)=>{
  req = adaptRequest(req);
  ratingReviewController.getRatingReviewById(req.pathParams.id, req.i18n).then((result)=>{
    sendResponse(res,result);
  })
    .catch((e) => {
      sendResponse(res,e);
    });
});
router.route('/device/api/v1/ratingReview/count').post(auth(...[ 'getCountByUserInDevicePlatform', 'getCountByAdminInDevicePlatform' ]),checkRolePermission,(req,res,next)=>{
  req = adaptRequest(req);
  ratingReviewController.getRatingReviewCount(req.body).then((result)=>{
    sendResponse(res,result);
  })
    .catch((e) => {
      sendResponse(res,e);
    });
});
router.route('/device/api/v1/ratingReview/aggregate').post(auth(...[
  'aggregateByUserInDevicePlatform',
  'aggregateByAdminInDevicePlatform'
]),checkRolePermission,(req,res,next)=>{
  req = adaptRequest(req);
  ratingReviewController.getRatingReviewByAggregate({ data:req.body }).then((result)=>{
    sendResponse(res,result);
  })
    .catch((e) => {
      sendResponse(res,e);
    });
});
router.put('/device/api/v1/ratingReview/update/:id',auth(...[ 'updateByUserInDevicePlatform', 'updateByAdminInDevicePlatform' ]),checkRolePermission,(req,res,next)=>{
  req = adaptRequest(req);
  ratingReviewController.updateRatingReview(req.body,req.pathParams.id).then((result)=>{
    sendResponse(res,result);
  })
    .catch((e) => {
      sendResponse(res,e);
    });
});   
router.put('/device/api/v1/ratingReview/softDelete/:id',auth(...[
  'softDeleteByUserInDevicePlatform',
  'softDeleteByAdminInDevicePlatform'
]),checkRolePermission,(req,res,next)=>{
  req = adaptRequest(req);
  ratingReviewController.softDeleteRatingReview(req.pathParams.id).then((result)=>{
    sendResponse(res,result);
  })
    .catch((e) => {
      sendResponse(res,e);
    });
});
router.post('/device/api/v1/ratingReview/addBulk',auth(...[ 'addBulkByUserInDevicePlatform', 'addBulkByAdminInDevicePlatform' ]),checkRolePermission,(req,res,next)=>{
  ratingReviewController.bulkInsertRatingReview({ body:req.body }).then((result)=>{
    sendResponse(res,result);
  })
    .catch((e) => {
      sendResponse(res,e);
    });
});
router.put('/device/api/v1/ratingReview/updateBulk',auth(...[
  'updateBulkByUserInDevicePlatform',
  'updateBulkByAdminInDevicePlatform'
]),checkRolePermission,(req,res,next)=>{
  req = adaptRequest(req);
  ratingReviewController.bulkUpdateRatingReview(req.body).then((result)=>{
    sendResponse(res,result);
  })
    .catch((e) => {
      sendResponse(res,e);
    });
}); 
router.delete('/device/api/v1/ratingReview/delete/:id',auth(...[ 'deleteByUserInDevicePlatform', 'deleteByAdminInDevicePlatform' ]),checkRolePermission,(req,res,next)=>{
  req = adaptRequest(req);
  ratingReviewController.deleteRatingReview(req.body,req.pathParams.id).then((result)=>{
    sendResponse(res,result);
  })
    .catch((e) => {
      sendResponse(res,e);
    });
});

module.exports = router;