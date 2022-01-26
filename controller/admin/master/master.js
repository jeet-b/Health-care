const message = require("../../../utils/messages");
const responseCode = require("../../../utils/responseCode");
const db = require("../../../config/db");
const Master = require("../../../model/master")(db);
function makeMasterController({ masterService, makeMaster }) {
  const addMaster = async ({ data }, i18n) => {
    try {
      let isExistCode = await masterService.getSingleDocumentByQuery({
        code: data.code,
        isDeleted: false,
      });
      let isExistName = await masterService.getSingleDocumentByQuery({
        name: data.name,
        isDeleted: false,
      });
      if (isExistCode) {
        return message.inValidParam(
          { "Content-Type": "application/json" },
          responseCode.validationError,
          {},
          data.code + " " + i18n.t("master.code_exist")
        );
      }
      if (isExistName) {
        return message.inValidParam(
          { "Content-Type": "application/json" },
          responseCode.validationError,
          {},
          data.name + " " + i18n.t("master.name_exist")
        );
      }
      const originalData = data;

      const master = makeMaster(originalData, "insertMasterValidator");
      let createdMaster = await masterService.createDocument(master);

      return message.successResponse(
        { "Content-Type": "application/json" },
        responseCode.success,
        createdMaster,
        i18n.t("master.admin_create")
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
        if (data.query !== undefined) {
          query = { ...data.query };
        }
        if (
          data.query.code !== undefined &&
          data.all !== undefined &&
          data.all === true
        ) {
          result = await Master.aggregate([
            {
              $lookup: {
                from: "master",
                localField: "_id",
                foreignField: "parentId",
                as: "subMasters",
              },
            },
            {
              $match: {
                code: data.query.code,
                subMasters: { $exists: true, $not: { $size: 0 } },
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
  const getMasterById = async (id, i18n) => {
    try {
      if (id) {
        const master = await masterService.getSingleDocumentById(id);
        return message.successResponse(
          { "Content-Type": "application/json" },
          responseCode.success,
          master,
          i18n.t("master.get")
        );
      }
      return message.badRequest(
        { "Content-Type": "application/json" },
        responseCode.badRequest,
        {},
        i18n.t("response_message.badRequest")
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
  const updateMaster = async (data, id, i18n) => {
    try {
      if (id && data) {
        if (data.code) {
          let isExistCode = await masterService.getSingleDocumentByQuery({
            code: data.code,
            isDeleted: false,
          });
          if (isExistCode) {
            return message.inValidParam(
              { "Content-Type": "application/json" },
              responseCode.validationError,
              {},
              data.code + " " + i18n.t("master.code_exist")
            );
          }
        }
        if (data.name) {
          let isExistName = await masterService.getSingleDocumentByQuery({
            name: data.name,
            isDeleted: false,
          });
          if (isExistName) {
            return message.inValidParam(
              { "Content-Type": "application/json" },
              responseCode.validationError,
              {},
              data.name + " " + i18n.t("master.name_exist")
            );
          }
        }
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
          updatedMaster,
          i18n.t("master.admin_update")
        );
      }
      return message.badRequest(
        { "Content-Type": "application/json" },
        responseCode.badRequest,
        {},
        i18n.t("response_message.badRequest")
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
  const softDeleteMaster = async ({req}) => {
    try {
      let id = req.pathParams.id
      // const deleteDependentService = require('../../../utils/deleteDependent');
      // let pos = [
      //   {
      //     model: 'appointmentSummary',
      //     refId: 'diagnosis'
      //   },
      //   {
      //     model: 'appointmentSummary',
      //     refId: 'allergies'
      //   },
      //   {
      //     model: 'appointmentSummary',
      //     refId: 'referTo'
      //   },
      //   {
      //     model: 'notification',
      //     refId: 'type'
      //   },
      //   {
      //     model: 'appointment',
      //     refId: 'appointmentType'
      //   },
      //   {
      //     model: 'appointment',
      //     refId: 'callMode'
      //   },
      //   {
      //     model: 'ratingReview',
      //     refId: 'type'
      //   },
      //   {
      //     model: 'transaction',
      //     refId: 'transactionType'
      //   },
      //   {
      //     model: 'transaction',
      //     refId: 'chargeType'
      //   },
      //   {
      //     model: 'providerSlot',
      //     refId: 'type'
      //   },
      //   {
      //     model: 'master',
      //     refId: 'parentId'
      //   },
      //   {
      //     model: 'user',
      //     refId: 'genderId'
      //   },
      //   {
      //     model: 'user',
      //     refId: 'languageIds'
      //   },
      //   {
      //     model: 'user',
      //     refId: 'hearAboutUs'
      //   },
      //   {
      //     model: 'user',
      //     refId: 'deactivationReason'
      //   }
      // ];
      await masterService.softDeleteDocument(id);
      result = "Deleted";
      // let result = await deleteDependentService.softDeleteMaster({ _id: id });
      return message.successResponse(
        { "Content-Type": "application/json" },
        responseCode.success,
        result,
        req.i18n.t("master.admin_delete")
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
