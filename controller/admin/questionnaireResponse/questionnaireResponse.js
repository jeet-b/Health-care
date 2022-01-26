const message = require("../../../utils/messages");
const responseCode = require("../../../utils/responseCode");
const db = require("../../../config/db");
const QuestionnaireResponse = require("../../../model/questionnaireResponse")(
  db
);
const Questionnaire = require("../../../model/questionnaire")(db);
const Appointment = require("../../../model/appointment")(db);
const Role = require("../../../model/role")(db);
const _ = require("lodash");
let ObjectId = require("mongodb").ObjectId;
const { USER_ROLE } = require("../../../config/authConstant");

const aggregateQuestionniareResponse = async (
  serviceId,
  userId,
  appointmentId
) => {
  let aggregate = [
    {
      $match: {
        $and: [
          {
            serviceId: ObjectId(serviceId),
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
        from: "questionnaireResponse",
        let: { ids: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$questionId", "$$ids"] },
                  { $eq: ["$userId", ObjectId(userId)] },
                  {
                    $eq: ["$appointmentId", ObjectId(appointmentId)],
                  },
                ],
              },
            },
          },
          {
            $lookup: {
              from: "file",
              let: {
                answerImageIds: "$answerImageIds",
              },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $in: ["$_id", "$$answerImageIds"],
                    },
                  },
                },
                {
                  $project: {
                    name: 1,
                    type: 1,
                    uri: 1,
                  },
                },
              ],
              as: "answerImages",
            },
          },
          {
            $lookup: {
              from: "questionnaire",
              let: {
                questionId: "$questionId",
              },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $eq: ["$_id", "$$questionId"],
                    },
                  },
                },
                {
                  $project: {
                    question: 1,
                    answer: 1,
                  },
                },
              ],
              as: "question",
            },
          },
          {
            $unwind: {
              path: "$question",
            },
          },
          {
            $project: {
              answerIds: 1,
              // answerImageIds: 1,
              answerText: 1,
              question: 1,
              answerImages: 1,
            },
          },
        ],
        as: "questionnaireResponse",
      },
    },
    {
      $unwind: {
        path: "$questionnaireResponse",
      },
    },
    {
      $group: {
        _id: {
          section: "$sectionId",
        },
        title: { $first: "$title.name" },
        sequence: { $first: "$title.sequence" },
        subTitle: { $first: "$title.subTitle" },
        questionnaireResponse: { $push: "$questionnaireResponse" },
      },
    },
    {
      $sort: { sequence: 1 },
    },
  ];
  return aggregate;
};

const submitQuestionnaireResponse = async (data, id, i18n) => {
  try {
    appointmentData = await Appointment.findById(id);
    userId = appointmentData.patientId;
    serviceId = appointmentData.specialisationId;
    let resultData = _.map(data, async (doc) => {
      doc.appointmentId = id;
      doc.userId = userId;
      doc.serviceId = serviceId;
      let isExist = await QuestionnaireResponse.findOne({
        $and: [
          { appointmentId: id },
          { questionId: doc.questionId },
          { userId: userId },
        ],
      });
      if (isExist != null) {
        await QuestionnaireResponse.deleteOne({ _id: isExist._id });
      }
      const QuestionnaireResponseData = await QuestionnaireResponse.create(doc);
      return QuestionnaireResponseData;
    });
    resultData = await Promise.all(resultData);
    return message.successResponse(
      { "Content-Type": "application/json" },
      responseCode.success,
      resultData,
      i18n.t("questionnaireResponse.create")
    );
  } catch (error) {
    console.error("Error - submitQuestionnaireResponse", error);
    return message.failureResponse(
      { "Content-Type": "application/json" },
      responseCode.internalServerError,
      error.message
    );
  }
};

const getQuestionnaireResponse = async (req) => {
  try {
    serviceId = req.body.serviceId;
    appointmentId = req.body.appointmentId;
    let userId = req.body.patientId;
    let userRole = await Role.findById(req.user.roleIds[0]);
    let appointmentData = await Appointment.findById(appointmentId);
    if (userRole.code === USER_ROLE.Physician) {
      userId = appointmentData.patientId;
    }

    let aggregate, result;
    aggregate = await aggregateQuestionniareResponse(
      serviceId,
      userId,
      appointmentId
    );
    result = await Questionnaire.aggregate(aggregate);
    if (
      result.length === 0 &&
      appointmentData.isFollowUp &&
      appointmentData.parentAppointmentId != undefined
    ) {
      aggregate = await aggregateQuestionniareResponse(
        serviceId,
        userId,
        appointmentData.parentAppointmentId
      );
      result = await Questionnaire.aggregate(aggregate);
    }
    return message.successResponse(
      { "Content-Type": "application/json" },
      responseCode.success,
      result,
      req.i18n.t("questionnaireResponse.find")
    );
  } catch (error) {
    console.error("Error - getQuestionnaireResponse", error);
    return message.failureResponse(
      { "Content-Type": "application/json" },
      responseCode.internalServerError,
      error.message
    );
  }
};

module.exports = {
  submitQuestionnaireResponse,
  getQuestionnaireResponse,
};
