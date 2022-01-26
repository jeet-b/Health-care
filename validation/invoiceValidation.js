const joi = require('joi');
exports.schemaKeys = joi.object({
  orderId: joi.string().regex(/^[0-9a-fA-F]{24}$/),
  transactionId: joi.string().regex(/^[0-9a-fA-F]{24}$/),
  appointmentId: joi.string().regex(/^[0-9a-fA-F]{24}$/),
  patientId: joi.string().regex(/^[0-9a-fA-F]{24}$/),
  providerId: joi.string().regex(/^[0-9a-fA-F]{24}$/),
  totalAmount: joi.number().integer(),
  createdBy: joi.object(),
  updatedBy: joi.object(),
  isActive: joi.boolean().default(true),
  isDelete: joi.boolean().default(false),
  isDeleted: joi.boolean()
}).unknown(true);
exports.updateSchemaKeys = joi.object({
  orderId: joi.string().regex(/^[0-9a-fA-F]{24}$/),
  transactionId: joi.string().regex(/^[0-9a-fA-F]{24}$/),
  appointmentId: joi.string().regex(/^[0-9a-fA-F]{24}$/),
  patientId: joi.string().regex(/^[0-9a-fA-F]{24}$/),
  providerId: joi.string().regex(/^[0-9a-fA-F]{24}$/),
  totalAmount: joi.number().integer(),
  createdBy: joi.object(),
  updatedBy: joi.object(),
  isActive: joi.boolean().default(true),
  isDelete: joi.boolean().default(false),
  isDeleted: joi.boolean()
}).unknown(true);
