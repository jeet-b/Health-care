const reportService = require("../../../services/report");
const message = require("../../../utils/messages");
const responseCode = require("../../../utils/responseCode");

const newUserCount = async ({ req }) => {
  try {
    let result = await reportService.newUserCount(req.body);
    return message.successResponse(
      { "Content-Type": "application/json" },
      responseCode.success,
      result
    );
  } catch (error) {
    if (error.name === "ValidationError") {
      return message.inValidParam(
        { "Content-Type": "application/json" },
        responseCode.validationError,
        error.message
      );
    }
    return message.failureResponse(
      { "Content-Type": "application/json" },
      responseCode.internalServerError,
      error.message
    );
  }
};
const newUserReport = async ({ req }) => {
  try {
    let result = await reportService.newUserReport(req.body);
    return message.successResponse(
      { "Content-Type": "application/json" },
      responseCode.success,
      result
    );
  } catch (error) {
    if (error.name === "ValidationError") {
      return message.inValidParam(
        { "Content-Type": "application/json" },
        responseCode.validationError,
        error.message
      );
    }
    return message.failureResponse(
      { "Content-Type": "application/json" },
      responseCode.internalServerError,
      error.message
    );
  }
};

const physicianAppointmentCount = async ({ req }) => {
  try {
    let result = await reportService.physicianAppointmentCount(req.body);
    return message.successResponse(
      { "Content-Type": "application/json" },
      responseCode.success,
      result
    );
  } catch (error) {
    if (error.name === "ValidationError") {
      return message.inValidParam(
        { "Content-Type": "application/json" },
        responseCode.validationError,
        error.message
      );
    }
    return message.failureResponse(
      { "Content-Type": "application/json" },
      responseCode.internalServerError,
      error.message
    );
  }
};
const physicianReport = async ({ req }) => {
  try {
    let result = await reportService.physicianReport(req.body);
    return message.successResponse(
      { "Content-Type": "application/json" },
      responseCode.success,
      result
    );
  } catch (error) {
    if (error.name === "ValidationError") {
      return message.inValidParam(
        { "Content-Type": "application/json" },
        responseCode.validationError,
        error.message
      );
    }
    return message.failureResponse(
      { "Content-Type": "application/json" },
      responseCode.internalServerError,
      error.message
    );
  }
};

const transactionFrequency = async ({ req }) => {
  try {
    let result = await reportService.transactionFrequency(req.body);
    return message.successResponse(
      { "Content-Type": "application/json" },
      responseCode.success,
      result
    );
  } catch (error) {
    if (error.name === "ValidationError") {
      return message.inValidParam(
        { "Content-Type": "application/json" },
        responseCode.validationError,
        error.message
      );
    }
    return message.failureResponse(
      { "Content-Type": "application/json" },
      responseCode.internalServerError,
      error.message
    );
  }
};

const transactionFrequencyReport = async ({ req }) => {
  try {
    let result = await reportService.transactionFrequencyReport(req.body);
    return message.successResponse(
      { "Content-Type": "application/json" },
      responseCode.success,
      result
    );
  } catch (error) {
    if (error.name === "ValidationError") {
      return message.inValidParam(
        { "Content-Type": "application/json" },
        responseCode.validationError,
        error.message
      );
    }
    return message.failureResponse(
      { "Content-Type": "application/json" },
      responseCode.internalServerError,
      error.message
    );
  }
};

const averageTransaction = async ({ req }) => {
  try {
    let result = await reportService.averageTransaction(req.body);
    return message.successResponse(
      { "Content-Type": "application/json" },
      responseCode.success,
      result
    );
  } catch (error) {
    if (error.name === "ValidationError") {
      return message.inValidParam(
        { "Content-Type": "application/json" },
        responseCode.validationError,
        error.message
      );
    }
    return message.failureResponse(
      { "Content-Type": "application/json" },
      responseCode.internalServerError,
      error.message
    );
  }
};
const revenueCount = async ({ req }) => {
  try {
    let result = await reportService.revenueCount(req.body);
    return message.successResponse(
      { "Content-Type": "application/json" },
      responseCode.success,
      result
    );
  } catch (error) {
    if (error.name === "ValidationError") {
      return message.inValidParam(
        { "Content-Type": "application/json" },
        responseCode.validationError,
        error.message
      );
    }
    return message.failureResponse(
      { "Content-Type": "application/json" },
      responseCode.internalServerError,
      error.message
    );
  }
};

module.exports = {
  newUserCount,
  newUserReport,
  physicianAppointmentCount,
  physicianReport,
  averageTransaction,
  transactionFrequency,
  transactionFrequencyReport,
  revenueCount
};
