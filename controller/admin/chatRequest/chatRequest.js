const message = require("../../../utils/messages");
const responseCode = require("../../../utils/responseCode");
const socketService = require("../../../services/socketService");
const firebaseService = require("./../../../services/firebaseService");
const chatConstants = require("./../../../config/constant/chat");
const db = require("../../../config/db");
const chatModel = require("../../../model/chat")(db);
const chatRequestModel = require("../../../model/chatRequest")(db);
const User = require("../../../model/user")(db);
const chatModelService = require("../../../services/mongoDbService")({
  model: chatModel,
});

function makeChatRequestController({ chatRequestService, makeChatRequest }) {
  const addChatRequest = async ({ data }) => {
    try {
      const originalData = data;
      let messagebox;
      let result;
      let exitstingChat = await chatRequestService.getSingleDocumentByQuery({
        chatWith: chatRequest.chatWith,
      });
      if (exitstingChat != null) {
        let isInRequestOrAccept = ["requested", "accepted"];
        if (isInRequestOrAccept.includes(exitstingChat.status)) {
          result = null;
          messagebox = `your request is in '${exitstingChat.status}' status`;
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
          let updateChat = { status: "requested", history: requestHistory };

          result = await chatRequestService.findOneAndUpdateDocument(
            exitstingChat._id,
            updateChat,
            { new: true }
          );
          messagebox = "Chat request raised successfully!";
          socketService.notifySocketRequest(result.chatWith);
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
        socketService.notifySocketRequest(result.chatWith);
      }
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

  const getRequestedList = async () => {
    try {
      let requests = await chatRequestService.findWithPopulate({
        status: "requested",
        chatWith: null,
      });
      return message.successResponse(
        { "Content-Type": "application/json" },
        responseCode.success,
        requests
      );
    } catch (error) {
      console.error("Error - getRequestedList", error);
      return message.failureResponse(
        { "Content-Type": "application/json" },
        responseCode.internalServerError,
        error.message
      );
    }
  };

  const updateRequestStatus = async (data, userId, id) => {
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
            updatedBy: userId,
            date: Date.now(),
          });
          let updateQuery = {
            status: originalData.status,
            history: history,
            chatWith: null,
          };
          if (originalData.status == chatConstants.ACCEPTED) {
            await firebaseService.onRequestSent(
              existingRequest.requestedBy,
              true
            );
            updateQuery.chatWith = userId;
          }

          //showLast Message
          let showLastMessageAt = [chatConstants.CLOSED];
          if (showLastMessageAt.includes(originalData.status)) {
            await firebaseService.onRequestSent(
              existingRequest.requestedBy,
              false
            );
            let getLastMessage = await chatModel
              .find({
                $or: [
                  { fromId: existingRequest.requestedBy },
                  { toId: existingRequest.requestedBy },
                ],
              })
              .sort({ _id: -1 })
              .limit(1);
            let lastChatAt =
              getLastMessage.length == 1 ? getLastMessage[0].createdAt : "";
            if (lastChatAt != "") {
              lastChatAt = new Date(lastChatAt).toISOString();
              await chatModelService.createDocument({
                type: "lastMessage",
                fromId: userId,
                toId: existingRequest.requestedBy,
                content: lastChatAt.toString(),
              });
            }
          }
          results = await chatRequestModel.findOneAndUpdate(
            { _id: id },
            updateQuery,
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
    softDeleteChatRequest,
    getRequestedList,
  });
}

module.exports = makeChatRequestController;
