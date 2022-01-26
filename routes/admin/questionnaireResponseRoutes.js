const express = require('express');
const router = express.Router();
const questionnaireResponseController = require('../../controller/admin/questionnaireResponse/questionnaireResponse');
const adaptRequest = require('../../helpers/adaptRequest');
const sendResponse = require('../../helpers/sendResponse');
const auth = require('../../middleware/auth');
const checkRolePermission = require('../../middleware/checkRolePermission');

router.post('/admin/appointment/:id/questionnaireResponse/create',auth(...[ 'createByAdminInDevicePlatform' ]),checkRolePermission,(req,res,next)=>{
    req = adaptRequest(req);
    questionnaireResponseController.submitQuestionnaireResponse(req.body, req.pathParams.id, req.i18n).then((result)=>{
      sendResponse(res,result);
    })
      .catch((e) => {
        sendResponse(res,e); 
      });
  });

router.post('/admin/questionnaireResponse/get',auth(...[ 'getByAdminInDevicePlatform' ]),checkRolePermission,(req,res,next)=>{
  req = adaptRequest(req); 
  questionnaireResponseController.getQuestionnaireResponse(req).then((result)=>{
    sendResponse(res,result);
  })
    .catch((e) => {
      sendResponse(res,e); 
    });
});
  module.exports = router;