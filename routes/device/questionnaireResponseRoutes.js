const express = require('express');
const router = express.Router();
const questionnaireResponseController = require('../../controller/device/questionnaireResponse/questionnaireResponse');
const adaptRequest = require('../../helpers/adaptRequest');
const sendResponse = require('../../helpers/sendResponse');
const auth = require('../../middleware/auth');
const checkRolePermission = require('../../middleware/checkRolePermission');

router.post('/device/api/v1/appointment/:id/questionnaireResponse/create',auth(...[ 'createByUserInDevicePlatform', 'createByAdminInDevicePlatform' ]),checkRolePermission,(req,res,next)=>{
    req = adaptRequest(req);
    questionnaireResponseController.submitQuestionnaireResponse(req.body, req.pathParams.id, req.i18n).then((result)=>{
      sendResponse(res,result);
    })
      .catch((e) => {
        sendResponse(res,e); 
      });
  });

router.post('/device/api/v1/questionnaireResponse/get',auth(...[ 'getByUserInDevicePlatform', 'getByAdminInDevicePlatform' ]),checkRolePermission,(req,res,next)=>{
  req = adaptRequest(req); 
  questionnaireResponseController.getQuestionnaireResponse(req).then((result)=>{
    sendResponse(res,result);
  })
    .catch((e) => {
      sendResponse(res,e); 
    });
});
  module.exports = router;