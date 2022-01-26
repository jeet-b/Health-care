const db = require('../../../config/db');
const Questionnaire = require('../../../model/questionnaire')(db);
const {
  schemaKeys,updateSchemaKeys
} = require('../../../validation/questionnaireValidation');
const insertQuestionnaireValidator = require('../../../validation/genericValidator')(schemaKeys);
const updateQuestionnaireValidator = require('../../../validation/genericValidator')(updateSchemaKeys);
const makeQuestionnaire = require('../../../entity/questionnaire')({
  insertQuestionnaireValidator,
  updateQuestionnaireValidator
});
const questionnaireService = require('../../../services/mongoDbService')({
  model:Questionnaire,
  makeQuestionnaire
});
const makeQuestionnaireController = require('./questionnaire');

const questionnaireController = makeQuestionnaireController({
  questionnaireService,
  makeQuestionnaire
});
module.exports = questionnaireController;
