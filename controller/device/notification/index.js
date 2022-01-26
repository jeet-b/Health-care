const db = require('../../../config/db');
const notificationModel = require('../../../model/notification')(db);
const {
  schemaKeys,updateSchemaKeys
} = require('../../../validation/notificationValidation');
const insertNotificationValidator = require('../../../validation/genericValidator')(schemaKeys);
const updateNotificationValidator = require('../../../validation/genericValidator')(updateSchemaKeys);
const makeNotification = require('../../../entity/notification')({
  insertNotificationValidator,
  updateNotificationValidator
});
const notificationService = require('../../../services/mongoDbService')({
  model:notificationModel,
  makeNotification
});
const makeNotificationController = require('./notification');

const notificationController = makeNotificationController({
  notificationService,
  makeNotification
});
module.exports = notificationController;
