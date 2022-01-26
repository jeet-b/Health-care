const joi = require('joi');
exports.schemaKeys = joi.object({
  postalCode: joi.string().required(),
  isDeliverable: joi.boolean().default(true),
  cityId: joi.string().regex(/^[0-9a-fA-F]{24}$/),
  isActive: joi.boolean().default(true),
  createdBy: joi.object(),
  updatedBy: joi.object(),
  deletedBy: joi.object(),
  deletedAt: joi.date(),
  isDelete: joi.boolean().default(false),
  isDeleted: joi.boolean()
}).unknown(true);
exports.updateSchemaKeys = joi.object({
  postalCode: joi.string().when({
    is:joi.exist(),
    then:joi.required(),
    otherwise:joi.optional()
  }),
  isDeliverable: joi.boolean().default(true),
  cityId: joi.string().regex(/^[0-9a-fA-F]{24}$/),
  isActive: joi.boolean().default(true),
  createdBy: joi.object(),
  updatedBy: joi.object(),
  deletedBy: joi.object(),
  deletedAt: joi.date(),
  isDelete: joi.boolean().default(false),
  isDeleted: joi.boolean()
}).unknown(true);
