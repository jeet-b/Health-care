const message = require('../../../utils/messages');
const responseCode = require('../../../utils/responseCode');
function makeAppointmentSummaryController ({
  appointmentSummaryService,makeAppointmentSummary
})
{
  const addAppointmentSummary = async ({ data }) => {
    try {
      const originalData = data;

      const appointmentSummary = makeAppointmentSummary(originalData,'insertAppointmentSummaryValidator');
      let createdAppointmentSummary = await appointmentSummaryService.createDocument(appointmentSummary);
            
      return message.successResponse(
        { 'Content-Type': 'application/json' },
        responseCode.success,
        createdAppointmentSummary
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
  const findAllAppointmentSummary = async ({ data }) => {
    try {
      let options = {};
      let query = {};
      let result;
      if (data.isCountOnly){
        if (data.query !== undefined) {
          query = { ...data.query };
        }
        result = await appointmentSummaryService.countDocument(query);
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
        result = await appointmentSummaryService.getAllDocuments(query,options);
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
  const getAppointmentSummaryById = async (id) =>{
    try {
      if (id){
        const appointmentSummary = await appointmentSummaryService.getSingleDocumentById(id);
        return message.successResponse(
          { 'Content-Type': 'application/json' },
          responseCode.success,
          appointmentSummary
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
  const getAppointmentSummaryCount = async (data) => {
    try {
      let where = {};
      if (data.where){
        where = data.where;
      }
      let result = await appointmentSummaryService.countDocument(where);
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
  const getAppointmentSummaryByAggregate = async ({ data }) =>{
    try {
      if (data){
        let result = await appointmentSummaryService.getDocumentByAggregation(data);
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
  const updateAppointmentSummary = async (data,id) =>{
    try {
      if (id && data){
        const appointmentSummary = makeAppointmentSummary(data,'updateAppointmentSummaryValidator');
        const filterData = removeEmpty(appointmentSummary);
        let updatedAppointmentSummary = await appointmentSummaryService.findOneAndUpdateDocument({ _id:id },filterData,{ new:true });
        return message.successResponse(
          { 'Content-Type': 'application/json' },
          responseCode.success,
          updatedAppointmentSummary
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
  const softDeleteAppointmentSummary = async (id)=>{
    try {
      if (id){
        let updatedAppointmentSummary = await appointmentSummaryService.softDeleteDocument(id);
        return message.successResponse(
          { 'Content-Type': 'application/json' },
          responseCode.success,
          updatedAppointmentSummary
        );
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
  const bulkInsertAppointmentSummary = async ({ body }) => {
    try {
      let data = body.data;
      const appointmentSummaryEntities = body.data.map((item)=>makeAppointmentSummary(item,'insertAppointmentSummaryValidator'));
      const results = await appointmentSummaryService.bulkInsert(appointmentSummaryEntities);
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
  const bulkUpdateAppointmentSummary = async (data) => {
    try {
      if (data.filter && data.data){
        const appointmentSummary = makeAppointmentSummary(data.data,'updateAppointmentSummaryValidator');
        const filterData = removeEmpty(appointmentSummary);
        const updatedAppointmentSummarys = await appointmentSummaryService.bulkUpdate(data.filter,filterData);
        return message.successResponse(
          { 'Content-Type': 'application/json' },
          responseCode.success,
          updatedAppointmentSummarys
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
  const deleteAppointmentSummary = async (data,id) => {
    try {
      if (id){
        let deletedAppointmentSummary = await appointmentSummaryService.findOneAndDeleteDocument({ _id:id });
        return message.successResponse(
          { 'Content-Type': 'application/json' },
          responseCode.success,
          deletedAppointmentSummary
        );
                
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

  const removeEmpty = (obj) => {
    let newObj = {};
    Object.keys(obj).forEach((key) => {
      if (obj[key] === Object(obj[key])) newObj[key] = removeEmpty(obj[key]);
      else if (obj[key] !== undefined) newObj[key] = obj[key];
    });
    return newObj;
  };
  return Object.freeze({
    addAppointmentSummary,
    findAllAppointmentSummary,
    getAppointmentSummaryById,
    getAppointmentSummaryCount,
    getAppointmentSummaryByAggregate,
    updateAppointmentSummary,
    softDeleteAppointmentSummary,
    bulkInsertAppointmentSummary,
    bulkUpdateAppointmentSummary,
    deleteAppointmentSummary,
    removeEmpty,
  });
}

module.exports = makeAppointmentSummaryController;
