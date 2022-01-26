const db = require('../../../config/db');
const appointmentSummaryModel = require('../../../model/appointmentSummary')(db);
const {
  schemaKeys,updateSchemaKeys
} = require('../../../validation/appointmentSummaryValidation');
const insertAppointmentSummaryValidator = require('../../../validation/genericValidator')(schemaKeys);
const updateAppointmentSummaryValidator = require('../../../validation/genericValidator')(updateSchemaKeys);
const makeAppointmentSummary = require('../../../entity/appointmentSummary')({
  insertAppointmentSummaryValidator,
  updateAppointmentSummaryValidator
});
const appointmentSummaryService = require('../../../services/mongoDbService')({
  model:appointmentSummaryModel,
  makeAppointmentSummary
});
const makeAppointmentSummaryController = require('./appointmentSummary');

const appointmentSummaryController = makeAppointmentSummaryController({
  appointmentSummaryService,
  makeAppointmentSummary
});
module.exports = appointmentSummaryController;
