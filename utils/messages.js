const responseStatusCode = require('./responseCode');

const messages = (module.exports = {});
messages.successResponse = (headers, statusCode, data, message) => ({
  headers,
  statusCode,
  data: {
    STATUS: 'SUCCESS',
    MESSAGE: message ? message : "The request is executed Successfully",
    DATA: data,
  },
});
messages.failureResponse = (headers, statusCode, data) => ({
  headers,
  statusCode,
  data: {
    STATUS: 'FAILURE',
    MESSAGE: data
  },
});
messages.badRequest = (headers, statusCode, data, message) => ({
  headers,
  statusCode,
  data: {
    STATUS: 'BAD_REQUEST',
    MESSAGE: message ? message : 'The request cannot be fulfilled due to bad syntax',
    DATA: data,
  },
});

messages.isDuplicate = (headers, statusCode, data, message) => ({
  headers,
  statusCode,
  data: {
    STATUS: 'VALIDATION_ERROR',
    MESSAGE: message ? message : 'Data duplication Found',
    DATA: data,
  },
});
messages.recordNotFound = (headers, statusCode, data, message) => ({
  headers,
  statusCode,
  data: {
    STATUS: 'SUCCESS',
    MESSAGE: message ? message : 'Record not found with specified criteria.',
    DATA: data,
  },
});
messages.insufficientParameters = (headers, statusCode, message) => ({
  headers,
  statusCode,
  data: {
    STATUS: 'BAD_REQUEST',
    MESSAGE: message ? message : 'Insufficient parameters'
  },
});

messages.mongoError = (headers, statusCode, error, message) => ({
  headers,
  statusCode,
  data: {
    STATUS: 'FAILURE',
    MESSAGE: message ? message : 'Mongo db related error',
    DATA: error,
  },
});
messages.inValidParam = (headers, statusCode, error, message) => ({
  headers,
  statusCode,
  data: {
    STATUS: 'VALIDATION_ERROR',
    MESSAGE: message ? message : 'Invalid values in parameters',
    DATA: error,
  },
});

messages.unAuthorizedRequest = (headers, statusCode, error, message) => ({
  headers,
  statusCode,
  data: {
    STATUS: 'UNAUTHORIZED',
    MESSAGE: message ? message : 'You are not authorized to access the request',
    ERROR: error,
  },
});

messages.loginSuccess = (headers, statusCode, data, message) => ({
  headers,
  statusCode,
  data: {
    STATUS: 'SUCCESS',
    MESSAGE: message ? message : 'Login Successfull',
    DATA: data,
  },
});
messages.logoutSuccess = (headers, statusCode, data, message) => ({
  headers,
  statusCode,
  data: {
    STATUS: 'SUCCESS',
    MESSAGE: message ? message : 'Logout Successfull',
    DATA: data,
  },
});
messages.passwordEmailWrong = (headers, statusCode, message) => ({
  headers,
  statusCode,
  data: {
    STATUS: 'UNAUTHORIZED',
    MESSAGE: message ? message : 'username or password is wrong',
    DATA: {},
  },
});
messages.loginFailed = (headers, statusCode, error, message) => ({
  headers,
  statusCode,
  data: {
    STATUS: 'FAILURE',
    MESSAGE: message ? message : 'Please enter valid credentials',
    DATA: error,
  },
});
messages.failedSoftDelete = (headers, statusCode, message) => ({
  headers,
  statusCode,
  data: {
    STATUS: 'FAILURE',
    MESSAGE: message ? message : 'Data can not be soft deleted due to internal server error',
    DATA: {},
  },
});