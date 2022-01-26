const joi = require('joi');
exports.schemaKeys = joi.object({
  title: joi.string(),
  description: joi.string(),
  files: joi.array(),
  createdBy: joi.object(),
  updatedBy: joi.object(),
  deletedBy: joi.object(),
  isActive: joi.boolean(),
  isDeleted: joi.boolean()
}).unknown(true);
exports.updateSchemaKeys = joi.object({
  title: joi.string(),
  description: joi.string(),
  files: joi.array(),
  createdBy: joi.object(),
  updatedBy: joi.object(),
  deletedBy: joi.object(),
  isActive: joi.boolean(),
  isDeleted: joi.boolean()
}).unknown(true);
