const joi = require('joi');
exports.schemaKeys = joi.object({
  dayOfWeek: joi.number().integer(),
  providerId: joi.string().regex(/^[0-9a-fA-F]{24}$/),
  type: joi.string(),
  duration: joi.array().items(),
  repeatUntil: joi.boolean().default(false),
  createdBy: joi.object(),
  updatedBy: joi.object(),
  isActive: joi.boolean().default(true),
  isDelete: joi.boolean().default(false),
  isDeleted: joi.boolean()
}).unknown(true);
exports.updateSchemaKeys = joi.object({
  dayOfWeek: joi.number().integer(),
  providerId: joi.string().regex(/^[0-9a-fA-F]{24}$/),
  type: joi.string(),
  durations: joi.array().items(),
  repeatUntil: joi.boolean().default(false),
  createdBy: joi.object(),
  updatedBy: joi.object(),
  isActive: joi.boolean().default(true),
  isDelete: joi.boolean().default(false),
  isDeleted: joi.boolean()
}).unknown(true);
