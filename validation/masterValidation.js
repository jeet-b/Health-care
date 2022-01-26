const joi = require('joi');
exports.schemaKeys = joi.object({
  name: joi.string().required(),
  code: joi.string().required(),
  isActive: joi.boolean().default(true),
  fileId: joi.object(),
  parentId: joi.string().regex(/^[0-9a-fA-F]{24}$/),
  createdBy: joi.object(),
  updatedBy: joi.object(),
  deletedBy: joi.object(),
  deletedAt: joi.date(),
  isDelete: joi.boolean().default(false),
  isDeleted: joi.boolean()
}).unknown(true);
exports.updateSchemaKeys = joi.object({
  name: joi.string().when({
    is:joi.exist(),
    then:joi.required(),
    otherwise:joi.optional()
  }),
  code: joi.string().when({
    is:joi.exist(),
    then:joi.required(),
    otherwise:joi.optional()
  }),
  isActive: joi.boolean().default(true),
  fileId: joi.object(),
  parentId: joi.string().regex(/^[0-9a-fA-F]{24}$/),
  createdBy: joi.object(),
  updatedBy: joi.object(),
  deletedBy: joi.object(),
  deletedAt: joi.date(),
  isDelete: joi.boolean().default(false),
  isDeleted: joi.boolean()
}).unknown(true);
