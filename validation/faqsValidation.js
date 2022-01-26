const joi = require('joi');
exports.schemaKeys = joi.object({
  question: joi.string().required(),
  answer: joi.string().required(),
  sequence: joi.number().integer(),
  isActive: joi.boolean().default(true),
  isDelete: joi.boolean().default(false),
  createdBy: joi.object(),
  updatedBy: joi.object(),
  isDeleted: joi.boolean()
}).unknown(true);
exports.updateSchemaKeys = joi.object({
  question: joi.string().when({
    is:joi.exist(),
    then:joi.required(),
    otherwise:joi.optional()
  }),
  answer: joi.string().when({
    is:joi.exist(),
    then:joi.required(),
    otherwise:joi.optional()
  }),
  sequence: joi.number().integer(),
  isActive: joi.boolean().default(true),
  isDelete: joi.boolean().default(false),
  createdBy: joi.object(),
  updatedBy: joi.object(),
  isDeleted: joi.boolean()
}).unknown(true);
