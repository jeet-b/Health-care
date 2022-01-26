const joi = require('joi');
exports.schemaKeys = joi.object({
  fromId: joi.string().regex(/^[0-9a-fA-F]{24}$/),
  toId: joi.string().regex(/^[0-9a-fA-F]{24}$/),
  file: joi.allow(),
  content: joi.string(),
  isActive: joi.boolean(),
  isDeleted: joi.boolean()
}).unknown(true);
exports.updateSchemaKeys = joi.object({
  fromId: joi.string().regex(/^[0-9a-fA-F]{24}$/),
  toId: joi.string().regex(/^[0-9a-fA-F]{24}$/),
  file: joi.allow(),
  content: joi.string(),
  isActive: joi.boolean(),
  isDeleted: joi.boolean()
}).unknown(true);
