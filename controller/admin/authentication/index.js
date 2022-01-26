const db = require('../../../config/db');
const userModel  = require('../../../model/user')(db);
const {
  schemaKeys,updateSchemaKeys
} = require('../../../validation/userValidation');
const insertUserValidator = require('../../../validation/genericValidator')(schemaKeys);
const updateUserValidator = require('../../../validation/genericValidator')(updateSchemaKeys);
const makeUser = require('../../../entity/user')({
  insertUserValidator,
  updateUserValidator
});
const userService = require('../../../services/mongoDbService')({
  model:userModel,
  makeUser
});
const authService = require('../../../services/auth')({
  model:userModel,
  makeUser,
  userService
});
const makeAuthController = require('./authController');
const authController = makeAuthController({
  authService,
  userService,
  makeUser
});
module.exports = authController;