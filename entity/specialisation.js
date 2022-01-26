
function buildMakeSpecialisation ({
  insertSpecialisationValidator,updateSpecialisationValidator
}){
  return function makeSpecialisation (data,validatorName){
    let isValid = '';
    switch (validatorName){
    case 'insertSpecialisationValidator':
      isValid = insertSpecialisationValidator(data);
      break;

    case 'updateSpecialisationValidator':
      isValid = updateSpecialisationValidator(data);  
      break; 
    }
    if (isValid.error){
      throw new Error(`Invalid data in Specialisation entity. ${isValid.error}`);
    }
      
    return Object.freeze({
      get sequence (){return data.sequence;},
      get name (){return data.name;},
      get file (){return data.file;},
      get description (){return data.description;},
      get isFree (){return data.isFree;},
      get isActive (){return data.isActive;},
      get isComingSoon (){return data.isComingSoon;},
      get createdBy (){return data.createdBy;},
      get updatedBy (){return data.updatedBy;},
      get price (){return data.price;},
      get isDelete (){return data.isDelete;},
      get isDeleted (){return data.isDeleted;},
      get addedBy (){return data.addedBy;},
            
    });
  };
}
module.exports =  buildMakeSpecialisation;
