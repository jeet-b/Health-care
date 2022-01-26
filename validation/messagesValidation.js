const joi = require('joi');
exports.schemaKeys = joi.object({
  fromId: joi.string().regex(/^[0-9a-fA-F]{24}$/),
  seenAt: joi.date(),
  files: joi.string().regex(/^[0-9a-fA-F]{24}$/),
  createdBy: joi.object(),
  updatedBy: joi.object(),
  deletedBy: joi.object(),
  isActive: joi.boolean(),
  isDeleted: joi.boolean()
}).unknown(true);
exports.updateSchemaKeys = joi.object({
  fromId: joi.string().regex(/^[0-9a-fA-F]{24}$/),
  seenAt: joi.date(),
  files: joi.string().regex(/^[0-9a-fA-F]{24}$/),
  createdBy: joi.object(),
  updatedBy: joi.object(),
  deletedBy: joi.object(),
  isActive: joi.boolean(),
  isDeleted: joi.boolean()
}).unknown(true);
