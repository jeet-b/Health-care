const message = require("../../../utils/messages");
const responseCode = require("../../../utils/responseCode");
const _ = require("lodash");
const db = require("../../../config/db");
const Master = require("../../../model/master")(db);

function makeMasterController({ masterService, makeMaster }) {
  const addMaster = async ({ data }) => {
    try {
      const originalData = data;

      const master = makeMaster(originalData, "insertMasterValidator");
      let createdMaster = await masterService.createDocument(master);

      return message.successResponse(
        { "Content-Type": "application/json" },
        responseCode.success,
        createdMaster
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
  const findAllMaster = async ({ data }, i18n) => {
    try {
      let options = {};
      let query = {};
      let result;
      if (data.isCountOnly) {
        if (data.query !== undefined) {
          query = { ...data.query };
        }
        if (query.isActive === undefined) {
          query.isActive = true;
        }
        result = await masterService.countDocument(query);
        if (result) {
          result = { totalRecords: result };
        } else {
          return message.recordNotFound(
            { "Content-Type": "application/json" },
            responseCode.success,
            [],
            i18n.t("response_message.recordNotFound")
          );
        }
      } else {
        if (data.options !== undefined) {
          options = { ...data.options };
        }
        if (options.populate) {
          delete options.populate;
        }
        if (data.query !== undefined) {
          query = { ...data.query };
        }
        if (
          data.query.code !== undefined &&
          data.all !== undefined &&
          data.all === true
        ) {
          result = await Master.aggregate([
            { $match: { code: data.query.code } },
            {
              $lookup: {
                from: "master",
                let: { id: "$_id" },
                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $and: [
                          { $eq: ["$parentId", "$$id"] },
                          { $eq: ["$isActive", true] },
                          { $eq: ["$isDeleted", false] },
                        ],
                      },
                    },
                  },
                ],
                as: "subMasters",
              },
            },
          ]);
        } else {
          result = await masterService.getAllDocuments(query, options);
        }
      }

      if (result) {
        return message.successResponse(
          { "Content-Type": "application/json" },
          responseCode.success,
          result,
          i18n.t("master.findAll")
        );
      } else {
        return message.badRequest(
          { "Content-Type": "application/json" },
          responseCode.badRequest,
          {},
          i18n.t("response_message.badRequest")
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
  const getMasterById = async (id) => {
    try {
      if (id) {
        const master = await masterService.getSingleDocumentById(id);
        return message.successResponse(
          { "Content-Type": "application/json" },
          responseCode.success,
          master
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
  const getMasterCount = async (data) => {
    try {
      let where = {};
      if (data.where) {
        where = data.where;
      }
      let result = await masterService.countDocument(where);
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
  const getMasterByAggregate = async ({ data }) => {
    try {
      if (data) {
        let result = await masterService.getDocumentByAggregation(data);
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
  const updateMaster = async (data, id) => {
    try {
      if (id && data) {
        const master = makeMaster(data, "updateMasterValidator");
        const filterData = removeEmpty(master);
        let updatedMaster = await masterService.findOneAndUpdateDocument(
          { _id: id },
          filterData,
          { new: true }
        );
        return message.successResponse(
          { "Content-Type": "application/json" },
          responseCode.success,
          updatedMaster
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
  const softDeleteMaster = async (id) => {
    try {
      const deleteDependentService = require("../../../utils/deleteDependent");
      let pos = [
        {
          model: "appointmentSummary",
          refId: "diagnosis",
        },
        {
          model: "appointmentSummary",
          refId: "allergies",
        },
        {
          model: "appointmentSummary",
          refId: "referTo",
        },
        {
          model: "notification",
          refId: "type",
        },
        {
          model: "appointment",
          refId: "appointmentType",
        },
        {
          model: "appointment",
          refId: "callMode",
        },
        {
          model: "ratingReview",
          refId: "type",
        },
        {
          model: "transaction",
          refId: "transactionType",
        },
        {
          model: "transaction",
          refId: "chargeType",
        },
        {
          model: "providerSlot",
          refId: "type",
        },
        {
          model: "master",
          refId: "parentId",
        },
        {
          model: "user",
          refId: "genderId",
        },
        {
          model: "user",
          refId: "languageIds",
        },
        {
          model: "user",
          refId: "hearAboutUs",
        },
        {
          model: "user",
          refId: "deactivationReason",
        },
      ];
      await masterService.softDeleteDocument(id);
      let result = await deleteDependentService.softDeleteMaster({ _id: id });
      return message.successResponse(
        { "Content-Type": "application/json" },
        responseCode.success,
        result
      );
    } catch (error) {
      return message.failureResponse(
        { "Content-Type": "application/json" },
        responseCode.internalServerError,
        error.message
      );
    }
  };
  const bulkInsertMaster = async ({ body }) => {
    try {
      let data = body.data;
      const masterEntities = body.data.map((item) =>
        makeMaster(item, "insertMasterValidator")
      );
      const results = await masterService.bulkInsert(masterEntities);
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
  const bulkUpdateMaster = async (data) => {
    try {
      if (data.filter && data.data) {
        const master = makeMaster(data.data, "updateMasterValidator");
        const filterData = removeEmpty(master);
        const updatedMasters = await masterService.bulkUpdate(
          data.filter,
          filterData
        );
        return message.successResponse(
          { "Content-Type": "application/json" },
          responseCode.success,
          updatedMasters
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
  const deleteMaster = async (data, id) => {
    try {
      let possibleDependent = [
        {
          model: "appointmentSummary",
          refId: "diagnosis",
        },
        {
          model: "appointmentSummary",
          refId: "allergies",
        },
        {
          model: "appointmentSummary",
          refId: "referTo",
        },
        {
          model: "notification",
          refId: "type",
        },
        {
          model: "appointment",
          refId: "appointmentType",
        },
        {
          model: "appointment",
          refId: "callMode",
        },
        {
          model: "ratingReview",
          refId: "type",
        },
        {
          model: "transaction",
          refId: "transactionType",
        },
        {
          model: "transaction",
          refId: "chargeType",
        },
        {
          model: "providerSlot",
          refId: "type",
        },
        {
          model: "master",
          refId: "parentId",
        },
        {
          model: "user",
          refId: "genderId",
        },
        {
          model: "user",
          refId: "languageIds",
        },
        {
          model: "user",
          refId: "hearAboutUs",
        },
        {
          model: "user",
          refId: "deactivationReason",
        },
      ];
      const deleteDependentService = require("../../../utils/deleteDependent");
      if (data.isWarning) {
        let all = await deleteDependentService.countMaster({ _id: id });
        return message.successResponse(
          { "Content-Type": "application/json" },
          responseCode.success,
          all
        );
      } else {
        let result = await deleteDependentService.deleteMaster({ _id: id });
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

  const removeEmpty = (obj) => {
    let newObj = {};
    Object.keys(obj).forEach((key) => {
      if (obj[key] === Object(obj[key])) newObj[key] = removeEmpty(obj[key]);
      else if (obj[key] !== undefined) newObj[key] = obj[key];
    });
    return newObj;
  };
  return Object.freeze({
    addMaster,
    findAllMaster,
    getMasterById,
    getMasterCount,
    getMasterByAggregate,
    updateMaster,
    softDeleteMaster,
    bulkInsertMaster,
    bulkUpdateMaster,
    deleteMaster,
    removeEmpty,
  });
}

module.exports = makeMasterController;
