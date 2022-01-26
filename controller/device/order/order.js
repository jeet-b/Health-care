const message = require('../../../utils/messages');
const responseCode = require('../../../utils/responseCode');
function makeOrderController ({
  orderService,makeOrder
})
{
  const addOrder = async ({ data }) => {
    try {
      const originalData = data;

      const order = makeOrder(originalData,'insertOrderValidator');
      let createdOrder = await orderService.createDocument(order);
            
      return message.successResponse(
        { 'Content-Type': 'application/json' },
        responseCode.success,
        createdOrder
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
  const findAllOrder = async ({ data }) => {
    try {
      let options = {};
      let query = {};
      let result;
      if (data.isCountOnly){
        if (data.query !== undefined) {
          query = { ...data.query };
        }
        result = await orderService.countDocument(query);
        if (result) {
          result = { totalRecords: result };  
        } else {
          return message.recordNotFound(
            { 'Content-Type': 'application/json' },
            responseCode.success,
            []
          );
        }
      } else { 
        if (data.options !== undefined) {
          options = { ...data.options };
        }
        if (options.populate){
          delete options.populate;
        }
        if (data.query !== undefined){
          query = { ...data.query };
        }
        result = await orderService.getAllDocuments(query,options);
      }
           
      if (result){
        return message.successResponse(
          { 'Content-Type': 'application/json' },
          responseCode.success,
          result
        );
      } else {
        return message.badRequest(
          { 'Content-Type': 'application/json' },
          responseCode.badRequest,
          {}
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
  const getOrderById = async (id) =>{
    try {
      if (id){
        const order = await orderService.getSingleDocumentById(id);
        return message.successResponse(
          { 'Content-Type': 'application/json' },
          responseCode.success,
          order
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
  const getOrderCount = async (data) => {
    try {
      let where = {};
      if (data.where){
        where = data.where;
      }
      let result = await orderService.countDocument(where);
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
  const getOrderByAggregate = async ({ data }) =>{
    try {
      if (data){
        let result = await orderService.getDocumentByAggregation(data);
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
  const updateOrder = async (data,id) =>{
    try {
      if (id && data){
        const order = makeOrder(data,'updateOrderValidator');
        const filterData = removeEmpty(order);
        let updatedOrder = await orderService.findOneAndUpdateDocument({ _id:id },filterData,{ new:true });
        return message.successResponse(
          { 'Content-Type': 'application/json' },
          responseCode.success,
          updatedOrder
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
  const softDeleteOrder = async (id) => {
    try {
      const deleteDependentService = require('../../../utils/deleteDependent');
      let pos = [
        {
          model: 'invoice',
          refId: 'orderId' 
        },
        {
          model: 'transaction',
          refId: 'orderId' 
        }
      ];
      await orderService.softDeleteDocument(id);
      let result = await deleteDependentService.softDeleteOrder({ _id: id });
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
  const bulkInsertOrder = async ({ body }) => {
    try {
      let data = body.data;
      const orderEntities = body.data.map((item)=>makeOrder(item,'insertOrderValidator'));
      const results = await orderService.bulkInsert(orderEntities);
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
  const bulkUpdateOrder = async (data) => {
    try {
      if (data.filter && data.data){
        const order = makeOrder(data.data,'updateOrderValidator');
        const filterData = removeEmpty(order);
        const updatedOrders = await orderService.bulkUpdate(data.filter,filterData);
        return message.successResponse(
          { 'Content-Type': 'application/json' },
          responseCode.success,
          updatedOrders
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
  const deleteOrder = async (data,id) => {
    try {
      let possibleDependent = [
        {
          model: 'invoice',
          refId: 'orderId' 
        },
        {
          model: 'transaction',
          refId: 'orderId' 
        }
      ];
      const deleteDependentService = require('../../../utils/deleteDependent');
      if (data.isWarning) {
        let all = await deleteDependentService.countOrder({ _id:id });
        return message.successResponse(
          { 'Content-Type': 'application/json' },
          responseCode.success,
          all
        );
      } else {
        let result = await deleteDependentService.deleteOrder({ _id: id });
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
    addOrder,
    findAllOrder,
    getOrderById,
    getOrderCount,
    getOrderByAggregate,
    updateOrder,
    softDeleteOrder,
    bulkInsertOrder,
    bulkUpdateOrder,
    deleteOrder,
    removeEmpty,
  });
}

module.exports = makeOrderController;
