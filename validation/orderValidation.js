const joi = require('joi');
exports.schemaKeys = joi.object({
  status: joi.string(),
  penalty: joi.number(),
  transactionId: joi.string().regex(/^[0-9a-fA-F]{24}$/),
  specialisationId: joi.string().regex(/^[0-9a-fA-F]{24}$/),
  patientId: joi.string().regex(/^[0-9a-fA-F]{24}$/),
  providerId: joi.string().regex(/^[0-9a-fA-F]{24}$/),
  appointmentId: joi.string().regex(/^[0-9a-fA-F]{24}$/),
  subTotal: joi.number(),
  taxAmount: joi.number(),
  total: joi.number(),
  createdBy: joi.object(),
  updatedBy: joi.object(),
  statusHistory: joi.object({
    Date:joi.date(),
    reason:joi.string(),
    status:joi.string()
  }),
  isActive: joi.boolean().default(true),
  isDelete: joi.boolean().default(false),
  isDeleted: joi.boolean()
}).unknown(true);
exports.updateSchemaKeys = joi.object({
  status: joi.string(),
  penalty: joi.number(),
  transactionId: joi.string().regex(/^[0-9a-fA-F]{24}$/),
  specialisationId: joi.string().regex(/^[0-9a-fA-F]{24}$/),
  patientId: joi.string().regex(/^[0-9a-fA-F]{24}$/),
  providerId: joi.string().regex(/^[0-9a-fA-F]{24}$/),
  appointmentId: joi.string().regex(/^[0-9a-fA-F]{24}$/),
  subTotal: joi.number(),
  taxAmount: joi.number(),
  total: joi.number(),
  createdBy: joi.object(),
  updatedBy: joi.object(),
  statusHistory: joi.object({
    Date:joi.date(),
    reason:joi.string(),
    status:joi.string()
  }),
  isActive: joi.boolean().default(true),
  isDelete: joi.boolean().default(false),
  isDeleted: joi.boolean()
}).unknown(true);
