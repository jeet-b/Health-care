const db = require('../../../config/db');
const userModel = require('../../../model/user')(db);
const {
  schemaKeys,updateSchemaKeys
} = require('../../../validation/cityValidation');

const StripePaymentService = require('../../../services/stripe/payment')
const makeStripeontroller = require('./stripe');

const stripeController = makeStripeontroller({
  StripePaymentService
});
module.exports = stripeController;
