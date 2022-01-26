const express = require('express');
const router = express.Router();
const questionnaireController = require('../../controller/device/questionnaire/questionnaire');
const adaptRequest = require('../../helpers/adaptRequest');
const sendResponse = require('../../helpers/sendResponse');
const auth = require('../../middleware/auth');
const checkRolePermission = require('../../middleware/checkRolePermission');

router.get('/device/api/v1/questionnaire/:id',auth(...[ 'getByUserInDevicePlatform', 'getByAdminInDevicePlatform' ]),checkRolePermission,(req,res,next)=>{
    req = adaptRequest(req);
    questionnaireController.getQuestionnaireByServiceId(req.pathParams.id, req.i18n).then((result)=>{
      sendResponse(res,result);
    })
      .catch((e) => {
        sendResponse(res,e);
      });
  });

  module.exports = router;