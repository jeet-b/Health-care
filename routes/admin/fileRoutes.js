const express = require('express');
const router = express.Router();
const fileController = require('../../controller/admin/file');
const adaptRequest = require('../../helpers/adaptRequest');
const sendResponse = require('../../helpers/sendResponse');
const auth = require('../../middleware/auth');
const checkRolePermission = require('../../middleware/checkRolePermission');


router.post("/admin/api/v1/file-upload", (req, res) => {
  fileController.filesUpload(req).then((result)=>{
    sendResponse(res,result);
  }).catch((e) => {
      sendResponse(res,e);
    });
})
router.post("/admin/api/v1/file-remove", (req, res) => {
  fileController.removeFiles(req).then((result)=>{
    sendResponse(res,result);
  }).catch((e) => {
      sendResponse(res,e);
    });
})

router.get('/admin/api/v1/file/:id',(req,res,next)=>{
  req = adaptRequest(req);
  fileController.getFileById(req.pathParams.id).then((result)=>{
    sendResponse(res,result);
  })
    .catch((e) => {
      sendResponse(res,e);
    });
});
router.delete('/admin/api/v1/file/delete/:id',(req,res,next)=>{
  req = adaptRequest(req);
  fileController.deleteFile(req.body,req.pathParams.id).then((result)=>{
    sendResponse(res,result);
  })
    .catch((e) => {
      sendResponse(res,e);
    });
});

module.exports = router;