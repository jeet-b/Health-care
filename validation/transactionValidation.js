const joi = require('joi');
exports.schemaKeys = joi.object({
  transactionType: joi.string().regex(/^[0-9a-fA-F]{24}$/),
  transactionBy: joi.string().regex(/^[0-9a-fA-F]{24}$/),
  orderId: joi.string().regex(/^[0-9a-fA-F]{24}$/),
  providerId: joi.string().regex(/^[0-9a-fA-F]{24}$/),
  appointmentId: joi.string().regex(/^[0-9a-fA-F]{24}$/),
  amount: joi.number().integer(),
  status: joi.number().integer(),
  remark: joi.string(),
  statusTrack: joi.array().items(),
  paymentTransactionId: joi.string(),
  chargeType: joi.string(),
  type: joi.string(),
  isRefunded: joi.boolean().default(false),
  physicianAmount:joi.number(),
  card: joi.object({
    last4:joi.number().integer(),
    expMonth:joi.number().integer(),
    expYear:joi.number().integer(),
    brand:joi.string()
  }),
  fees: joi.object({
    totalFee:joi.number().integer(),
    stripeFee:joi.number().integer(),
    tax:joi.number().integer()
  }),
  createdBy: joi.object(),
  updatedBy: joi.object(),
  isActive: joi.boolean().default(true),
  isDelete: joi.boolean().default(false),
  isDeleted: joi.boolean()
}).unknown(true);
exports.updateSchemaKeys = joi.object({
  transactionType: joi.string().regex(/^[0-9a-fA-F]{24}$/),
  transactionBy: joi.string().regex(/^[0-9a-fA-F]{24}$/),
  orderId: joi.string().regex(/^[0-9a-fA-F]{24}$/),
  providerId: joi.string().regex(/^[0-9a-fA-F]{24}$/),
  appointmentId: joi.string().regex(/^[0-9a-fA-F]{24}$/),
  amount: joi.number().integer(),
  status: joi.number().integer(),
  remark: joi.string(),
  statusTrack: joi.array().items(),
  paymentTransactionId: joi.string(),
  chargeType: joi.string(),
  type: joi.string(),
  isRefunded: joi.boolean().default(false),
  physicianAmount:joi.number(),
  card: joi.object({
    last4:joi.number().integer(),
    expMonth:joi.number().integer(),
    expYear:joi.number().integer(),
    brand:joi.string()
  }),
  fees: joi.object({
    totalFee:joi.number().integer(),
    stripeFee:joi.number().integer(),
    tax:joi.number().integer()
  }),
  createdBy: joi.object(),
  updatedBy: joi.object(),
  isActive: joi.boolean().default(true),
  isDelete: joi.boolean().default(false),
  isDeleted: joi.boolean()
}).unknown(true);
