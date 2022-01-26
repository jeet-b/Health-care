const message = require("../../../utils/messages");
const responseCode = require("../../../utils/responseCode");
const dashboardService = require("../../../services/dashboard");

const dashboardCount = async ({ req }) => {
  try {
    let result = await dashboardService.dashboardCount({ req });
    return message.successResponse(
      { "Content-Type": "application/json" },
      responseCode.success,
      result,
      req.i18n.t("dashboard.count")
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
const dashboardChartCount = async ({ req }) => {
  try {
    let result = await dashboardService.dashboardChartCount({ req });
    return message.successResponse(
      { "Content-Type": "application/json" },
      responseCode.success,
      result,
      req.i18n.t("dashboard.chart")
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
  dashboardCount,
  dashboardChartCount,
};
