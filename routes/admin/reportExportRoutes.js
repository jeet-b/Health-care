const express = require('express');
const router = express.Router();
const reportExportController = require('../../controller/admin/reportExport/reportExportController');
const adaptRequest = require('../../helpers/adaptRequest');
const sendResponse = require('../../helpers/sendResponse');
const auth = require('../../middleware/auth');
const checkRolePermission = require('../../middleware/checkRolePermission');

router.get('/admin/api/v1/report-export/export-new-user-report',(req,res,next)=>{
  req = adaptRequest(req);
  reportExportController.exportNewUserReport( req, res );
});
router.get('/admin/api/v1/report-export/physician-report',(req,res,next)=>{
    req = adaptRequest(req);
    reportExportController.physicianReport( req, res );
});
router.get('/admin/api/v1/report-export/transaction-report',(req,res,next)=>{
  req = adaptRequest(req);
  reportExportController.exportTransactionReport( req, res );
});
router.get('/admin/api/v1/report-export/average-transaction-report',(req,res,next)=>{
  req = adaptRequest(req);
  reportExportController.exportTransactionReport( req, res );
});
router.get('/admin/api/v1/report-export/revenue-report',(req,res,next)=>{
  req = adaptRequest(req);
  reportExportController.exportTransactionReport( req, res );
});

module.exports = router;