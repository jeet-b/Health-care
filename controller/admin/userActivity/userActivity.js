const message = require("../../../utils/messages");
const responseCode = require("../../../utils/responseCode");
const { USER_ROLE } = require("../../../config/authConstant");
const db = require("../../../config/db");
const UserActivity = require("../../../model/userActivity")(db);
const Role = require("../../../model/role")(db);
const ObjectId = require("mongodb").ObjectId;

function makeUserActivityController({ userActivityService, makeUserActivity }) {
  const addUserActivity = async ({ data }) => {
    try {
      const originalData = data;

      const userActivity = makeUserActivity(
        originalData,
        "insertUserActivityValidator"
      );
      let createdUserActivity = await userActivityService.createDocument(
        userActivity
      );

      return message.successResponse(
        { "Content-Type": "application/json" },
        responseCode.success,
        createdUserActivity
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
  const findAllUserActivity = async ({ data }) => {
    try {
      let options = {};
      let query = {};
      let result;
      if (data.isCountOnly) {
        if (data.query !== undefined) {
          query = { ...data.query };
        }
        result = await userActivityService.countDocument(query);
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
        // if (options.populate) {
        //   delete options.populate;
        // }
        // if (data.query !== undefined) {
        //   query = { ...data.query };
        // }
        // query = {
        //   route: { $not: { $regex: /admin/ } },
        // };
        if (data.query.status != undefined) {
          let userRole = await Role.findOne({ code: data.query.status });
          query = {
            // route: { $not: { $regex: /admin/ } },
            roleId: ObjectId(userRole._id),
          };
        }
        result = await userActivityService.getAllDocuments(query, options);
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
  const getUserActivityById = async (id) => {
    try {
      if (id) {
        const userActivity = await userActivityService.getSingleDocumentById(
          id
        );
        return message.successResponse(
          { "Content-Type": "application/json" },
          responseCode.success,
          userActivity
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
  const getUserActivityCount = async (data) => {
    try {
      let where = {};
      if (data.where) {
        where = data.where;
      }
      let result = await userActivityService.countDocument(where);
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
  const getUserActivityByAggregate = async ({ data }) => {
    try {
      if (data) {
        let result = await userActivityService.getDocumentByAggregation(data);
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
  const updateUserActivity = async (data, id) => {
    try {
      if (id && data) {
        const userActivity = makeUserActivity(
          data,
          "updateUserActivityValidator"
        );
        const filterData = removeEmpty(userActivity);
        let updatedUserActivity =
          await userActivityService.findOneAndUpdateDocument(
            { _id: id },
            filterData,
            { new: true }
          );
        return message.successResponse(
          { "Content-Type": "application/json" },
          responseCode.success,
          updatedUserActivity
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
  const softDeleteUserActivity = async (id) => {
    try {
      if (id) {
        let updatedUserActivity = await userActivityService.softDeleteDocument(
          id
        );
        return message.successResponse(
          { "Content-Type": "application/json" },
          responseCode.success,
          updatedUserActivity
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
  const bulkInsertUserActivity = async ({ body }) => {
    try {
      let data = body.data;
      const userActivityEntities = body.data.map((item) =>
        makeUserActivity(item, "insertUserActivityValidator")
      );
      const results = await userActivityService.bulkInsert(
        userActivityEntities
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
  const bulkUpdateUserActivity = async (data) => {
    try {
      if (data.filter && data.data) {
        const userActivity = makeUserActivity(
          data.data,
          "updateUserActivityValidator"
        );
        const filterData = removeEmpty(userActivity);
        const updatedUserActivitys = await userActivityService.bulkUpdate(
          data.filter,
          filterData
        );
        return message.successResponse(
          { "Content-Type": "application/json" },
          responseCode.success,
          updatedUserActivitys
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
  const deleteUserActivity = async (data, id) => {
    try {
      if (id) {
        let deletedUserActivity =
          await userActivityService.findOneAndDeleteDocument({ _id: id });
        return message.successResponse(
          { "Content-Type": "application/json" },
          responseCode.success,
          deletedUserActivity
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
    addUserActivity,
    findAllUserActivity,
    getUserActivityById,
    getUserActivityCount,
    getUserActivityByAggregate,
    updateUserActivity,
    softDeleteUserActivity,
    bulkInsertUserActivity,
    bulkUpdateUserActivity,
    deleteUserActivity,
    removeEmpty,
  });
}

module.exports = makeUserActivityController;
