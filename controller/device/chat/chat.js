const message = require("../../../utils/messages");
const responseCode = require("../../../utils/responseCode");
const socketService = require("../../../services/socketService");
const { isValidObjectId } = require("mongoose");

function makeChatController({ chatService, makeChat }) {
  const addChat = async ({ data }) => {
    try {
      const originalData = data;

      let chat = makeChat(originalData, "insertChatValidator");
      const finalChatData = removeEmpty(chat);
      let createdChat = await chatService.createDocument(finalChatData);
      let getPopulatedChat = [];
      if (createdChat != null) {
        getPopulatedChat = await chatService.findWithPopulate(
          { _id: createdChat._id },
          [
            {
              path: "fromId",
              select: "name",
            },
            {
              path: "toId",
              select: "name",
            },
          ]
        );
        socketService.notifySocketMessages(getPopulatedChat);
      }

      return message.successResponse(
        { "Content-Type": "application/json" },
        responseCode.success,
        getPopulatedChat
      );
    } catch (error) {
      if (error.name === "ValidationError") {
        return message.inValidParam(
          { "Content-Type": "application/json" },
          responseCode.validationError,
          error.message
        );
      }
      return message.failureResponse(
        { "Content-Type": "application/json" },
        responseCode.internalServerError,
        error.message
      );
    }
  };

  const findAllChat = async ({ req }) => {
    try {
      let data = req.body;
      let options = {};
      let query = {};
      let result;
      if (data.isCountOnly) {
        if (data.query !== undefined) {
          query = { ...data.query };
        }
        result = await chatService.countDocument(query);
        if (result) {
          result = { totalRecords: result };
        } else {
          return message.recordNotFound(
            { "Content-Type": "application/json" },
            responseCode.success,
            []
          );
        }
      } else {
        if (data.options !== undefined) {
          options = { ...data.options };
        }

        if (data.query !== undefined) {
          query = { ...data.query };
        }
        query = {
          $or: [
            {
              fromId: req.user.id,
            },
            {
              toId: req.user.id,
            },
          ],
        };
        result = await chatService.getAllDocuments(query, options);
      }

      if (result) {
        return message.successResponse(
          { "Content-Type": "application/json" },
          responseCode.success,
          result
        );
      } else {
        return message.badRequest(
          { "Content-Type": "application/json" },
          responseCode.badRequest,
          {}
        );
      }
    } catch (error) {
      return message.failureResponse(
        { "Content-Type": "application/json" },
        responseCode.internalServerError,
        error.message
      );
    }
  };

  const getLatestChat = async ({ data, userId }) => {
    try {
      if (isValidObjectId(data.lastChatId) && isValidObjectId(userId)) {
        let lastChatData = await chatService.findWithPopulate({
          _id: data.lastChatId,
        });
        console.log(userId);
        let latestChats = [];
        if (lastChatData.length == 1) {
          latestChats = await chatService.findWithPopulate(
            {
              $or: [{ fromId: userId }, { toId: userId }],
              createdAt: {
                $gt: lastChatData[0].createdAt,
              },
            },
            [
              { path: "fromId", select: "name" },
              { path: "toId", select: "name" },
            ]
          );
        }
        return message.successResponse(
          { "Content-Type": "application/json" },
          responseCode.success,
          latestChats
        );
      } else {
        return message.inValidParam(
          { "Content-Type": "application/json" },
          responseCode.validationError,
          "Invalid Last Chat Id"
        );
      }
    } catch (error) {
      return message.failureResponse(
        { "Content-Type": "application/json" },
        responseCode.internalServerError,
        error.message
      );
    }
  };

  const getChatById = async (id) => {
    try {
      if (id) {
        const chat = await chatService.getSingleDocumentById(id);
        return message.successResponse(
          { "Content-Type": "application/json" },
          responseCode.success,
          chat
        );
      }
      return message.badRequest(
        { "Content-Type": "application/json" },
        responseCode.badRequest,
        {}
      );
    } catch (error) {
      return message.failureResponse(
        { "Content-Type": "application/json" },
        responseCode.internalServerError,
        error.message
      );
    }
  };
  const getChatCount = async (data) => {
    try {
      let where = {};
      if (data.where) {
        where = data.where;
      }
      let result = await chatService.countDocument(where);
      if (result) {
        result = { totalRecords: result };
        return message.successResponse(
          { "Content-Type": "application/json" },
          responseCode.success,
          result
        );
      }
      return message.badRequest(
        { "Content-Type": "application/json" },
        responseCode.badRequest,
        {}
      );
    } catch (error) {
      return message.failureResponse(
        { "Content-Type": "application/json" },
        responseCode.internalServerError,
        error.message
      );
    }
  };
  const getChatByAggregate = async ({ data }) => {
    try {
      if (data) {
        let result = await chatService.getDocumentByAggregation(data);
        if (result) {
          return message.successResponse(
            { "Content-Type": "application/json" },
            responseCode.success,
            result
          );
        }
      }
      return message.badRequest(
        { "Content-Type": "application/json" },
        responseCode.badRequest,
        {}
      );
    } catch (error) {
      return message.failureResponse(
        { "Content-Type": "application/json" },
        responseCode.internalServerError,
        error.message
      );
    }
  };
  const updateChat = async (data, id) => {
    try {
      if (id && data) {
        const chat = makeChat(data, "updateChatValidator");
        const filterData = removeEmpty(chat);
        let updatedChat = await chatService.findOneAndUpdateDocument(
          { _id: id },
          filterData,
          { new: true }
        );
        return message.successResponse(
          { "Content-Type": "application/json" },
          responseCode.success,
          updatedChat
        );
      }
      return message.badRequest(
        { "Content-Type": "application/json" },
        responseCode.badRequest,
        {}
      );
    } catch (error) {
      if (error.name === "ValidationError") {
        return message.inValidParam(
          { "Content-Type": "application/json" },
          responseCode.validationError,
          error.message
        );
      }
      return message.failureResponse(
        { "Content-Type": "application/json" },
        responseCode.internalServerError,
        error.message
      );
    }
  };
  const softDeleteChat = async (id) => {
    try {
      if (id) {
        let updatedChat = await chatService.softDeleteDocument(id);
        return message.successResponse(
          { "Content-Type": "application/json" },
          responseCode.success,
          updatedChat
        );
      }
      return message.badRequest(
        { "Content-Type": "application/json" },
        responseCode.badRequest,
        {}
      );
    } catch (error) {
      return message.failureResponse(
        { "Content-Type": "application/json" },
        responseCode.internalServerError,
        error.message
      );
    }
  };
  const bulkInsertChat = async ({ body }) => {
    try {
      let data = body.data;
      const chatEntities = body.data.map((item) =>
        makeChat(item, "insertChatValidator")
      );
      const results = await chatService.bulkInsert(chatEntities);
      return message.successResponse(
        { "Content-Type": "application/json" },
        responseCode.success,
        results
      );
    } catch (error) {
      if (error.name === "ValidationError") {
        return message.inValidParam(
          { "Content-Type": "application/json" },
          responseCode.validationError,
          error.message
        );
      }
      return message.failureResponse(
        { "Content-Type": "application/json" },
        responseCode.internalServerError,
        error.message
      );
    }
  };
  const bulkUpdateChat = async (data) => {
    try {
      if (data.filter && data.data) {
        const chat = makeChat(data.data, "updateChatValidator");
        const filterData = removeEmpty(chat);
        const updatedChats = await chatService.bulkUpdate(
          data.filter,
          filterData
        );
        return message.successResponse(
          { "Content-Type": "application/json" },
          responseCode.success,
          updatedChats
        );
      }
      return message.badRequest(
        { "Content-Type": "application/json" },
        responseCode.badRequest,
        {}
      );
    } catch (error) {
      if (error.name === "ValidationError") {
        return message.inValidParam(
          { "Content-Type": "application/json" },
          responseCode.validationError,
          error.message
        );
      }
      return message.failureResponse(
        { "Content-Type": "application/json" },
        responseCode.internalServerError,
        error.message
      );
    }
  };
  const deleteChat = async (data, id) => {
    try {
      if (id) {
        let deletedChat = await chatService.findOneAndDeleteDocument({
          _id: id,
        });
        return message.successResponse(
          { "Content-Type": "application/json" },
          responseCode.success,
          deletedChat
        );
      }
      return message.badRequest(
        { "Content-Type": "application/json" },
        responseCode.badRequest,
        {}
      );
    } catch (error) {
      return message.failureResponse(
        { "Content-Type": "application/json" },
        responseCode.internalServerError,
        error.message
      );
    }
  };

  const removeEmpty = (obj) => {
    let newObj = {};
    Object.keys(obj).forEach((key) => {
      if (obj[key] === Object(obj[key])) newObj[key] = removeEmpty(obj[key]);
      else if (obj[key] !== undefined) newObj[key] = obj[key];
    });
    return newObj;
  };
  return Object.freeze({
    addChat,
    findAllChat,
    getChatById,
    getChatCount,
    getChatByAggregate,
    updateChat,
    softDeleteChat,
    bulkInsertChat,
    bulkUpdateChat,
    deleteChat,
    removeEmpty,
    getLatestChat,
  });
}

module.exports = makeChatController;
