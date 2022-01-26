const db = require('../../../config/db');
const appointmentModel = require('../../../model/appointment')(db);
const {
  schemaKeys,updateSchemaKeys
} = require('../../../validation/appointmentValidation');
const insertAppointmentValidator = require('../../../validation/genericValidator')(schemaKeys);
const updateAppointmentValidator = require('../../../validation/genericValidator')(updateSchemaKeys);
const makeAppointment = require('../../../entity/appointment')({
  insertAppointmentValidator,
  updateAppointmentValidator
});
const appointmentService = require('../../../services/mongoDbService')({
  model:appointmentModel,
  makeAppointment
});
const makeAppointmentController = require('./appointment');

const appointmentController = makeAppointmentController({
  appointmentService,
  makeAppointment
});
module.exports = appointmentController;
