const joi = require('joi');
exports.schemaKeys = joi.object({
  providerId: joi.string().regex(/^[0-9a-fA-F]{24}$/),
  from: joi.string().regex(/^[0-9a-fA-F]{24}$/),
  type: joi.string().regex(/^[0-9a-fA-F]{24}$/),
  appointmentId: joi.string().regex(/^[0-9a-fA-F]{24}$/),
  rating: joi.number(),
  review: joi.string().optional(),
  createdBy: joi.object(),
  updatedBy: joi.object(),
  isActive: joi.boolean().default(true),
  isDelete: joi.boolean().default(false),
  isDeleted: joi.boolean()
}).unknown(true);
exports.updateSchemaKeys = joi.object({
  providerId: joi.string().regex(/^[0-9a-fA-F]{24}$/),
  from: joi.string().regex(/^[0-9a-fA-F]{24}$/),
  type: joi.string().regex(/^[0-9a-fA-F]{24}$/),
  appointmentId: joi.string().regex(/^[0-9a-fA-F]{24}$/),
  rating: joi.number(),
  review: joi.string().optional(),
  createdBy: joi.object(),
  updatedBy: joi.object(),
  isActive: joi.boolean().default(true),
  isDelete: joi.boolean().default(false),
  isDeleted: joi.boolean()
}).unknown(true);
