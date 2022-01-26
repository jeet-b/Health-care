const db = require('../../../config/db');
const masterModel = require('../../../model/master')(db);
const {
  schemaKeys,updateSchemaKeys
} = require('../../../validation/masterValidation');
const insertMasterValidator = require('../../../validation/genericValidator')(schemaKeys);
const updateMasterValidator = require('../../../validation/genericValidator')(updateSchemaKeys);
const makeMaster = require('../../../entity/master')({
  insertMasterValidator,
  updateMasterValidator
});
const masterService = require('../../../services/mongoDbService')({
  model:masterModel,
  makeMaster
});
const makeMasterController = require('./master');

const masterController = makeMasterController({
  masterService,
  makeMaster
});
module.exports = masterController;
