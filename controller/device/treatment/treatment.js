const message = require("../../../utils/messages");
const responseCode = require("../../../utils/responseCode");
const db = require("../../../config/db");
const TreatmentModel = require("../../../model/treatment")(db);

function makeTreatmentController({ treatmentService, makeTreatment }) {
  const findAllTreatment = async ({ data }) => {
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
        if (query.isActive === undefined) {
          query.isActive = true;
          query.isDeleted = false;
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

  return Object.freeze({
    findAllTreatment,
    getTreatmentById,
  });
}

module.exports = makeTreatmentController;
