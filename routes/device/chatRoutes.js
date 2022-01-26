const express = require('express');
const router = express.Router();
const chatController = require('../../controller/device/chat');
const adaptRequest = require('../../helpers/adaptRequest');
const sendResponse = require('../../helpers/sendResponse');
const auth = require('../../middleware/auth');
const checkRolePermission = require('../../middleware/checkRolePermission');

router.post('/device/api/v1/chat/create', auth(...['createByUserInDevicePlatform', 'createByAdminInDevicePlatform']), checkRolePermission, (req, res, next) => {
  req = adaptRequest(req);
  chatController.addChat({ data: req.body }).then((result) => {
    sendResponse(res, result);
  }).catch((e) => {
    sendResponse(res, e);
  });
});

router.post('/device/api/v1/chat/list', auth(...['getAllByUserInDevicePlatform', 'getAllByAdminInDevicePlatform']), checkRolePermission, (req, res, next) => {
  req = adaptRequest(req);
  chatController.findAllChat({ req }).then((result) => {
    sendResponse(res, result);
  }).catch((e) => {
    sendResponse(res, e);
  });
});

router.post('/device/api/v1/chat/get-latest-chats', auth(...['getAllByUserInDevicePlatform', 'getAllByAdminInDevicePlatform']), checkRolePermission, (req, res, next) => {
  req = adaptRequest(req);
  chatController.getLatestChat({ data: req.body, userId: req.user.id }).then((result) => {
    sendResponse(res, result);
  }).catch((e) => {
    sendResponse(res, e);
  });
});

router.get('/device/api/v1/chat/:id', auth(...['getByUserInDevicePlatform', 'getByAdminInDevicePlatform']), checkRolePermission, (req, res, next) => {
  req = adaptRequest(req);
  chatController.getChatById(req.pathParams.id).then((result) => {
    sendResponse(res, result);
  }).catch((e) => {
    sendResponse(res, e);
  });
});

router.route('/device/api/v1/chat/count').post(auth(...['getCountByAdminInAdminPlatform']), checkRolePermission, (req, res, next) => {
  req = adaptRequest(req);
  chatController.getChatCount(req.body).then((result) => {
    sendResponse(res, result);
  }).catch((e) => {
    sendResponse(res, e);
  });
});

router.route('/device/api/v1/chat/aggregate').post(auth(...['aggregateByAdminInAdminPlatform']), checkRolePermission, (req, res, next) => {
  req = adaptRequest(req);
  chatController.getChatByAggregate({ data: req.body }).then((result) => {
    sendResponse(res, result);
  })
    .catch((e) => {
      sendResponse(res, e);
    });
});

router.put('/device/api/v1/chat/update/:id', auth(...['updateByUserInDevicePlatform', 'updateByAdminInDevicePlatform']), checkRolePermission, (req, res, next) => {
  req = adaptRequest(req);
  chatController.updateChat(req.body, req.pathParams.id).then((result) => {
    sendResponse(res, result);
  }).catch((e) => {
    sendResponse(res, e);
  });
});

router.put('/device/api/v1/chat/softDelete/:id', auth(...['softDeleteByUserInDevicePlatform','softDeleteByAdminInDevicePlatform']), checkRolePermission, (req, res, next) => {
  req = adaptRequest(req);
  chatController.softDeleteChat(req.pathParams.id).then((result) => {
    sendResponse(res, result);
  }).catch((e) => {
    sendResponse(res, e);
  });
});

router.post('/device/api/v1/chat/addBulk', auth(...[ 'addBulkByUserInDevicePlatform', 'addBulkByAdminInDevicePlatform' ]), checkRolePermission, (req, res, next) => {
  chatController.bulkInsertChat({ body: req.body }).then((result) => {
    sendResponse(res, result);
  }).catch((e) => {
    sendResponse(res, e);
  });
});

router.put('/device/api/v1/chat/updateBulk', auth(...[
  'updateBulkByUserInDevicePlatform',
  'updateBulkByAdminInDevicePlatform'
]), checkRolePermission, (req, res, next) => {
  req = adaptRequest(req);
  chatController.bulkUpdateChat(req.body).then((result) => {
    sendResponse(res, result);
  }).catch((e) => {
    sendResponse(res, e);
  });
});

router.delete('/device/api/v1/chat/delete/:id', auth(...[ 'deleteByUserInDevicePlatform', 'deleteByAdminInDevicePlatform' ]), checkRolePermission, (req, res, next) => {
  req = adaptRequest(req);
  chatController.deleteChat(req.body, req.pathParams.id).then((result) => {
    sendResponse(res, result);
  }).catch((e) => {
    sendResponse(res, e);
  });
});

module.exports = router;