const db = require('../../../config/db');
const treatmentModel = require('../../../model/treatment')(db);
const {
    schemaKeys, updateSchemaKeys
} = require('../../../validation/treatmentValidation');
const insertTreatmentValidator = require('../../../validation/genericValidator')(schemaKeys);
const updateTreatmentValidator = require('../../../validation/genericValidator')(updateSchemaKeys);

const makeTreatment = require('../../../entity/treatment')({
    insertTreatmentValidator,
    updateTreatmentValidator
});

const treatmentService = require('../../../services/mongoDbService')({
    model: treatmentModel,
    makeTreatment
});
const makeTreatmentController = require('./treatment');

const authService = require('../../../services/auth')({
    model: treatmentModel,
    treatmentService
});
const treatmentController = makeTreatmentController({
    treatmentService,
    makeTreatment,
    authService
});
module.exports = treatmentController;
