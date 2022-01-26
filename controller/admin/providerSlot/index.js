const db = require('../../../config/db');
const providerSlotModel = require('../../../model/providerSlot')(db);
const {
  schemaKeys,updateSchemaKeys
} = require('../../../validation/providerSlotValidation');
const insertProviderSlotValidator = require('../../../validation/genericValidator')(schemaKeys);
const updateProviderSlotValidator = require('../../../validation/genericValidator')(updateSchemaKeys);
const makeProviderSlot = require('../../../entity/providerSlot')({
  insertProviderSlotValidator,
  updateProviderSlotValidator
});
const providerSlotService = require('../../../services/mongoDbService')({
  model:providerSlotModel,
  makeProviderSlot
});
const makeProviderSlotController = require('./providerSlot');

const providerSlotController = makeProviderSlotController({
  providerSlotService,
  makeProviderSlot
});
module.exports = providerSlotController;
