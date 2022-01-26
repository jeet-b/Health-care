
function buildMakeRatingReview ({
  insertRatingReviewValidator,updateRatingReviewValidator
}){
  return function makeRatingReview (data,validatorName){
    let isValid = '';
    switch (validatorName){
    case 'insertRatingReviewValidator':
      isValid = insertRatingReviewValidator(data);
      break;

    case 'updateRatingReviewValidator':
      isValid = updateRatingReviewValidator(data);  
      break; 
    }
    if (isValid.error){
      throw new Error(`Invalid data in RatingReview entity. ${isValid.error}`);
    }
      
    return Object.freeze({
      get providerId (){return data.providerId;},
      get from (){return data.from;},
      get type (){return data.type;},
      get appointmentId (){return data.appointmentId;},
      get rating (){return data.rating;},
      get review (){return data.review;},
      get createdBy (){return data.createdBy;},
      get updatedBy (){return data.updatedBy;},
      get isActive (){return data.isActive;},
      get isDelete (){return data.isDelete;},
      get isDeleted (){return data.isDeleted;},
      get addedBy (){return data.addedBy;},
            
    });
  };
}
module.exports =  buildMakeRatingReview;
