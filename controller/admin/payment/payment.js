// const service = require("../../../services/mongoDbService");
const utils = require("../../../utils/messages");
const services = require('../../../services/payment');
const { PAYMENT_STATUS } = require('../../../config/authConstant');
const responseCode = require('../../../utils/responseCode');
const { MESSAGE } = require('../../../config/message')
const message = require('../../../utils/messages');


const createPayment = async (appointmentId) => {
    try {
        const AppointmentId = appointmentId;
        if (!AppointmentId == undefined) {
            return message.inValidParam(
                { 'Content-Type': 'application/json' },
                responseCode.validationError,
                error.message
            );
        }
        const result = await services.createPayment(AppointmentId);
        console.log("Payment Created!");
        console.log(result);
    } catch (error) {
        console.log("Create Payment By Admin Issue!");
        console.log(error.message);
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
    checkPayment
}