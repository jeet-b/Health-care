const message = require("../../../utils/messages");
const responseCode = require("../../../utils/responseCode");
const db = require("../../../config/db");
const TreatmentModel = require("../../../model/treatment")(db);

function makeTreatmentController({ treatmentService, makeTreatment }) {
  const addTreatment = async ({ data }, i18n) => {
    try {
      let isExistName = await TreatmentModel.findOne({
        name: data.name,
        isDeleted: false,
      });
      if (isExistName) {
        return message.inValidParam(
          { "Content-Type": "application/json" },
          responseCode.validationError,
          {},
          data.name + " " + i18n.t("treatment.name_exist")
        );
      }
      const originalData = data;

      const Treatment = makeTreatment(originalData, "insertTreatmentValidator");
      let createdTreatment = await treatmentService.createDocument(Treatment);

      return message.successResponse(
        { "Content-Type": "application/json" },
        responseCode.success,
        createdTreatment,
        i18n.t("treatment.create")
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
  const bulkInsertTreatment = async ({ body }) => {
    try {
      let data = body.data;
      const userRoleEntities = body.data.map((item) =>
        makeTreatment(item, "insertTreatmentValidator")
      );
      const results = await treatmentService.bulkInsert(userRoleEntities);
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
  const findAllTreatment = async ({ data }) => {
    try {
      let options = {};
      let query = {};
      let result;
      if (data.isCountOnly) {
        if (data.query !== undefined) {
          query = { ...data.query };
        }
        result = await treatmentService.countDocument(query);
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
        result = await treatmentService.getAllDocuments(query, options);
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
  const getTreatmentById = async (id) => {
    try {
      if (id) {
        const Treatment = await TreatmentModel.findById(id).populate("images");
        return message.successResponse(
          { "Content-Type": "application/json" },
          responseCode.success,
          Treatment
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
  const updateTreatment = async (data, id, i18n) => {
    try {
      if (id && data) {
        const Treatment = data;
        // const filterData = removeEmpty(Treatment);
        let updatedTreatment = await treatmentService.findOneAndUpdateDocument(
          { _id: id },
          Treatment,
          { new: true }
        );
        if (data.isActive) {
          return message.successResponse(
            { "Content-Type": "application/json" },
            responseCode.success,
            updatedTreatment,
            i18n.t("treatment.activate")
          );
        } else if (data.isActive === false) {
          return message.successResponse(
            { "Content-Type": "application/json" },
            responseCode.success,
            updatedTreatment,
            i18n.t("treatment.deactivate")
          );
        }
        return message.successResponse(
          { "Content-Type": "application/json" },
          responseCode.success,
          updatedTreatment
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
  const softDeleteTreatment = async ({ req }) => {
    try {
      let id = req.pathParams.id;
      if (id) {
        let updatedTreatment = await treatmentService.softDeleteDocument(id);
        return message.successResponse(
          { "Content-Type": "application/json" },
          responseCode.success,
          updatedTreatment,
          req.i18n.t("treatment.delete")
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
  const getTreatmentByAggregate = async ({ data }) => {
    try {
      if (data) {
        let result = await treatmentService.getDocumentByAggregation(data);
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
  const getTreatmentCount = async (data) => {
    try {
      let where = {};
      if (data.where) {
        where = data.where;
      }
      let result = await treatmentService.countDocument(where);
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
  const bulkUpdateTreatment = async (data) => {
    try {
      if (data.filter && data.data) {
        const user = makeTreatment(data.data, "updateTreatmentValidator");
        const filterData = removeEmpty(user);
        const updatedTreatments = await treatmentService.bulkUpdate(
          data.filter,
          filterData
        );
        return message.successResponse(
          { "Content-Type": "application/json" },
          responseCode.success,
          updatedTreatments
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
  const upsertTreatment = async (data) => {
    try {
      if (data) {
        let result;
        if (data.id) {
          let where = data.id;
          const Treatment = makeTreatment(data, "updateTreatmentValidator");
          const filterData = removeEmpty(Treatment);
          result = await treatmentService.updateDocument(where, filterData);
        } else {
          const Treatment = makeTreatment(data, "insertTreatmentValidator");
          result = await treatmentService.createDocument(Treatment);
        }
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
    addTreatment,
    bulkInsertTreatment,
    findAllTreatment,
    getTreatmentById,
    updateTreatment,
    softDeleteTreatment,
    getTreatmentByAggregate,
    getTreatmentCount,
    bulkUpdateTreatment,
    upsertTreatment,
    removeEmpty,
  });
}

module.exports = makeTreatmentController;
