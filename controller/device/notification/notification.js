const message = require("../../../utils/messages");
const responseCode = require("../../../utils/responseCode");
const _ = require("lodash");
const db = require("../../../config/db");
const Notification = require("../../../model/notification")(db);
function makeNotificationController({ notificationService, makeNotification }) {
  const addNotification = async ({ data }) => {
    try {
      const originalData = data;

      const notification = makeNotification(
        originalData,
        "insertNotificationValidator"
      );
      let createdNotification = await notificationService.createDocument(
        notification
      );

      return message.successResponse(
        { "Content-Type": "application/json" },
        responseCode.success,
        createdNotification
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
  const findAllNotification = async ({ req }) => {
    try {
      let data = req.body;
      let options = {};
      let query = {};
      let result;
      if (data.isCountOnly) {
        if (data.query !== undefined) {
          query = { ...data.query };
        }
        query = {
          userId: req.user.id,
          seen: false,
        };
        result = await notificationService.countDocument(query);
        if (result) {
          result = { totalRecords: result };
        } else {
          result = {};
          return message.recordNotFound(
            { "Content-Type": "application/json" },
            responseCode.success,
            result
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
          userId: req.user.id,
          seen: false,
        };
        result = await notificationService.getAllDocuments(query, options);
        let notificationsIds = result.docs.map((element) => {
          return element._id;
        });
        await Notification.updateMany(
          { _id: notificationsIds },
          { seen: true },
          { multi: true }
        );
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
  const getNotificationById = async (id) => {
    try {
      if (id) {
        const notification = await notificationService.getSingleDocumentById(
          id
        );
        return message.successResponse(
          { "Content-Type": "application/json" },
          responseCode.success,
          notification
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
  const getNotificationCount = async (data) => {
    try {
      let where = {};
      if (data.where) {
        where = data.where;
      }
      let result = await notificationService.countDocument(where);
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
  const getNotificationByAggregate = async ({ data }) => {
    try {
      if (data) {
        let result = await notificationService.getDocumentByAggregation(data);
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
  const updateNotification = async (data, id) => {
    try {
      if (id && data) {
        const notification = makeNotification(
          data,
          "updateNotificationValidator"
        );
        const filterData = removeEmpty(notification);
        let updatedNotification =
          await notificationService.findOneAndUpdateDocument(
            { _id: id },
            filterData,
            { new: true }
          );
        return message.successResponse(
          { "Content-Type": "application/json" },
          responseCode.success,
          updatedNotification
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
  const softDeleteNotification = async (id) => {
    try {
      if (id) {
        let updatedNotification = await notificationService.softDeleteDocument(
          id
        );
        return message.successResponse(
          { "Content-Type": "application/json" },
          responseCode.success,
          updatedNotification
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
  const bulkInsertNotification = async ({ body }) => {
    try {
      let data = body.data;
      const notificationEntities = body.data.map((item) =>
        makeNotification(item, "insertNotificationValidator")
      );
      const results = await notificationService.bulkInsert(
        notificationEntities
      );
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
  const bulkUpdateNotification = async (data) => {
    try {
      if (data.filter && data.data) {
        const notification = makeNotification(
          data.data,
          "updateNotificationValidator"
        );
        const filterData = removeEmpty(notification);
        const updatedNotifications = await notificationService.bulkUpdate(
          data.filter,
          filterData
        );
        return message.successResponse(
          { "Content-Type": "application/json" },
          responseCode.success,
          updatedNotifications
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
  const deleteNotification = async (data, id) => {
    try {
      if (id) {
        let deletedNotification =
          await notificationService.findOneAndDeleteDocument({ _id: id });
        return message.successResponse(
          { "Content-Type": "application/json" },
          responseCode.success,
          deletedNotification
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
    addNotification,
    findAllNotification,
    getNotificationById,
    getNotificationCount,
    getNotificationByAggregate,
    updateNotification,
    softDeleteNotification,
    bulkInsertNotification,
    bulkUpdateNotification,
    deleteNotification,
    removeEmpty,
  });
}

module.exports = makeNotificationController;
