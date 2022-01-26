const joi = require('joi');
exports.schemaKeys = joi.object({
  addressLine1: joi.string(),
  addressLine2: joi.string(),
  countryId: joi.string().regex(/^[0-9a-fA-F]{24}$/),
  cityId: joi.string().regex(/^[0-9a-fA-F]{24}$/),
  provinceId: joi.string().regex(/^[0-9a-fA-F]{24}$/),
  postalCodeId: joi.string().regex(/^[0-9a-fA-F]{24}$/),
  isActive: joi.boolean().default(true),
  isDelete: joi.boolean().default(false),
  isDeleted: joi.boolean()
}).unknown(true);
exports.updateSchemaKeys = joi.object({
  addressLine1: joi.string(),
  addressLine2: joi.string(),
  countryId: joi.string().regex(/^[0-9a-fA-F]{24}$/),
  cityId: joi.string().regex(/^[0-9a-fA-F]{24}$/),
  provinceId: joi.string().regex(/^[0-9a-fA-F]{24}$/),
  postalCodeId: joi.string().regex(/^[0-9a-fA-F]{24}$/),
  isActive: joi.boolean().default(true),
  isDelete: joi.boolean().default(false),
  isDeleted: joi.boolean()
}).unknown(true);
