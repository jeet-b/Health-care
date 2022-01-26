const db = require('../../../config/db');
const specialisationModel = require('../../../model/specialisation')(db);
const {
  schemaKeys,updateSchemaKeys
} = require('../../../validation/specialisationValidation');
const insertSpecialisationValidator = require('../../../validation/genericValidator')(schemaKeys);
const updateSpecialisationValidator = require('../../../validation/genericValidator')(updateSchemaKeys);
const makeSpecialisation = require('../../../entity/specialisation')({
  insertSpecialisationValidator,
  updateSpecialisationValidator
});
const specialisationService = require('../../../services/mongoDbService')({
  model:specialisationModel,
  makeSpecialisation
});
const makeSpecialisationController = require('./specialisation');

const specialisationController = makeSpecialisationController({
  specialisationService,
  makeSpecialisation
});
module.exports = specialisationController;
