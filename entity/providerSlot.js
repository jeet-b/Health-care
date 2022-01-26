
function buildMakeProviderSlot ({
  insertProviderSlotValidator,updateProviderSlotValidator
}){
  return function makeProviderSlot (data,validatorName){
    let isValid = '';
    switch (validatorName){
    case 'insertProviderSlotValidator':
      isValid = insertProviderSlotValidator(data);
      break;

    case 'updateProviderSlotValidator':
      isValid = updateProviderSlotValidator(data);  
      break; 
    }
    if (isValid.error){
      throw new Error(`Invalid data in ProviderSlot entity. ${isValid.error}`);
    }
      
    return Object.freeze({
      get dayOfWeek (){return data.dayOfWeek;},
      get providerId (){return data.providerId;},
      get type (){return data.type;},
      get durations (){return data.durations;},
      get repeatUntil (){return data.repeatUntil;},
      get repeatDate (){return data.repeatDate;},
      get createdBy (){return data.createdBy;},
      get updatedBy (){return data.updatedBy;},
      get isActive (){return data.isActive;},
      get isDelete (){return data.isDelete;},
      get isDeleted (){return data.isDeleted;},            
    });
  };
}
module.exports =  buildMakeProviderSlot;
