const message = require("../../../utils/messages");
const responseCode = require("../../../utils/responseCode");
const db = require("../../../config/db");
const Specialisation = require("../../../model/specialisation")(db);
const User = require("../../../model/user")(db);
const Role = require("../../../model/role")(db);
const { emailQueue } = require("../../../services/email/emailService");
const {
  USER_ROLE,
  COUNTRYCODE,
  EMAIL_SUBJECT,
  EMAIL_CONTENT,
  SMS_MESSAGE,
  NOTIFICATION_TITLE
} = require("../../../config/authConstant");
const { NOTIFICATION_MESSAGE } = require("../../../config/message");
const notificationService = require("../../../services/notification");
const { NOTIFICATION } = require("../../../config/constant/notification");
const ejs = require("ejs");
const path = require("path");
const _ = require("lodash");
const { find } = require("lodash");
function makeSpecialisationController({
  specialisationService,
  makeSpecialisation,
}) {
  const addSpecialisation = async ({ data }, i18n) => {
    try {
      let isExistName = await specialisationService.getSingleDocumentByQuery({
        name: data.name,
        isDeleted: false,
      });
      if (isExistName) {
        return message.inValidParam(
          { "Content-Type": "application/json" },
          responseCode.validationError,
          {},
          data.name + " " + i18n.t("specialisation.name_exist")
        );
      }
      if (data.file == undefined) {
        throw new Error(i18n.t("specialisation.image"));
      }
      const originalData = data;

      const specialisation = makeSpecialisation(
        originalData,
        "insertSpecialisationValidator"
      );
      let createdSpecialisation = await specialisationService.createDocument(
        specialisation
      );
      if (createdSpecialisation) {
        const roleCodes = await Role.find({
          code: USER_ROLE.Physician,
        });
        let allProviders = await User.find({
          roleIds: roleCodes[0]._id,
          isActive: true,
          isApproved: true,
          emailVerified: true,
          phoneVerified: true,
        });
        await Promise.all(
          _.map(allProviders, async (doc) => {
            let htmlData = await ejs.renderFile(
              path.join(__dirname, "../../../views/emailTemplate/email.ejs"),
              {
                user_name: doc.name,
                content: NOTIFICATION_MESSAGE.SERVICE_ADDED(),
              }
            );
            emailQueue(doc.email, EMAIL_SUBJECT.SERVICE_ADDED, htmlData);
            notificationService.pushNotificationQueue(
              doc._id,
              NOTIFICATION_TITLE.SERVICE_ADDED,
              NOTIFICATION_MESSAGE.SERVICE_ADDED(),
              NOTIFICATION.ACTIONS["SERVICE_ADDED"],
            );
          })
        );
      }

      return message.successResponse(
        { "Content-Type": "application/json" },
        responseCode.success,
        createdSpecialisation, 
        i18n.t("specialisation.create")
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
  const findAllSpecialisation = async ({ data }, i18n) => {
    try {
      let options = {};
      let query = {};
      let result;
      if (data.isCountOnly) {
        if (data.query !== undefined) {
          query = { ...data.query };
        }
        result = await specialisationService.countDocument(query);
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
        result = await specialisationService.getAllDocuments(query, options);
      }

      if (result) {
        return message.successResponse(
          { "Content-Type": "application/json" },
          responseCode.success,
          result, 
          i18n.t("specialisation.findAll")
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
  const getSpecialisationById = async (id, i18n) => {
    try {
      if (id) {
        const specialisation = await Specialisation.findById(id).populate(
          "file"
        );
        return message.successResponse(
          { "Content-Type": "application/json" },
          responseCode.success,
          specialisation,
          i18n.t("specialisation.get")
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
  const getSpecialisationCount = async (data) => {
    try {
      let where = {};
      if (data.where) {
        where = data.where;
      }
      let result = await specialisationService.countDocument(where);
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
  const getSpecialisationByAggregate = async ({ data }) => {
    try {
      if (data) {
        let result = await specialisationService.getDocumentByAggregation(data);
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
  const updateSpecialisation = async (data, id, i18n) => {
    try {
      if (id && data) {
        const specialisation = makeSpecialisation(
          data,
          "updateSpecialisationValidator"
        );
        const filterData = removeEmpty(specialisation);
        // const filterData = specialisation;
        let updatedSpecialisation =
          await specialisationService.findOneAndUpdateDocument(
            { _id: id },
            filterData,
            { new: true }
          );
        if (updatedSpecialisation) {
          const roleCodes = await Role.find({
            code: USER_ROLE.Physician,
          });
          let allProviders = await User.find({
            roleIds: roleCodes[0]._id,
            specialisations: updatedSpecialisation._id,
            isActive: true,
            isApproved: true,
            emailVerified: true,
            phoneVerified: true,
          });
          await Promise.all(
            _.map(allProviders, async (doc) => {
              let htmlData = await ejs.renderFile(
                path.join(__dirname, "../../../views/emailTemplate/email.ejs"),
                {
                  user_name: doc.name,
                  content: NOTIFICATION_MESSAGE.SERVICE_UPDATED(),
                }
              );
              emailQueue(doc.email, EMAIL_SUBJECT.SERVICE_UPDATED, htmlData);
              notificationService.pushNotificationQueue(
                doc._id,
                NOTIFICATION_TITLE.SERVICE_UPDATED,
                NOTIFICATION_MESSAGE.SERVICE_UPDATED(),
                NOTIFICATION.ACTIONS["SERVICE_UPDATED"],
              );
            })
          );
        }
        if(data.isActive){
          return message.successResponse(
            { "Content-Type": "application/json" },
            responseCode.success,
            updatedSpecialisation,
            i18n.t("specialisation.activate")
          );
        } else if(data.isActive === false){
          return message.successResponse(
            { "Content-Type": "application/json" },
            responseCode.success,
            updatedSpecialisation,
            i18n.t("specialisation.deactivate")
          );
        }
        return message.successResponse(
          { "Content-Type": "application/json" },
          responseCode.success,
          updatedSpecialisation,
          i18n.t("specialisation.update")
        );
      }
      return message.badRequest(
        { "Content-Type": "application/json" },
        responseCode.badRequest,
        {},
        i18n.t("response_message.badRequest")
      );
    } catch (error) {
      console.error("Error - updateSpecialisation Admin", error)
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
  const softDeleteSpecialisation = async ({req}) => {
    try {
      let id = req.pathParams.id
      // const deleteDependentService = require("../../../utils/deleteDependent");
      // let pos = [
      //   {
      //     model: "form",
      //     refId: "specialisationIds",
      //   },
      //   {
      //     model: "appointment",
      //     refId: "specialisationId",
      //   },
      //   {
      //     model: "user",
      //     refId: "specialisations",
      //   },
      // ];
      await specialisationService.softDeleteDocument(id);
      // let result = await deleteDependentService.softDeleteSpecialisation({
      //   _id: id,
      // });
      result = "Deleted";
      return message.successResponse(
        { "Content-Type": "application/json" },
        responseCode.success,
        result,
        req.i18n.t("specialisation.delete")
      );
    } catch (error) {
      return message.failureResponse(
        { "Content-Type": "application/json" },
        responseCode.internalServerError,
        error.message
      );
    }
  };
  const bulkInsertSpecialisation = async ({ body }) => {
    try {
      let data = body.data;
      const specialisationEntities = body.data.map((item) =>
        makeSpecialisation(item, "insertSpecialisationValidator")
      );
      const results = await specialisationService.bulkInsert(
        specialisationEntities
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
  const bulkUpdateSpecialisation = async (data) => {
    try {
      if (data.filter && data.data) {
        const specialisation = makeSpecialisation(
          data.data,
          "updateSpecialisationValidator"
        );
        const filterData = removeEmpty(specialisation);
        const updatedSpecialisations = await specialisationService.bulkUpdate(
          data.filter,
          filterData
        );
        return message.successResponse(
          { "Content-Type": "application/json" },
          responseCode.success,
          updatedSpecialisations
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
  const deleteSpecialisation = async (data, id) => {
    try {
      let possibleDependent = [
        {
          model: "form",
          refId: "specialisationIds",
        },
        {
          model: "appointment",
          refId: "specialisationId",
        },
        {
          model: "user",
          refId: "specialisations",
        },
      ];
      const deleteDependentService = require("../../../utils/deleteDependent");
      if (data.isWarning) {
        let all = await deleteDependentService.countSpecialisation({ _id: id });
        return message.successResponse(
          { "Content-Type": "application/json" },
          responseCode.success,
          all
        );
      } else {
        let result = await deleteDependentService.deleteSpecialisation({
          _id: id,
        });
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
    addSpecialisation,
    findAllSpecialisation,
    getSpecialisationById,
    getSpecialisationCount,
    getSpecialisationByAggregate,
    updateSpecialisation,
    softDeleteSpecialisation,
    bulkInsertSpecialisation,
    bulkUpdateSpecialisation,
    deleteSpecialisation,
    removeEmpty,
  });
}

module.exports = makeSpecialisationController;
