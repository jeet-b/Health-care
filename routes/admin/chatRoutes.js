const express = require('express');
const router = express.Router();
const chatController = require('../../controller/admin/chat');
const adaptRequest = require('../../helpers/adaptRequest');
const sendResponse = require('../../helpers/sendResponse');
const auth = require('../../middleware/auth');
const checkRolePermission = require('../../middleware/checkRolePermission');

router.post('/admin/chat/create', auth(...['createByAdminInAdminPlatform']), checkRolePermission, (req, res, next) => {
  req = adaptRequest(req);
  chatController.addChat({ data: req.body }).then((result) => {
    sendResponse(res, result);
  })
    .catch((e) => {
      sendResponse(res, e);
    });
});

router.post('/admin/chat/users', auth(...['getAllByAdminInAdminPlatform']), checkRolePermission, (req, res, next) => {
  req = adaptRequest(req);
  chatController.chatUsers(req.body.type,req.body.options, req.user.id).then((result) => {
    sendResponse(res, result);
  }).catch((e) => {
    sendResponse(res, e);
  });
});

router.post('/admin/chat/list', auth(...['getAllByAdminInAdminPlatform']), checkRolePermission, (req, res, next) => {
  req = adaptRequest(req);
  chatController.findAllChat({ data: req.body }).then((result) => {
    sendResponse(res, result);
  })
    .catch((e) => {
      sendResponse(res, e);
    });
});

router.post('/admin/chat/get-latest-chats', auth(...['getAllByAdminInAdminPlatform']), checkRolePermission, (req, res, next) => {
  req = adaptRequest(req);
  chatController.getLatestChat({ data: req.body, userId: req.user.id }).then((result) => {
    sendResponse(res, result);
  })
    .catch((e) => {
      sendResponse(res, e);
    });
});

router.get('/admin/chat/:id', auth(...['getByAdminInAdminPlatform']), checkRolePermission, (req, res, next) => {
  req = adaptRequest(req);
  chatController.getChatById(req.pathParams.id).then((result) => {
    sendResponse(res, result);
  })
    .catch((e) => {
      sendResponse(res, e);
    });
});
router.route('/admin/chat/count').post(auth(...['getCountByAdminInAdminPlatform']), checkRolePermission, (req, res, next) => {
  req = adaptRequest(req);
  chatController.getChatCount(req.body).then((result) => {
    sendResponse(res, result);
  })
    .catch((e) => {
      sendResponse(res, e);
    });
});
router.route('/admin/chat/aggregate').post(auth(...['aggregateByAdminInAdminPlatform']), checkRolePermission, (req, res, next) => {
  req = adaptRequest(req);
  chatController.getChatByAggregate({ data: req.body }).then((result) => {
    sendResponse(res, result);
  })
    .catch((e) => {
      sendResponse(res, e);
    });
});
router.put('/admin/chat/update/:id', auth(...['updateByAdminInAdminPlatform']), checkRolePermission, (req, res, next) => {
  req = adaptRequest(req);
  chatController.updateChat(req.body, req.pathParams.id).then((result) => {
    sendResponse(res, result);
  })
    .catch((e) => {
      sendResponse(res, e);
    });
});
router.put('/admin/chat/softDelete/:id', auth(...['softDeleteByAdminInAdminPlatform']), checkRolePermission, (req, res, next) => {
  req = adaptRequest(req);
  chatController.softDeleteChat(req.pathParams.id).then((result) => {
    sendResponse(res, result);
  })
    .catch((e) => {
      sendResponse(res, e);
    });
});
router.post('/admin/chat/addBulk', auth(...['addBulkByAdminInAdminPlatform']), checkRolePermission, (req, res, next) => {
  chatController.bulkInsertChat({ body: req.body }).then((result) => {
    sendResponse(res, result);
  })
    .catch((e) => {
      sendResponse(res, e);
    });
});
router.put('/admin/chat/updateBulk', auth(...['updateBulkByAdminInAdminPlatform']), checkRolePermission, (req, res, next) => {
  req = adaptRequest(req);
  chatController.bulkUpdateChat(req.body).then((result) => {
    sendResponse(res, result);
  })
    .catch((e) => {
      sendResponse(res, e);
    });
});
router.delete('/admin/chat/delete/:id', auth(...['deleteByAdminInAdminPlatform']), checkRolePermission, (req, res, next) => {
  req = adaptRequest(req);
  chatController.deleteChat(req.body, req.pathParams.id).then((result) => {
    sendResponse(res, result);
  })
    .catch((e) => {
      sendResponse(res, e);
    });
});

module.exports = router;