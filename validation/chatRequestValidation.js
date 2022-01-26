const joi = require('joi');
exports.schemaKeys = joi.object({
    chatWith: joi.string().regex(/^[0-9a-fA-F]{24}$/),
    requestedBy: joi.string().regex(/^[0-9a-fA-F]{24}$/),
    isDeleted: joi.boolean().default(false),
    status: joi.string().default('requested')
}).unknown(true);

exports.updateSchemaKeys = joi.object({
    chatWith: joi.string().regex(/^[0-9a-fA-F]{24}$/),
    requestedBy: joi.string().regex(/^[0-9a-fA-F]{24}$/),
    isDeleted: joi.boolean().default(false),
    status: joi.string().default('requested')
}).unknown(true);
