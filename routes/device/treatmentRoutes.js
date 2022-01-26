const express = require('express');
const router = express.Router();
const treatmentController = require('../../controller/device/treatment');
const adaptRequest = require('../../helpers/adaptRequest');
const sendResponse = require('../../helpers/sendResponse');
const auth = require('../../middleware/auth');
const checkRolePermission = require('../../middleware/checkRolePermission');


router.post('/device/api/v1/treatment/list', auth(...[ 'getAllByUserInDevicePlatform', 'getAllByAdminInDevicePlatform' ]), checkRolePermission, (req, res, next) => {
    req = adaptRequest(req);
    treatmentController.findAllTreatment({ data: req.body }).then((result) => {
        sendResponse(res, result);
    }).catch((e) => {
        sendResponse(res, e);
    });
});

router.get('/device/api/v1/treatment/:id', auth(...[ 'getByUserInDevicePlatform', 'getByAdminInDevicePlatform' ]), checkRolePermission, (req, res, next) => {
    req = adaptRequest(req);
    treatmentController.getTreatmentById(req.pathParams.id).then((result) => {
        sendResponse(res, result);
    }).catch((e) => {
        sendResponse(res, e);
    });
});


module.exports = router;
