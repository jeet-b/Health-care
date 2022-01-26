const joi = require('joi');
exports.schemaKeys = joi.object({
  userId: joi.string().regex(/^[0-9a-fA-F]{24}$/).required(),
  roleId: joi.string().regex(/^[0-9a-fA-F]{24}$/),
  isActive: joi.boolean(),
  isDeleted: joi.boolean()
}).unknown(true);
exports.updateSchemaKeys = joi.object({
  userId: joi.string().regex(/^[0-9a-fA-F]{24}$/).when({
    is:joi.exist(),
    then:joi.required(),
    otherwise:joi.optional()
  }),
  roleId: joi.string().regex(/^[0-9a-fA-F]{24}$/),
  isActive: joi.boolean(),
  isDeleted: joi.boolean()
}).unknown(true);
