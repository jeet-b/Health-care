const db = require('../../../config/db');
const transactionModel = require('../../../model/transaction')(db);
const {
  schemaKeys,updateSchemaKeys
} = require('../../../validation/transactionValidation');
const insertTransactionValidator = require('../../../validation/genericValidator')(schemaKeys);
const updateTransactionValidator = require('../../../validation/genericValidator')(updateSchemaKeys);
const makeTransaction = require('../../../entity/transaction')({
  insertTransactionValidator,
  updateTransactionValidator
});
const transactionService = require('../../../services/mongoDbService')({
  model:transactionModel,
  makeTransaction
});
const makeTransactionController = require('./transaction');

const transactionController = makeTransactionController({
  transactionService,
  makeTransaction
});
module.exports = transactionController;
