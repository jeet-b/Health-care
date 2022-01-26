const db = require('../../../config/db');
const educationContentModel = require('../../../model/educationContent')(db);
const {
  schemaKeys,updateSchemaKeys
} = require('../../../validation/educationContentValidation');
const insertEducationContentValidator = require('../../../validation/genericValidator')(schemaKeys);
const updateEducationContentValidator = require('../../../validation/genericValidator')(updateSchemaKeys);
const makeEducationContent = require('../../../entity/educationContent')({
  insertEducationContentValidator,
  updateEducationContentValidator
});
const educationContentService = require('../../../services/mongoDbService')({
  model:educationContentModel,
  makeEducationContent
});
const makeEducationContentController = require('./educationContent');

const educationContentController = makeEducationContentController({
  educationContentService,
  makeEducationContent
});
module.exports = educationContentController;
