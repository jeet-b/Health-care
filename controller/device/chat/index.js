const db = require('../../../config/db');
const chatModel = require('../../../model/chat')(db);
const {
  schemaKeys,updateSchemaKeys
} = require('../../../validation/chatValidation');
const insertChatValidator = require('../../../validation/genericValidator')(schemaKeys);
const updateChatValidator = require('../../../validation/genericValidator')(updateSchemaKeys);
const makeChat = require('../../../entity/chat')({
  insertChatValidator,
  updateChatValidator
});
const chatService = require('../../../services/mongoDbService')({
  model:chatModel,
  makeChat
});
const makeChatController = require('./chat');

const chatController = makeChatController({
  chatService,
  makeChat
});
module.exports = chatController;
