const express = require('express');
const router = express.Router();
const appointmentController = require('../../controller/admin/appointment');
const adaptRequest = require('../../helpers/adaptRequest');
const sendResponse = require('../../helpers/sendResponse');
const auth = require('../../middleware/auth');
const checkRolePermission = require('../../middleware/checkRolePermission');

router.post('/admin/appointment/create',  (req, res, next) => {
  req = adaptRequest(req);
  appointmentController.addAppointment({req:req}).then((result) => {
    sendResponse(res, result);
  })
    .catch((e) => {
      sendResponse(res, e);
    });
});
router.post('/admin/appointment/book/:id', auth(...['createByAdminInAdminPlatform']), checkRolePermission, (req, res, next) => {
  req = adaptRequest(req);
  appointmentController.bookAppointment(req.body, req.pathParams.id, req.i18n).then((result) => {
    sendResponse(res, result);
  }).catch((e) => {
    sendResponse(res, e);
  });
});
router.post('/admin/appointment/list', auth(...['getAllByAdminInAdminPlatform']), checkRolePermission, (req, res, next) => {
  req = adaptRequest(req);
  appointmentController.findAllAppointment({ req }).then((result) => {
    sendResponse(res, result);
  })
    .catch((e) => {
      sendResponse(res, e);
    });
});
router.get('/admin/appointment/:id', auth(...['getByAdminInAdminPlatform']), checkRolePermission, (req, res, next) => {
  req = adaptRequest(req);
  appointmentController.getAppointmentById(req.pathParams.id, req.i18n).then((result) => {
    sendResponse(res, result);
  })
    .catch((e) => {
      sendResponse(res, e);
    });
});
router.route('/admin/appointment/count').post(auth(...['getCountByAdminInAdminPlatform']), checkRolePermission, (req, res, next) => {
  req = adaptRequest(req);
  appointmentController.getAppointmentCount(req.body).then((result) => {
    sendResponse(res, result);
  })
    .catch((e) => {
      sendResponse(res, e);
    });
});
router.route('/admin/appointment/aggregate').post(auth(...['aggregateByAdminInAdminPlatform']), checkRolePermission, (req, res, next) => {
  req = adaptRequest(req);
  appointmentController.getAppointmentByAggregate({ data: req.body }).then((result) => {
    sendResponse(res, result);
  })
    .catch((e) => {
      sendResponse(res, e);
    });
});
router.put('/admin/appointment/update/:id', auth(...['updateByAdminInAdminPlatform']), checkRolePermission, (req, res, next) => {
  req = adaptRequest(req);
  appointmentController.updateAppointment(req.body, req.pathParams.id, req.i18n).then((result) => {
    sendResponse(res, result);
  })
    .catch((e) => {
      sendResponse(res, e);
    });
});
router.put('/admin/appointment/softDelete/:id', auth(...['softDeleteByAdminInAdminPlatform']), checkRolePermission, (req, res, next) => {
  req = adaptRequest(req);
  appointmentController.softDeleteAppointment(req.pathParams.id).then((result) => {
    sendResponse(res, result);
  })
    .catch((e) => {
      sendResponse(res, e);
    });
});
router.post('/admin/appointment/addBulk', auth(...['addBulkByAdminInAdminPlatform']), checkRolePermission, (req, res, next) => {
  appointmentController.bulkInsertAppointment({ body: req.body }).then((result) => {
    sendResponse(res, result);
  })
    .catch((e) => {
      sendResponse(res, e);
    });
});
router.put('/admin/appointment/updateBulk', auth(...['updateBulkByAdminInAdminPlatform']), checkRolePermission, (req, res, next) => {
  req = adaptRequest(req);
  appointmentController.bulkUpdateAppointment(req.body).then((result) => {
    sendResponse(res, result);
  })
    .catch((e) => {
      sendResponse(res, e);
    });
});
router.delete('/admin/appointment/delete/:id', auth(...['deleteByAdminInAdminPlatform']), checkRolePermission, (req, res, next) => {
  req = adaptRequest(req);
  appointmentController.deleteAppointment(req.body, req.pathParams.id).then((result) => {
    sendResponse(res, result);
  })
    .catch((e) => {
      sendResponse(res, e);
    });
});

module.exports = router;