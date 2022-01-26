const message = require("../../../utils/messages");
const responseCode = require("../../../utils/responseCode");
const db = require("../../../config/db");
const mongoose = require("mongoose");
let ObjectId = require("mongodb").ObjectId;

//IMPORTING MODELS
const Questionnaire = require("../../../model/questionnaire")(db);
const Appointments = require("../../../model/appointment")(db);
const Users = require("../../../model/user")(db);
const QuestionnaireResponse = require("../../../model/questionnaireResponse")(
    db
);
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
      console.error("Error Admin - getQuestionnaireByServiceId", error);
      return message.failureResponse(
        { "Content-Type": "application/json" },
        responseCode.internalServerError,
        error.message
      );
    }
  };
  
// const getAllQuestionnaires = async () => {
//     try {
//         let populatorQ = [
//             {
//                 path: "serviceId",
//                 select: "name description price isFree",
//                 populate: {
//                     path: "file",
//                     model: "file",
//                     select: "name type uri",
//                 },
//             },
//             {
//                 path: "subTitleId",
//                 select: "name code",
//             },
//             {
//                 path: "sectionId",
//                 select: "name code",
//             },
//             {
//                 path: "answer",
//                 populate: {
//                     path: "imageId",
//                     model: "file",
//                 },
//             },
//         ];

//         const questionnaires = await Questionnaire.find().populate(populatorQ);
//         return message.successResponse(
//             { "Content-Type": "application/json" },
//             responseCode.success,
//             questionnaires
//         );
//     } catch (error) {
//         console.error("Error - getAllQuestionnaires Admin", error);
//         return message.failureResponse(
//             { "Content-Type": "application/json" },
//             responseCode.internalServerError,
//             error.message
//         );
//     }
// };

const getPhotoGallery = async () => {
    try {
        let photosFromQuestionnaire = await QuestionnaireResponse.aggregate([
            {
                "$lookup": {
                    from: "appointment",
                    localField: "appointmentId",
                    foreignField: "_id",
                    as: "appointment",
                },
            },
            {
                "$match": {
                    "userId": mongoose.Types.ObjectId("611e49b12be8b0727faab4fb"),
                    "appointment.0": { $exists: true },
                    "answerImageIds.0": { $exists: true },
                }
            },
            { $unwind: '$answerImageIds' },
            { $unwind: "$appointment" },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    apId: { "$first": '$appointment.APID' },
                    answerImages: { $push: "$answerImageIds" },
                },
            },
            {
                "$lookup": {
                    from: "file",
                    localField: "answerImages",
                    foreignField: "_id",
                    as: "answerImages",
                },
            },
            {
                "$project": {
                    "_id": 1,
                    "apId": 1,
                    "totalImages": { "$size": "$answerImages" },
                    "answerImages": 1,
                },
            }
        ]).exec();

        return message.successResponse(
            { "Content-Type": "application/json" },
            responseCode.success,
            photosFromQuestionnaire
        );
    } catch (error) {
        console.error("Error - getPatientsByProviderId Admin", error);
        return message.failureResponse(
            { "Content-Type": "application/json" },
            responseCode.internalServerError,
            error.message
        );
    }
};



module.exports = {
    getQuestionnaireByServiceId,
    getPhotoGallery,
};
