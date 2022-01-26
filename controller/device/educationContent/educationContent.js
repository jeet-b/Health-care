const message = require("../../../utils/messages");
const responseCode = require("../../../utils/responseCode");
function makeEducationContentController({ educationContentService }) {
  const findAllEducationContent = async ({ data }, i18n) => {
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
        result = await educationContentService.countDocument(query);
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
        result = await educationContentService.getAllDocuments(query, options);
      }

      if (result) {
        return message.successResponse(
          { "Content-Type": "application/json" },
          responseCode.success,
          result,
          i18n.t("educationContent.findAll")
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
  const getEducationContentById = async (id, i18n) => {
    try {
      if (id) {
        const educationContent =
          await educationContentService.getSingleDocumentById(id);
        return message.successResponse(
          { "Content-Type": "application/json" },
          responseCode.success,
          educationContent,
          i18n.t("educationContent.find")
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
  const getEducationContentCount = async (data) => {
    try {
      let where = {};
      if (data.where) {
        where = data.where;
      }
      let result = await educationContentService.countDocument(where);
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
  const getEducationContentByAggregate = async ({ data }) => {
    try {
      if (data) {
        let result = await educationContentService.getDocumentByAggregation(
          data
        );
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
  return Object.freeze({
    findAllEducationContent,
    getEducationContentById,
    getEducationContentCount,
    getEducationContentByAggregate,
  });
}

module.exports = makeEducationContentController;
