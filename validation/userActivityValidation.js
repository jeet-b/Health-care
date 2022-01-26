const joi = require('joi');
exports.schemaKeys = joi.object({
  name: joi.string(),
  activityName: joi.string(),
  frontend_route: joi.string(),
  route: joi.string().required(),
  device: joi.string(),
  response: joi.object({
    httpStatus:joi.string().required(),
    method:joi.string(),
    message:joi.string()
  }),
  userId: joi.string().regex(/^[0-9a-fA-F]{24}$/),
  roleId: joi.string().regex(/^[0-9a-fA-F]{24}$/),
  adminId: joi.string().regex(/^[0-9a-fA-F]{24}$/),
  deviceId: joi.string(),
  location: joi.string(),
  ip: joi.string(),
  requestData: joi.object(),
  createdBy: joi.object(),
  updatedBy: joi.object(),
  deletedBy: joi.object(),
  isActive: joi.boolean(),
  isDeleted: joi.boolean()
}).unknown(true);
exports.updateSchemaKeys = joi.object({
  name: joi.string(),
  activityName: joi.string(),
  frontend_route: joi.string(),
  route: joi.string().when({
    is:joi.exist(),
    then:joi.required(),
    otherwise:joi.optional()
  }),
  device: joi.string(),
  response: joi.object({
    httpStatus:joi.string().when({
      is:joi.exist(),
      then:joi.required(),
      otherwise:joi.optional()
    }),
    method:joi.string(),
    message:joi.string()
  }),
  userId: joi.string().regex(/^[0-9a-fA-F]{24}$/),
  roleId: joi.string().regex(/^[0-9a-fA-F]{24}$/),
  adminId: joi.string().regex(/^[0-9a-fA-F]{24}$/),
  deviceId: joi.string(),
  location: joi.string(),
  ip: joi.string(),
  requestData: joi.object(),
  createdBy: joi.object(),
  updatedBy: joi.object(),
  deletedBy: joi.object(),
  isActive: joi.boolean(),
  isDeleted: joi.boolean()
}).unknown(true);
