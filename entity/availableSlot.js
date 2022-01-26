
function buildMakeAvailableSlot ({
    insertAvailableSlotValidator,updateAvailableSlotValidator
  }){
    return function makeAvailableSlot (data,validatorName){
      let isValid = '';
      switch (validatorName){
      case 'insertAvailableSlotValidator':
        isValid = insertAvailableSlotValidator(data);
        break;
  
      case 'updateAvailableSlotValidator':
        isValid = updateAvailableSlotValidator(data);  
        break; 
      }
      if (isValid.error){
        throw new Error(`Invalid data in AvailableSlot entity. ${isValid.error}`);
      }
        
      return Object.freeze({
        get providerId (){return data.providerId;},
        get startTime (){return data.startTime;},
        get endTime (){return data.endTime;},
        get duration (){return data.duration;},
        get createdBy (){return data.createdBy;},
        get updatedBy (){return data.updatedBy;},
        get isActive (){return data.isActive;},
        get isDeleted (){return data.isDeleted;},
              
      });
    };
  }
  module.exports =  buildMakeAvailableSlot;
  