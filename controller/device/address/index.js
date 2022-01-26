const db = require('../../../config/db');
const addressModel = require('../../../model/address')(db);
const {
  schemaKeys,updateSchemaKeys
} = require('../../../validation/addressValidation');
const insertAddressValidator = require('../../../validation/genericValidator')(schemaKeys);
const updateAddressValidator = require('../../../validation/genericValidator')(updateSchemaKeys);
const makeAddress = require('../../../entity/address')({
  insertAddressValidator,
  updateAddressValidator
});
const addressService = require('../../../services/mongoDbService')({
  model:addressModel,
  makeAddress
});
const makeAddressController = require('./address');

const addressController = makeAddressController({
  addressService,
  makeAddress
});
module.exports = addressController;
