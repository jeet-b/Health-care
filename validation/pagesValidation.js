const joi = require('joi');
exports.schemaKeys = joi.object({
  name: joi.string().required(),
  seoDetails: joi.array().items(),
  slug: joi.string().required(),
  createdBy: joi.object(),
  updatedBy: joi.object(),
  deletedBy: joi.object(),
  deletedAt: joi.date(),
  isActive: joi.boolean(),
  isDeleted: joi.boolean()
}).unknown(true);
exports.updateSchemaKeys = joi.object({
  name: joi.string().when({
    is:joi.exist(),
    then:joi.required(),
    otherwise:joi.optional()
  }),
  seoDetails: joi.array().items(),
  slug: joi.string().when({
    is:joi.exist(),
    then:joi.required(),
    otherwise:joi.optional()
  }),
  createdBy: joi.object(),
  updatedBy: joi.object(),
  deletedBy: joi.object(),
  deletedAt: joi.date(),
  isActive: joi.boolean(),
  isDeleted: joi.boolean()
}).unknown(true);
