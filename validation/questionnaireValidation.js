const joi = require('joi');

exports.schemaKeys = joi.object({
  serviceId: joi.string().regex(/^[0-9a-fA-F]{24}$/),
  sectionId: joi.string().regex(/^[0-9a-fA-F]{24}$/),
  optionsPerLine: joi.number(),
  question: joi.object(),
  answer: joi.array(),
  page: joi.number(),
  sequence: joi.number(),
  isActive: joi.boolean().default(true),
  isDeleted: joi.boolean().default(false)
}).unknown(true);

exports.updateSchemaKeys = joi.object({
  serviceId: joi.string().regex(/^[0-9a-fA-F]{24}$/),
  sectionId: joi.string().regex(/^[0-9a-fA-F]{24}$/),
  optionsPerLine: joi.number(),
  question: joi.object(),
  answer: joi.array(),
  page: joi.number(),
  sequence: joi.number(),
  isActive: joi.boolean().default(true),
  isDeleted: joi.boolean().default(false)
}).unknown(true);
