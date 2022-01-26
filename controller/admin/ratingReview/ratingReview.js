const message = require('../../../utils/messages');
const responseCode = require('../../../utils/responseCode');
function makeRatingReviewController ({
  ratingReviewService,makeRatingReview
})
{
  const addRatingReview = async ({ data }) => {
    try {
      const originalData = data;

      const ratingReview = makeRatingReview(originalData,'insertRatingReviewValidator');
      let createdRatingReview = await ratingReviewService.createDocument(ratingReview);
            
      return message.successResponse(
        { 'Content-Type': 'application/json' },
        responseCode.success,
        createdRatingReview
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
  const findAllRatingReview = async ({ data }) => {
    try {
      let options = {};
      let query = {};
      let result;
      if (data.isCountOnly){
        if (data.query !== undefined) {
          query = { ...data.query };
        }
        result = await ratingReviewService.countDocument(query);
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
        result = await ratingReviewService.getAllDocuments(query,options);
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
  const getRatingReviewById = async (id) =>{
    try {
      if (id){
        const ratingReview = await ratingReviewService.getSingleDocumentById(id);
        return message.successResponse(
          { 'Content-Type': 'application/json' },
          responseCode.success,
          ratingReview
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
  const getRatingReviewCount = async (data) => {
    try {
      let where = {};
      if (data.where){
        where = data.where;
      }
      let result = await ratingReviewService.countDocument(where);
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
  const getRatingReviewByAggregate = async ({ data }) =>{
    try {
      if (data){
        let result = await ratingReviewService.getDocumentByAggregation(data);
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
  const updateRatingReview = async (data,id) =>{
    try {
      if (id && data){
        const ratingReview = makeRatingReview(data,'updateRatingReviewValidator');
        const filterData = removeEmpty(ratingReview);
        let updatedRatingReview = await ratingReviewService.findOneAndUpdateDocument({ _id:id },filterData,{ new:true });
        return message.successResponse(
          { 'Content-Type': 'application/json' },
          responseCode.success,
          updatedRatingReview
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
  const softDeleteRatingReview = async (id)=>{
    try {
      if (id){
        let updatedRatingReview = await ratingReviewService.softDeleteDocument(id);
        return message.successResponse(
          { 'Content-Type': 'application/json' },
          responseCode.success,
          updatedRatingReview
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
  const bulkInsertRatingReview = async ({ body }) => {
    try {
      let data = body.data;
      const ratingReviewEntities = body.data.map((item)=>makeRatingReview(item,'insertRatingReviewValidator'));
      const results = await ratingReviewService.bulkInsert(ratingReviewEntities);
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
  const bulkUpdateRatingReview = async (data) => {
    try {
      if (data.filter && data.data){
        const ratingReview = makeRatingReview(data.data,'updateRatingReviewValidator');
        const filterData = removeEmpty(ratingReview);
        const updatedRatingReviews = await ratingReviewService.bulkUpdate(data.filter,filterData);
        return message.successResponse(
          { 'Content-Type': 'application/json' },
          responseCode.success,
          updatedRatingReviews
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
  const deleteRatingReview = async (data,id) => {
    try {
      if (id){
        let deletedRatingReview = await ratingReviewService.findOneAndDeleteDocument({ _id:id });
        return message.successResponse(
          { 'Content-Type': 'application/json' },
          responseCode.success,
          deletedRatingReview
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
    addRatingReview,
    findAllRatingReview,
    getRatingReviewById,
    getRatingReviewCount,
    getRatingReviewByAggregate,
    updateRatingReview,
    softDeleteRatingReview,
    bulkInsertRatingReview,
    bulkUpdateRatingReview,
    deleteRatingReview,
    removeEmpty,
  });
}

module.exports = makeRatingReviewController;
