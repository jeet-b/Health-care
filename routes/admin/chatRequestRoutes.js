const express = require('express');
const router = express.Router();
const chatController = require('../../controller/admin/chatRequest');
const adaptRequest = require('../../helpers/adaptRequest');
const sendResponse = require('../../helpers/sendResponse');
const auth = require('../../middleware/auth');
const checkRolePermission = require('../../middleware/checkRolePermission');

router.post('/admin/chatRequest/create', auth(...['createByAdminInAdminPlatform']), checkRolePermission, (req, res, next) => {
  req = adaptRequest(req);
  chatController.addChatRequest({ data: req.body }).then((result) => {
    sendResponse(res, result);
  })
    .catch((e) => {
      sendResponse(res, e);
    });
});

router.post('/admin/chatRequest/available', auth(...['getAllByAdminInAdminPlatform']), checkRolePermission, (req, res, next) => {
  req = adaptRequest(req);
  chatController.getRequestedList().then((result) => {
    sendResponse(res, result);
  }).catch((e) => {
    sendResponse(res, e);
  });
});

router.post('/admin/chatRequest/list', auth(...['getAllByAdminInAdminPlatform']), checkRolePermission, (req, res, next) => {
  req = adaptRequest(req);
  chatController.findAllChatRequest({ data: req.body }).then((result) => {
    sendResponse(res, result);
  })
    .catch((e) => {
      sendResponse(res, e);
    });
});

router.get('/admin/chatRequest/:id', auth(...['getByAdminInAdminPlatform']), checkRolePermission, (req, res, next) => {
  req = adaptRequest(req);
  chatController.getChatRequestById(req.pathParams.id).then((result) => {
    sendResponse(res, result);
  })
    .catch((e) => {
      sendResponse(res, e);
    });
});

router.put('/admin/chatRequest/update/:id', auth(...['updateByAdminInAdminPlatform']), checkRolePermission, (req, res, next) => {
  req = adaptRequest(req);
  chatController.updateRequestStatus(req.body, req.user.id, req.pathParams.id).then((result) => {
    sendResponse(res, result);
  }).catch((e) => {
    sendResponse(res, e);
  });
});

module.exports = router;