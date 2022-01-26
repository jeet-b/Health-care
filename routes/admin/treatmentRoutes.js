const express = require('express');
const router = express.Router();
const treatmentController = require('../../controller/admin/treatment');
const adaptRequest = require('../../helpers/adaptRequest');
const sendResponse = require('../../helpers/sendResponse');
const auth = require('../../middleware/auth');
const checkRolePermission = require('../../middleware/checkRolePermission');

router.post('/admin/treatment/create', auth(...['createByAdminInAdminPlatform']), checkRolePermission, (req, res, next) => {
    req = adaptRequest(req);
    treatmentController.addTreatment({ data: req.body }, req.i18n).then((result) => {
        sendResponse(res, result);
    }).catch((e) => {
        sendResponse(res, e);
    });
});

router.post('/admin/treatment/list', auth(...['getAllByAdminInAdminPlatform']), checkRolePermission, (req, res, next) => {
    req = adaptRequest(req);
    treatmentController.findAllTreatment({ data: req.body }, req.i18n).then((result) => {
        sendResponse(res, result);
    }).catch((e) => {
        sendResponse(res, e);
    });
});

router.get('/admin/treatment/:id', auth(...['getByAdminInAdminPlatform']), checkRolePermission, (req, res, next) => {
    req = adaptRequest(req);
    treatmentController.getTreatmentById(req.pathParams.id).then((result) => {
        sendResponse(res, result);
    }).catch((e) => {
        sendResponse(res, e);
    });
});

router.route('/admin/treatment/count').post(auth(...['getCountByAdminInAdminPlatform']), checkRolePermission, (req, res, next) => {
    req = adaptRequest(req);
    treatmentController.getTreatmentCount(req.body).then((result) => {
        sendResponse(res, result);
    }).catch((e) => {
        sendResponse(res, e);
    });
});

router.route('/admin/treatment/aggregate').post(auth(...['aggregateByAdminInAdminPlatform']), checkRolePermission, (req, res, next) => {
    req = adaptRequest(req);
    treatmentController.getTreatmentByAggregate({ data: req.body }).then((result) => {
        sendResponse(res, result);
    }).catch((e) => {
        sendResponse(res, e);
    });
});

router.put('/admin/treatment/update/:id', auth(...['updateByAdminInAdminPlatform']), checkRolePermission, (req, res, next) => {
    req = adaptRequest(req);
    treatmentController.updateTreatment(req.body, req.pathParams.id, req.i18n).then((result) => {
        sendResponse(res, result);
    }).catch((e) => {
        sendResponse(res, e);
    });
});

router.put('/admin/treatment/softDelete/:id', auth(...['softDeleteByAdminInAdminPlatform']), checkRolePermission, (req, res, next) => {
    req = adaptRequest(req);
    treatmentController.softDeleteTreatment({req}).then((result) => {
        sendResponse(res, result);
    }).catch((e) => {
        sendResponse(res, e);
    });
});

router.post('/admin/treatment/addBulk', checkRolePermission, (req, res, next) => {
    req = adaptRequest(req);
    treatmentController.bulkInsertTreatment({ body: req.body }).then((result) => {
        sendResponse(res, result);
    }).catch((e) => {
        sendResponse(res, e);
    });
});

router.put('/admin/treatment/updateBulk', auth(...['updateBulkByAdminInAdminPlatform']), checkRolePermission, (req, res, next) => {
    req = adaptRequest(req);
    treatmentController.bulkUpdateTreatment(req.body).then((result) => {
        sendResponse(res, result);
    }).catch((e) => {
        sendResponse(res, e);
    });
});


module.exports = router;
