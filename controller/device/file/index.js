const db = require('../../../config/db');
const fileModel = require('../../../model/file')(db);
const {
  schemaKeys,updateSchemaKeys
} = require('../../../validation/fileValidation');
const insertFileValidator = require('../../../validation/genericValidator')(schemaKeys);
const updateFileValidator = require('../../../validation/genericValidator')(updateSchemaKeys);
const makeFile = require('../../../entity/file')({
  insertFileValidator,
  updateFileValidator
});
const fileService = require('../../../services/mongoDbService')({
  model:fileModel,
  makeFile
});
const makeFileController = require('./file');

const fileController = makeFileController({
  fileService,
  makeFile
});
module.exports = fileController;
