// const service = require("../../../services/mongoDbService");
const utils = require("../../../utils/messages");
const services = require('../../../services/payment');
const { PAYMENT_STATUS } = require('../../../config/authConstant');
const responseCode = require('../../../utils/responseCode');
// const { query } = require("express");
const { MESSAGE } = require('../../../config/message')
const message = require('../../../utils/messages');


const createPayment = async ({req}) => {
    try {
        const body = req.body;
        if(!body.appointmentId ==undefined){
            return message.inValidParam(
                { 'Content-Type': 'application/json' },
                responseCode.validationError,
                error.message
              );        }
        const result = await services.createPayment(body.appointmentId);
        return message.successResponse(
            { 'Content-Type': 'application/json' },
            responseCode.success,
            result
          );
        } catch (error) {
            return message.failureResponse(
              { 'Content-Type': 'application/json' },
              responseCode.internalServerError,
              error.message
            );
          }
}
const treatmentPayment = async ({req}) => {
    try {
        const body = req.body;
        if(!body.appointmentSummaryId ==undefined){
            return message.inValidParam(
                { 'Content-Type': 'application/json' },
                responseCode.validationError,
                error.message
              );        
            }
        const result = await services.treatmentPayment(body.appointmentSummaryId, body.cardId, body.chargeType);
        return message.successResponse(
            { 'Content-Type': 'application/json' },
            responseCode.success,
            result
          );
        } catch (error) {
            return message.failureResponse(
              { 'Content-Type': 'application/json' },
              responseCode.internalServerError,
              error.message
            );
          }
}
const checkPayment = async (req, res) => {
    try {
        const query = req.query;
        if (query.type == PAYMENT_STATUS.SUCCESS) {
            const result = await services.sendInvoice(query.userId)
            return utils.successResponse(result, res);
            // await service.updateDocument(Transaction, query.paymentId, { status: PAYMENT_STATUS.COMPLETED });
            // res.redirect(process.env.CLIENT_FRONTEND_URL + '/pay-online-success');
        } else {
            res.redirect(process.env.CLIENT_FRONTEND_URL + '/pay-online-fail');
        }
    } catch (error) {
        console.log(error)
        return utils.failureResponse(error, res)
    }
}

module.exports = {
    createPayment,
    checkPayment,
    treatmentPayment
}