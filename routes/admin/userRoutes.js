const express = require('express');
const router = express.Router();
const userController = require('../../controller/admin/user');
const adaptRequest = require('../../helpers/adaptRequest');
const sendResponse = require('../../helpers/sendResponse');
const auth = require('../../middleware/auth');
const checkRolePermission = require('../../middleware/checkRolePermission');

router.post('/admin/user/create',auth(...[ 'createByAdminInAdminPlatform' ]), checkRolePermission, (req, res, next) => {
  req = adaptRequest(req);
  userController.addUser({ data: req.body }, req.i18n).then((result) => {
    sendResponse(res, result);
  })
    .catch((e) => {
      sendResponse(res, e);
    });
});
router.post('/admin/user/list', auth(...['getAllByAdminInAdminPlatform']), checkRolePermission, (req, res, next) => {
  req = adaptRequest(req);
  userController.findAllUser({ data: req.body }).then((result) => {
    sendResponse(res, result);
  })
    .catch((e) => {
      sendResponse(res, e);
    });
});
router.get('/admin/user/:id', auth(...['getByAdminInAdminPlatform']), checkRolePermission, (req, res, next) => {
  req = adaptRequest(req);
  userController.getUserById(req.pathParams.id).then((result) => {
    sendResponse(res, result);
  })
    .catch((e) => {
      sendResponse(res, e);
    });
});
router.post('/admin/user/revenue/:id', auth(...['getByAdminInAdminPlatform']), checkRolePermission, (req, res, next) => {
  req = adaptRequest(req);
  userController.userRevenue(req.pathParams.id).then((result) => {
    sendResponse(res, result);
  })
    .catch((e) => {
      sendResponse(res, e);
    });
});
router.post('/admin/user/total-appointment/:id', auth(...['getByAdminInAdminPlatform']), checkRolePermission, (req, res, next) => {
  req = adaptRequest(req);
  userController.totalAppointment(req.pathParams.id).then((result) => {
    sendResponse(res, result);
  })
    .catch((e) => {
      sendResponse(res, e);
    });
});
router.route('/admin/user/count').post(auth(...['getCountByAdminInAdminPlatform']), checkRolePermission, (req, res, next) => {
  req = adaptRequest(req);
  userController.getUserCount(req.body).then((result) => {
    sendResponse(res, result);
  })
    .catch((e) => {
      sendResponse(res, e);
    });
});
router.route('/admin/user/aggregate').post(auth(...['aggregateByAdminInAdminPlatform']), checkRolePermission, (req, res, next) => {
  req = adaptRequest(req);
  userController.getUserByAggregate({ data: req.body }).then((result) => {
    sendResponse(res, result);
  })
    .catch((e) => {
      sendResponse(res, e);
    });
});
router.put('/admin/user/update/:id', auth(...['updateByAdminInAdminPlatform']), checkRolePermission, (req, res, next) => {
  req = adaptRequest(req);
  userController.updateUser(req.body, req.pathParams.id).then((result) => {
    sendResponse(res, result);
  })
    .catch((e) => {
      sendResponse(res, e);
    });
});
router.put('/admin/user/softDelete/:id', auth(...['softDeleteByAdminInAdminPlatform']), checkRolePermission, (req, res, next) => {
  req = adaptRequest(req);
  userController.softDeleteUser(req.pathParams.id).then((result) => {
    sendResponse(res, result);
  })
    .catch((e) => {
      sendResponse(res, e);
    });
});
router.post('/admin/user/addBulk', checkRolePermission, (req, res, next) => {
  req = adaptRequest(req);
  userController.bulkInsertUser({ body: req.body }).then((result) => {
    sendResponse(res, result);
  })
    .catch((e) => {
      sendResponse(res, e);
    });
});
router.put('/admin/user/updateBulk', auth(...['updateBulkByAdminInAdminPlatform']), checkRolePermission, (req, res, next) => {
  req = adaptRequest(req);
  userController.bulkUpdateUser(req.body).then((result) => {
    sendResponse(res, result);
  })
    .catch((e) => {
      sendResponse(res, e);
    });
});
router.delete('/admin/user/delete/:id', auth(...['deleteByAdminInAdminPlatform']), checkRolePermission, (req, res, next) => {
  req = adaptRequest(req);
  userController.deleteUser(req.body, req.pathParams.id).then((result) => {
    sendResponse(res, result);
  })
    .catch((e) => {
      sendResponse(res, e);
    });
});

router.route('/admin/user/change-password').put(auth(...['changePasswordByAdminInAdminPlatform']), (req, res, next) => {
  req = adaptRequest(req);
  let params = {
    ...req.body,
    userId: req.user.id
  };
  userController.changePassword(params).then((result) => {
    sendResponse(res, result);
  })
    .catch((e) => {
      sendResponse(res, e);
    });
});
router.route('/admin/user/update-profile').put(auth(...['updateProfileByAdminInAdminPlatform']), (req, res, next) => {
  req = adaptRequest(req);
  userController.updateProfile(req.body, req.user.id).then((result) => {
    sendResponse(res, result);
  }).catch((e) => {
    sendResponse(res, e);
  });
});

router.post('/admin/user/patients-by-provider', auth(...['getAllByAdminInAdminPlatform']), checkRolePermission, (req, res, next) => {
  req = adaptRequest(req);
  userController.getPatientsByProviderId(req.body).then((results) => {
    sendResponse(res, results);
  }).catch((e) => {
    sendResponse(res, e);
  });
});

router.post('/admin/user/patients-photo-gallery', auth(...['getAllByAdminInAdminPlatform']), checkRolePermission, (req, res, next) => {
  req = adaptRequest(req);
  userController.getPhotoGallery(req.body).then((results) => {
    sendResponse(res, results);
  }).catch((e) => {
    sendResponse(res, e);
  });
});

router.post('/admin/userActivity', auth(...['getAllByAdminInAdminPlatform']), checkRolePermission, (req, res, next) => {
  req = adaptRequest(req);
  userController.getUserActivity(req.body).then((results) => {
    sendResponse(res, results);
  }).catch((e) => {
    sendResponse(res, e);
  });
});

router.post('/admin/user/sendResetPasswordLink', auth(...['getAllByAdminInAdminPlatform']), checkRolePermission, (req, res, next) => {
  req = adaptRequest(req);
  userController.sendResetPasswordLink({ req }).then((results) => {
    sendResponse(res, results);
  }).catch((e) => {
    sendResponse(res, e);
  });
});
router.post('/admin/user/invite-link', auth(...['getAllByAdminInAdminPlatform']), checkRolePermission, (req, res, next) => {
  req = adaptRequest(req);
  userController.sendInviteLink({ req }).then((results) => {
    sendResponse(res, results);
  }).catch((e) => {
    sendResponse(res, e);
  });
});



module.exports = router;