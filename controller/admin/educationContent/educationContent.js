const message = require("../../../utils/messages");
const responseCode = require("../../../utils/responseCode");
const db = require("../../../config/db");
const EducationContent = require("../../../model/educationContent")(db);

function makeEducationContentController({
  educationContentService,
  makeEducationContent,
}) {
  const addEducationContent = async ({ data }, i18n) => {
    try {
      const originalData = data;

      const educationContent = makeEducationContent(
        originalData,
        "insertEducationContentValidator"
      );
      let createdEducationContent =
        await educationContentService.createDocument(educationContent);

      return message.successResponse(
        { "Content-Type": "application/json" },
        responseCode.success,
        createdEducationContent,
        i18n.t("educationContent.create")
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
  const findAllEducationContent = async ({ data }, i18n) => {
    try {
      let options = {};
      let query = {};
      let result;
      if (data.isCountOnly) {
        if (data.query !== undefined) {
          query = { ...data.query };
        }
        result = await educationContentService.countDocument(query);
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
        const educationContent = await EducationContent.findOne({
          _id: id,
        }).populate(["files"]);
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
  const updateEducationContent = async (data, id, i18n) => {
    try {
      if (id && data) {
        let updatedEducationContent =
          await educationContentService.findOneAndUpdateDocument(
            { _id: id },
            data,
            { new: true }
          );
        return message.successResponse(
          { "Content-Type": "application/json" },
          responseCode.success,
          updatedEducationContent,
          i18n.t("educationContent.update")
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
  const softDeleteEducationContent = async (id) => {
    try {
      if (id) {
        let updatedEducationContent =
          await educationContentService.softDeleteDocument(id);
        return message.successResponse(
          { "Content-Type": "application/json" },
          responseCode.success,
          updatedEducationContent
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
  const bulkInsertEducationContent = async ({ body }) => {
    try {
      let data = body.data;
      const educationContentEntities = body.data.map((item) =>
        makeEducationContent(item, "insertEducationContentValidator")
      );
      const results = await educationContentService.bulkInsert(
        educationContentEntities
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
  const bulkUpdateEducationContent = async (data) => {
    try {
      if (data.filter && data.data) {
        const educationContent = makeEducationContent(
          data.data,
          "updateEducationContentValidator"
        );
        const filterData = removeEmpty(educationContent);
        const updatedEducationContents =
          await educationContentService.bulkUpdate(data.filter, filterData);
        return message.successResponse(
          { "Content-Type": "application/json" },
          responseCode.success,
          updatedEducationContents
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
  const deleteEducationContent = async (data, id) => {
    try {
      if (id) {
        let deletedEducationContent =
          await educationContentService.findOneAndDeleteDocument({ _id: id });
        return message.successResponse(
          { "Content-Type": "application/json" },
          responseCode.success,
          deletedEducationContent
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
    addEducationContent,
    findAllEducationContent,
    getEducationContentById,
    getEducationContentCount,
    getEducationContentByAggregate,
    updateEducationContent,
    softDeleteEducationContent,
    bulkInsertEducationContent,
    bulkUpdateEducationContent,
    deleteEducationContent,
    removeEmpty,
  });
}

module.exports = makeEducationContentController;
