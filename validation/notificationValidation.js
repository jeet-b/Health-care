const joi = require('joi');
exports.schemaKeys = joi.object({
  type: joi.string().regex(/^[0-9a-fA-F]{24}$/),
  title: joi.string(),
  content: joi.string(),
  sentBy: joi.object(),
  seenAt: joi.object(),
  receivedBy: joi.object(),
  createdBy: joi.object(),
  updatedBy: joi.object(),
  isActive: joi.boolean().default(true),
  isDelete: joi.boolean().default(false),
  isDeleted: joi.boolean()
}).unknown(true);
exports.updateSchemaKeys = joi.object({
  type: joi.string().regex(/^[0-9a-fA-F]{24}$/),
  title: joi.string(),
  content: joi.string(),
  sentBy: joi.object(),
  seenAt: joi.object(),
  receivedBy: joi.object(),
  createdBy: joi.object(),
  updatedBy: joi.object(),
  isActive: joi.boolean().default(true),
  isDelete: joi.boolean().default(false),
  isDeleted: joi.boolean()
}).unknown(true);
