const db = require('../../../config/db');
const userActivityModel = require('../../../model/userActivity')(db);
const {
  schemaKeys,updateSchemaKeys
} = require('../../../validation/userActivityValidation');
const insertUserActivityValidator = require('../../../validation/genericValidator')(schemaKeys);
const updateUserActivityValidator = require('../../../validation/genericValidator')(updateSchemaKeys);
const makeUserActivity = require('../../../entity/userActivity')({
  insertUserActivityValidator,
  updateUserActivityValidator
});
const userActivityService = require('../../../services/mongoDbService')({
  model:userActivityModel,
  makeUserActivity
});
const makeUserActivityController = require('./userActivity');

const userActivityController = makeUserActivityController({
  userActivityService,
  makeUserActivity
});
module.exports = userActivityController;
