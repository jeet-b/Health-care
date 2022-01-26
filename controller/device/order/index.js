const db = require('../../../config/db');
const orderModel = require('../../../model/order')(db);
const {
  schemaKeys,updateSchemaKeys
} = require('../../../validation/orderValidation');
const insertOrderValidator = require('../../../validation/genericValidator')(schemaKeys);
const updateOrderValidator = require('../../../validation/genericValidator')(updateSchemaKeys);
const makeOrder = require('../../../entity/order')({
  insertOrderValidator,
  updateOrderValidator
});
const orderService = require('../../../services/mongoDbService')({
  model:orderModel,
  makeOrder
});
const makeOrderController = require('./order');

const orderController = makeOrderController({
  orderService,
  makeOrder
});
module.exports = orderController;
