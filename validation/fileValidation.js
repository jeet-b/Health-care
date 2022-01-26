const joi = require('joi');
exports.schemaKeys = joi.object({
  name: joi.string().required(),
  type: joi.string(),
  slug: joi.string(),
  uri: joi.string(),
  mime_type: joi.string(),
  file_size: joi.string(),
  title: joi.string(),
  alt: joi.string(),
  link: joi.string(),
  width: joi.string(),
  height: joi.string(),
  status: joi.string(),
  viewType: joi.string(),
  createdBy: joi.object(),
  updatedBy: joi.object(),
  deletedBy: joi.object(),
  deletedAt: joi.date(),
  isActive: joi.boolean().default(true),
  isDelete: joi.boolean().default(false),
  isDeleted: joi.boolean()
}).unknown(true);
exports.updateSchemaKeys = joi.object({
  name: joi.string().when({
    is:joi.exist(),
    then:joi.required(),
    otherwise:joi.optional()
  }),
  type: joi.string(),
  slug: joi.string(),
  uri: joi.string(),
  mime_type: joi.string(),
  file_size: joi.string(),
  title: joi.string(),
  alt: joi.string(),
  link: joi.string(),
  width: joi.string(),
  height: joi.string(),
  status: joi.string(),
  viewType: joi.string(),
  createdBy: joi.object(),
  updatedBy: joi.object(),
  deletedBy: joi.object(),
  deletedAt: joi.date(),
  isActive: joi.boolean().default(true),
  isDelete: joi.boolean().default(false),
  isDeleted: joi.boolean()
}).unknown(true);
