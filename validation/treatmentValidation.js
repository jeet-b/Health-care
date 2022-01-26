const joi = require('joi');

exports.schemaKeys = joi.object({
    specialisationId: joi.string().regex(/^[0-9a-fA-F]{24}$/),
    name: joi.string(),
    images: joi.array().items(),
    productDescription: joi.string(),
    size: joi.string(),
    price: joi.number(),
    patientInstruction: joi.string(),
    isActive: joi.boolean().default(true),
    isDeleted: joi.boolean().default(false),
}).unknown(true);

exports.updateSchemaKeys = joi.object({
    specialisationId: joi.string().regex(/^[0-9a-fA-F]{24}$/),
    name: joi.string(),
    images: joi.array().items(),
    productDescription: joi.string(),
    size: joi.string(),
    price: joi.number(),
    patientInstruction: joi.string(),
    isActive: joi.boolean().default(true),
    isDeleted: joi.boolean().default(false),
}).unknown(true);
