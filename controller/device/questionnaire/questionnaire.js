const message = require("../../../utils/messages");
const responseCode = require("../../../utils/responseCode");
const db = require("../../../config/db");
const Questionnaire = require("../../../model/questionnaire")(db);
let ObjectId = require("mongodb").ObjectId;

const getQuestionnaireByServiceId = async (id, i18n) => {
  try {
    if (id) {
      let aggregate = [
        {
          $match: {
            $and: [
              {
                serviceId: ObjectId(id),
              },
              { isActive: true },
            ],
          },
        },
        {
          $lookup: {
            from: "section",
            localField: "sectionId",
            foreignField: "_id",
            as: "title",
          },
        },
        {
          $unwind: {
            path: "$title",
          },
        },
        {
          $lookup: {
            from: "questionnaire",
            let: { ids: "$_id" },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $eq: ["$_id", "$$ids"],
                  },
                },
              },
              {
                $project: {
                  sequence: 1,
                  optionsPerLine: 1,
                  question: 1,
                  answer: 1,
                },
              },
            ],

            as: "questionnaire",
          },
        },

        {
          $unwind: {
            path: "$questionnaire",
          },
        },

        {
          $group: {
            _id: {
              section: "$sectionId",
              page: "$page",
            },
            title: { $first: "$title.name" },
            sequence: { $first: "$title.sequence" },
            subTitle: { $first: "$title.subTitle" },
            questions: { $push: "$questionnaire" },
          },
        },
        {
          $sort: { sequence: 1 },
        },
      ];
      const questionnaire = await Questionnaire.aggregate(aggregate);
      return message.successResponse(
        { "Content-Type": "application/json" },
        responseCode.success,
        questionnaire,
        i18n.t("questionnaire.find")
      );
    }
    return message.badRequest(
      { "Content-Type": "application/json" },
      responseCode.badRequest,
      {},
      i18n.t("response_message.badRequest")
    );
  } catch (error) {
    console.error("Error - getQuestionnaireByServiceId", error);
    return message.failureResponse(
      { "Content-Type": "application/json" },
      responseCode.internalServerError,
      error.message
    );
  }
};

module.exports = {
  getQuestionnaireByServiceId,
};
