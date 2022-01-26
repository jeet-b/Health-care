const db = require("../../../config/db");
const User = require("../../../model/user")(db);
const RatingReview = require("../../../model/ratingReview")(db);
const Appointment = require("../../../model/appointment")(db);
var ObjectId = require("mongodb").ObjectId;
const message = require("../../../utils/messages");
const responseCode = require("../../../utils/responseCode");
const { NOTIFICATION_TITLE } = require("../../../config/authConstant");
const { NOTIFICATION_MESSAGE } = require("../../../config/message");
const notificationService = require("../../../services/notification");
function makeRatingReviewController({ ratingReviewService, makeRatingReview }) {
  const addRatingReview = async ({ data }, i18n) => {
    try {
      if (data.appointmentId !== undefined) {
        let appointmentData = await Appointment.findOne({
          _id: data.appointmentId,
        });
        if (appointmentData.isCancelled === true) {
          throw new Error(i18n.t("ratingReview.cancelled_error"));
        } else if (appointmentData.noShow === true) {
          throw new Error(i18n.t("ratingReview.noShow_error"));
        }
      }
      const originalData = data;
      let createdRatingReview = await ratingReviewService.createDocument(
        originalData
      );
      if (
        createdRatingReview.providerId !== null &&
        createdRatingReview.providerId !== undefined
      ) {
        let avgRating = await RatingReview.aggregate([
          {
            $match: {
              providerId: ObjectId(createdRatingReview.providerId),
              isActive: true,
              isDelete: false,
            },
          },
          {
            $group: {
              _id: "$providerId",
              avgRating: { $avg: "$rating" },
            },
          },
          {
            $project: {
              avgRating: { $round: ["$avgRating", 1] },
            },
          },
        ]);
        if (avgRating.length != 0) {
          await User.findOneAndUpdate(
            { _id: createdRatingReview.providerId },
            { averageRating: avgRating[0].avgRating }
          );
        }
        if (
          createdRatingReview.appointmentId != null ||
          createdRatingReview.appointmentId != undefined
        ) {
          let appointmentData = await Appointment.findOneAndUpdate(
            { _id: createdRatingReview.appointmentId },
            {
              ratingReviewId: createdRatingReview.id,
              rating: createdRatingReview.rating,
            },
            { new: true }
          ).populate(["patientId"]);
          await notificationService.create(
            appointmentData.providerId,
            NOTIFICATION_TITLE.PHYSICIAN_RATED,
            NOTIFICATION_MESSAGE.PHYSICIAN_RATED(
              appointmentData.patientId.name,
              appointmentData.APID
            )
          );
        }
      }
      return message.successResponse(
        { "Content-Type": "application/json" },
        responseCode.success,
        createdRatingReview,
        i18n.t("ratingReview.create")
      );
    } catch (error) {
      console.error("Error - addRatingReview", error);
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
  const findAllRatingReview = async ({ data }, i18n) => {
    try {
      let options = {};
      let query = {};
      let result;
      if (data.isCountOnly) {
        if (data.query !== undefined) {
          query = { ...data.query };
        }
        result = await ratingReviewService.countDocument(query);
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
        result = await ratingReviewService.getAllDocuments(query, options);
      }

      if (result) {
        return message.successResponse(
          { "Content-Type": "application/json" },
          responseCode.success,
          result,
          i18n.t("ratingReview.findAll")
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
      console.error("Error - findAllRatingReview", error);
      return message.failureResponse(
        { "Content-Type": "application/json" },
        responseCode.internalServerError,
        error.message
      );
    }
  };
  const getRatingReviewById = async (id, i18n) => {
    try {
      if (id) {
        const ratingReview = await ratingReviewService.getSingleDocumentById(
          id
        );
        return message.successResponse(
          { "Content-Type": "application/json" },
          responseCode.success,
          ratingReview,
          i18n.t("ratingReview.find")
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
  const getRatingReviewCount = async (data) => {
    try {
      let where = {};
      if (data.where) {
        where = data.where;
      }
      let result = await ratingReviewService.countDocument(where);
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
  const getRatingReviewByAggregate = async ({ data }) => {
    try {
      if (data) {
        let result = await ratingReviewService.getDocumentByAggregation(data);
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
  const updateRatingReview = async (data, id) => {
    try {
      if (id && data) {
        const ratingReview = makeRatingReview(
          data,
          "updateRatingReviewValidator"
        );
        const filterData = removeEmpty(ratingReview);
        let updatedRatingReview =
          await ratingReviewService.findOneAndUpdateDocument(
            { _id: id },
            filterData,
            { new: true }
          );
        return message.successResponse(
          { "Content-Type": "application/json" },
          responseCode.success,
          updatedRatingReview
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
  const softDeleteRatingReview = async (id) => {
    try {
      if (id) {
        let updatedRatingReview = await ratingReviewService.softDeleteDocument(
          id
        );
        return message.successResponse(
          { "Content-Type": "application/json" },
          responseCode.success,
          updatedRatingReview
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
  const bulkInsertRatingReview = async ({ body }) => {
    try {
      let data = body.data;
      const ratingReviewEntities = body.data.map((item) =>
        makeRatingReview(item, "insertRatingReviewValidator")
      );
      const results = await ratingReviewService.bulkInsert(
        ratingReviewEntities
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
  const bulkUpdateRatingReview = async (data) => {
    try {
      if (data.filter && data.data) {
        const ratingReview = makeRatingReview(
          data.data,
          "updateRatingReviewValidator"
        );
        const filterData = removeEmpty(ratingReview);
        const updatedRatingReviews = await ratingReviewService.bulkUpdate(
          data.filter,
          filterData
        );
        return message.successResponse(
          { "Content-Type": "application/json" },
          responseCode.success,
          updatedRatingReviews
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
  const deleteRatingReview = async (data, id) => {
    try {
      if (id) {
        let deletedRatingReview =
          await ratingReviewService.findOneAndDeleteDocument({ _id: id });
        return message.successResponse(
          { "Content-Type": "application/json" },
          responseCode.success,
          deletedRatingReview
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
    addRatingReview,
    findAllRatingReview,
    getRatingReviewById,
    getRatingReviewCount,
    getRatingReviewByAggregate,
    updateRatingReview,
    softDeleteRatingReview,
    bulkInsertRatingReview,
    bulkUpdateRatingReview,
    deleteRatingReview,
    removeEmpty,
  });
}

module.exports = makeRatingReviewController;
