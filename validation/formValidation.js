const joi = require('joi');
exports.schemaKeys = joi.object({
  specialisationIds: joi.string().regex(/^[0-9a-fA-F]{24}$/),
  form: joi.string(),
  createdBy: joi.object(),
  updatedBy: joi.object(),
  isActive: joi.boolean().default(true),
  isDelete: joi.boolean().default(false),
  isDeleted: joi.boolean()
}).unknown(true);
exports.updateSchemaKeys = joi.object({
  specialisationIds: joi.string().regex(/^[0-9a-fA-F]{24}$/),
  form: joi.string(),
  createdBy: joi.object(),
  updatedBy: joi.object(),
  isActive: joi.boolean().default(true),
  isDelete: joi.boolean().default(false),
  isDeleted: joi.boolean()
}).unknown(true);
