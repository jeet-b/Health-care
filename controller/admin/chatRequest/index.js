const db = require('../../../config/db');
const chatRequestModel = require('../../../model/chatRequest')(db);
const { schemaKeys, updateSchemaKeys } = require('../../../validation/chatRequestValidation');
const insertChatRequestValidator = require('../../../validation/genericValidator')(schemaKeys);
const updateChatRequestValidator = require('../../../validation/genericValidator')(updateSchemaKeys);
const makeChatRequest = require('../../../entity/chatRequest')({
    insertChatRequestValidator,
    updateChatRequestValidator
});
const chatRequestService = require('../../../services/mongoDbService')({
    model: chatRequestModel,
    makeChatRequest
});
const makeChatRequestController = require('./chatRequest');

const chatRequestController = makeChatRequestController({ chatRequestService, makeChatRequest });
module.exports = chatRequestController;
