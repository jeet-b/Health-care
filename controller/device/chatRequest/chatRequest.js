const message = require("../../../utils/messages");
const responseCode = require("../../../utils/responseCode");
const db = require("../../../config/db");
const socketService = require("../../../services/socketService");
const chatConstants = require("./../../../config/constant/chat");
const { MESSAGE, NOTIFICATION_MESSAGE } = require("../../../config/message");
const Role = require("../../../model/role")(db);
const User = require("../../../model/user")(db);
const notificationService = require("../../../services/notification");
const {
  NOTIFICATION_TITLE,
  USER_ROLE,
  TIMEZONE,
} = require("../../../config/authConstant");
const _ = require("lodash");
function makeChatRequestController({ chatRequestService, makeChatRequest }) {
  const addChatRequest = async ({ data }) => {
    try {
      const originalData = data;
      let messagebox;
      let result;
      let userData = await User.findById(originalData.requestedBy);
      originalData.user = {
        email: userData.email,
        phone: userData.phone,
        name: userData.name,
      };
      const chatRequest = originalData;
      let exitstingChat = await chatRequestService.getSingleDocumentByQuery({
        requestedBy: chatRequest.requestedBy,
      });
      if (exitstingChat != null) {
        let isInRequestOrAccept = ["requested", "accepted"];
        if (isInRequestOrAccept.includes(exitstingChat.status)) {
          result = null;
          if (exitstingChat.status == "requested") {
            messagebox = `Your request is not accepted by admin yet!`;
          } else {
            messagebox = `Your request already accepted!`;
          }
        } else {
          let requestHistory = [];
          if (
            exitstingChat.history != null &&
            exitstingChat.history.length > 0
          ) {
            requestHistory = exitstingChat.history;
          }
          requestHistory.push({
            status: "requested",
            date: Date.now(),
            updatedBy: exitstingChat.requestedBy,
          });
          let updateChat = {
            status: "requested",
            history: requestHistory,
            user: chatRequest.user,
          };

          result = await chatRequestService.findOneAndUpdateDocument(
            exitstingChat.id,
            updateChat,
            { new: true }
          );
          messagebox = "Chat request raised successfully!";
          socketService.notifySocketRequest(result.requestedBy);
        }
      } else {
        let requestHistory = [];
        requestHistory.push({
          status: "requested",
          date: Date.now(),
          updatedBy: chatRequest.requestedBy,
        });
        chatRequest.history = requestHistory;
        let createdRequest = await chatRequestService.createDocument(
          chatRequest
        );
        result = await chatRequestService.getSingleDocumentById(
          createdRequest._id
        );
        messagebox = "Chat request raised successfully!";
        socketService.notifySocketRequest(result.requestedBy);
      }
      let user = await User.findOne({ _id: chatRequest.requestedBy });
      let adminRole = await Role.findOne({ code: USER_ROLE.Admin });
      let adminUser = await User.find({ roleIds: adminRole._id });
      await Promise.all(
        _.map(adminUser, async (doc) => {
          await notificationService.create(
            doc._id,
            NOTIFICATION_TITLE.CHAT_REQUESTED,
            NOTIFICATION_MESSAGE.CHAT_REQUESTED(user.name)
          );
        })
      );
      return message.successResponse(
        { "Content-Type": "application/json" },
        responseCode.success,
        result,
        messagebox
      );
    } catch (error) {
      console.error("Error - addChatRequest", error);
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

  const updateRequestStatus = async (data, id) => {
    try {
      const originalData = data;
      let results, messages;
      if (chatConstants.REQUEST_STATUS.includes(originalData.status)) {
        let existingRequest = await chatRequestService.getSingleDocumentById(
          id
        );
        if (existingRequest) {
          let history = existingRequest.history;
          history.push({
            status: originalData.status,
            updatedBy: req.user._id,
            date: Date.now(),
          });
          results = await chatRequestService.findOneAndUpdateDocument(
            id,
            { status: originalData.status, history: history },
            { new: true }
          );
          messages = "Request status updated successfully!";
        } else {
          results = null;
          messages = "No records found!";
        }
      } else {
        results = null;
        messages = "Invalid status string!";
      }
      return message.successResponse(
        { "Content-Type": "application/json" },
        responseCode.success,
        results,
        messages
      );
    } catch (error) {
      console.error("Error - updateRequestStatus", error);
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

  const getRequestIfAvailable = async (userId) => {
    try {
      let result = await chatRequestService.findWithPopulate({
        requestedBy: userId,
      });
      return message.successResponse(
        { "Content-Type": "application/json" },
        responseCode.success,
        result
      );
    } catch (error) {
      console.error("Error - getRequestIfAvailable", error);
      return message.failureResponse(
        { "Content-Type": "application/json" },
        responseCode.internalServerError,
        error.message
      );
    }
  };

  const findAllChatRequest = async ({ data }) => {
    try {
      let options = {};
      let query = {};
      let result;
      if (data.isCountOnly) {
        if (data.query !== undefined) {
          query = { ...data.query };
        }
        result = await chatRequestService.countDocument(query);
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
        result = await chatRequestService.getAllDocuments(query, options);
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
      console.error("Error - findAllChatRequest", error);
      return message.failureResponse(
        { "Content-Type": "application/json" },
        responseCode.internalServerError,
        error.message
      );
    }
  };

  const getChatRequestById = async (id) => {
    try {
      if (id) {
        const chatRequest = await chatRequestService.getSingleDocumentById(id);
        return message.successResponse(
          { "Content-Type": "application/json" },
          responseCode.success,
          chatRequest
        );
      }
      return message.badRequest(
        { "Content-Type": "application/json" },
        responseCode.badRequest,
        {}
      );
    } catch (error) {
      console.error("Error - getChatRequestById", error);
      return message.failureResponse(
        { "Content-Type": "application/json" },
        responseCode.internalServerError,
        error.message
      );
    }
  };

  const softDeleteChatRequest = async (id) => {
    try {
      if (id) {
        let updatedChatRequest = await chatRequestService.softDeleteDocument(
          id
        );
        return message.successResponse(
          { "Content-Type": "application/json" },
          responseCode.success,
          updatedChatRequest
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

  return Object.freeze({
    addChatRequest,
    updateRequestStatus,
    findAllChatRequest,
    getChatRequestById,
    getRequestIfAvailable,
    softDeleteChatRequest,
  });
}

module.exports = makeChatRequestController;
