const message = require('../../../utils/messages');
const responseCode = require('../../../utils/responseCode');
function makeTransactionController ({
  transactionService,makeTransaction
})
{
  const addTransaction = async ({ data }) => {
    try {
      const originalData = data;

      const transaction = makeTransaction(originalData,'insertTransactionValidator');
      let createdTransaction = await transactionService.createDocument(transaction);
            
      return message.successResponse(
        { 'Content-Type': 'application/json' },
        responseCode.success,
        createdTransaction
      );

    } catch (error){
      if (error.name === 'ValidationError'){
        return message.inValidParam(
          { 'Content-Type': 'application/json' },
          responseCode.validationError,
          error.message
        );
      }
      return message.failureResponse(
        { 'Content-Type': 'application/json' },
        responseCode.internalServerError,
        error.message
      );
    }
  };
  const findAllTransaction = async ({ data }, i18n) => {
    try {
      let options = {};
      let query = {};
      let result;
      if (data.isCountOnly){
        if (data.query !== undefined) {
          query = { ...data.query };
        }
        result = await transactionService.countDocument(query);
        if (result) {
          result = { totalRecords: result };  
        } else {
          return message.recordNotFound(
            { 'Content-Type': 'application/json' },
            responseCode.success,
            [],
            i18n.t("response_message.recordNotFound")
          );
        }
      } else { 
        if (data.options !== undefined) {
          options = { ...data.options };
        }

        if (data.query !== undefined){
          query = { ...data.query };
        }
        result = await transactionService.getAllDocuments(query,options);
      }
           
      if (result){
        return message.successResponse(
          { 'Content-Type': 'application/json' },
          responseCode.success,
          result,
          i18n.t("transaction.findAll")
        );
      } else {
        return message.badRequest(
          { 'Content-Type': 'application/json' },
          responseCode.badRequest,
          {},
          i18n.t("response_message.badRequest")
        );
      }
            
    }
    catch (error){
      return message.failureResponse(
        { 'Content-Type': 'application/json' },
        responseCode.internalServerError,
        error.message
      );
    }
  };
  const getTransactionById = async (id) =>{
    try {
      if (id){
        const transaction = await transactionService.getSingleDocumentById(id);
        return message.successResponse(
          { 'Content-Type': 'application/json' },
          responseCode.success,
          transaction
        );
      }
      return message.badRequest(
        { 'Content-Type': 'application/json' },
        responseCode.badRequest,
        {}
      );
    }
    catch (error){
      return message.failureResponse(
        { 'Content-Type': 'application/json' },
        responseCode.internalServerError,
        error.message
      );
    }
  };
  const getTransactionCount = async (data) => {
    try {
      let where = {};
      if (data.where){
        where = data.where;
      }
      let result = await transactionService.countDocument(where);
      if (result){
        result = { totalRecords:result };
        return message.successResponse(
          { 'Content-Type': 'application/json' },
          responseCode.success,
          result
        );
                
      }
      return message.badRequest(
        { 'Content-Type': 'application/json' },
        responseCode.badRequest,
        {}
      );
    }
    catch (error){
      return message.failureResponse(
        { 'Content-Type': 'application/json' },
        responseCode.internalServerError,
        error.message
      );
    }
  };
  const getTransactionByAggregate = async ({ data }) =>{
    try {
      if (data){
        let result = await transactionService.getDocumentByAggregation(data);
        if (result){
          return message.successResponse(
            { 'Content-Type': 'application/json' },
            responseCode.success,
            result
          );
        }
      }
      return message.badRequest(
        { 'Content-Type': 'application/json' },
        responseCode.badRequest,
        {}
      );
    } catch (error){
      return message.failureResponse(
        { 'Content-Type': 'application/json' },
        responseCode.internalServerError,
        error.message
      ); 
    }
  };
  const updateTransaction = async (data,id) =>{
    try {
      if (id && data){
        const transaction = makeTransaction(data,'updateTransactionValidator');
        const filterData = removeEmpty(transaction);
        let updatedTransaction = await transactionService.findOneAndUpdateDocument({ _id:id },filterData,{ new:true });
        return message.successResponse(
          { 'Content-Type': 'application/json' },
          responseCode.success,
          updatedTransaction
        );
      }
      return message.badRequest(
        { 'Content-Type': 'application/json' },
        responseCode.badRequest,
        {}
      );
    }
    catch (error){
      if (error.name === 'ValidationError'){
        return message.inValidParam(
          { 'Content-Type': 'application/json' },
          responseCode.validationError,
          error.message
        );
      }
      return message.failureResponse(
        { 'Content-Type': 'application/json' },
        responseCode.internalServerError,
        error.message
      );
    }
  };
  const softDeleteTransaction = async (id) => {
    try {
      const deleteDependentService = require('../../../utils/deleteDependent');
      let pos = [ {
        model: 'invoice',
        refId: 'transactionId' 
      } ];
      await transactionService.softDeleteDocument(id);
      let result = await deleteDependentService.softDeleteTransaction({ _id: id });
      return message.successResponse(
        { 'Content-Type': 'application/json' },
        responseCode.success,
        result);
            
    } catch (error){
      return message.failureResponse(
        { 'Content-Type': 'application/json' },
        responseCode.internalServerError,
        error.message
      );
    }
  };
  const bulkInsertTransaction = async ({ body }) => {
    try {
      let data = body.data;
      const transactionEntities = body.data.map((item)=>makeTransaction(item,'insertTransactionValidator'));
      const results = await transactionService.bulkInsert(transactionEntities);
      return message.successResponse(
        { 'Content-Type': 'application/json' },
        responseCode.success,
        results
      );
    } catch (error){
      if (error.name === 'ValidationError'){
        return message.inValidParam(
          { 'Content-Type': 'application/json' },
          responseCode.validationError,
          error.message
        );
      }
      return message.failureResponse(
        { 'Content-Type': 'application/json' },
        responseCode.internalServerError,
        error.message
      );
    }
  };
  const bulkUpdateTransaction = async (data) => {
    try {
      if (data.filter && data.data){
        const transaction = makeTransaction(data.data,'updateTransactionValidator');
        const filterData = removeEmpty(transaction);
        const updatedTransactions = await transactionService.bulkUpdate(data.filter,filterData);
        return message.successResponse(
          { 'Content-Type': 'application/json' },
          responseCode.success,
          updatedTransactions
        );
      }
      return message.badRequest(
        { 'Content-Type': 'application/json' },
        responseCode.badRequest,
        {}
      );
    } catch (error){
      if (error.name === 'ValidationError'){
        return message.inValidParam(
          { 'Content-Type': 'application/json' },
          responseCode.validationError,
          error.message);
      }
      return message.failureResponse(
        { 'Content-Type': 'application/json' },
        responseCode.internalServerError,
        error.message);
    }
  };
  const deleteTransaction = async (data,id) => {
    try {
      let possibleDependent = [ {
        model: 'invoice',
        refId: 'transactionId' 
      } ];
      const deleteDependentService = require('../../../utils/deleteDependent');
      if (data.isWarning) {
        let all = await deleteDependentService.countTransaction({ _id:id });
        return message.successResponse(
          { 'Content-Type': 'application/json' },
          responseCode.success,
          all
        );
      } else {
        let result = await deleteDependentService.deleteTransaction({ _id: id });
        if (result){
          return message.successResponse(
            { 'Content-Type': 'application/json' },
            responseCode.success,
            result
          );
                    
        }
      }
      return message.badRequest(
        { 'Content-Type': 'application/json' },
        responseCode.badRequest,
        {}
      );
    }
    catch (error){
      if (error.name === 'ValidationError'){
        return message.inValidParam(
          { 'Content-Type': 'application/json' },
          responseCode.validationError,
          error.message
        );
      }
      return message.failureResponse(
        { 'Content-Type': 'application/json' },
        responseCode.internalServerError,
        error.message
      );
    }
  };

  const removeEmpty = (obj) => {
    let newObj = {};
    Object.keys(obj).forEach((key) => {
      if (obj[key] === Object(obj[key])) newObj[key] = removeEmpty(obj[key]);
      else if (obj[key] !== undefined) newObj[key] = obj[key];
    });
    return newObj;
  };
  return Object.freeze({
    addTransaction,
    findAllTransaction,
    getTransactionById,
    getTransactionCount,
    getTransactionByAggregate,
    updateTransaction,
    softDeleteTransaction,
    bulkInsertTransaction,
    bulkUpdateTransaction,
    deleteTransaction,
    removeEmpty,
  });
}

module.exports = makeTransactionController;
