const express = require('express');
const router = express.Router();
const chatController = require('../../controller/device/chatRequest');
const adaptRequest = require('../../helpers/adaptRequest');
const sendResponse = require('../../helpers/sendResponse');
const auth = require('../../middleware/auth');
const checkRolePermission = require('../../middleware/checkRolePermission');

router.post('/device/api/v1/chatRequest/create', auth(...['createByUserInDevicePlatform', 'createByAdminInDevicePlatform']), checkRolePermission, (req, res, next) => {
  req = adaptRequest(req);
  chatController.addChatRequest({ data: req.body }).then((result) => {
    sendResponse(res, result);
  })
    .catch((e) => {
      sendResponse(res, e);
    });
});

router.post('/device/api/v1/chatRequest/list', auth(...['getAllByUserInDevicePlatform', 'getAllByAdminInDevicePlatform']), checkRolePermission, (req, res, next) => {
  req = adaptRequest(req);
  chatController.findAllChatRequest({ data: req.body }).then((result) => {
    sendResponse(res, result);
  })
    .catch((e) => {
      sendResponse(res, e);
    });
});

router.get('/device/api/v1/chatRequest/:id', auth(...['getByUserInDevicePlatform', 'getByAdminInDevicePlatform']), checkRolePermission, (req, res, next) => {
  req = adaptRequest(req);
  chatController.getChatRequestById(req.pathParams.id).then((result) => {
    sendResponse(res, result);
  }).catch((e) => {
    sendResponse(res, e);
  });
});

router.get('/device/api/v1/getMyChatRequest', auth(...['getByUserInDevicePlatform', 'getByAdminInDevicePlatform']), checkRolePermission, (req, res, next) => {
  req = adaptRequest(req);
  chatController.getRequestIfAvailable(req.user.id).then((result) => {
    sendResponse(res, result);
  }).catch((e) => {
    sendResponse(res, e);
  });
});

router.put('/device/api/v1/chatRequest/update/:id', auth(...['updateByUserInDevicePlatform', 'updateByAdminInDevicePlatform']), checkRolePermission, (req, res, next) => {
  req = adaptRequest(req);
  chatController.updateRequestStatus(req.body, req.pathParams.id).then((result) => {
    sendResponse(res, result);
  }).catch((e) => {
    sendResponse(res, e);
  });
});

module.exports = router;