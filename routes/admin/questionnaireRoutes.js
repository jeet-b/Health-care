const express = require('express');
const router = express.Router();
const questionnaireController = require('../../controller/admin/questionnaire/quesstionnaire');
const adaptRequest = require('../../helpers/adaptRequest');
const sendResponse = require('../../helpers/sendResponse');
const auth = require('../../middleware/auth');
const checkRolePermission = require('../../middleware/checkRolePermission');


router.post('/admin/questionnaire/:id', auth(...['getAllByAdminInAdminPlatform']), checkRolePermission, (req, res, next) => {
    req = adaptRequest(req);
    questionnaireController.getQuestionnaireByServiceId(req.pathParams.id, req.i18n).then((result) => {
        sendResponse(res, result);
    }).catch((e) => {
        sendResponse(res, e);
    });
});

module.exports = router;