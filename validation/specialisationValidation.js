const joi = require('joi');
exports.schemaKeys = joi.object({
  name: joi.string().required(),
  file: joi.string().regex(/^[0-9a-fA-F]{24}$/),
  description: joi.string(),
  isFree: joi.boolean().default(false),
  isComingSoon: joi.boolean(),
  isActive: joi.boolean().default(true),
  createdBy: joi.object(),
  updatedBy: joi.object(),
  price: joi.number(),
  isDelete: joi.boolean().default(false),
  isDeleted: joi.boolean()
}).unknown(true);
exports.updateSchemaKeys = joi.object({
  name: joi.string().when({
    is:joi.exist(),
    then:joi.required(),
    otherwise:joi.optional()
  }),
  file: joi.string().regex(/^[0-9a-fA-F]{24}$/),
  description: joi.string(),
  isComingSoon: joi.boolean(),
  isFree: joi.boolean().default(false),
  isActive: joi.boolean().default(true),
  createdBy: joi.object(),
  updatedBy: joi.object(),
  price: joi.number(),
  isDelete: joi.boolean().default(false),
  isDeleted: joi.boolean()
}).unknown(true);
