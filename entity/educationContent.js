
function buildMakeEducationContent ({
  insertEducationContentValidator,updateEducationContentValidator
}){
  return function makeEducationContent (data,validatorName){
    let isValid = '';
    switch (validatorName){
    case 'insertEducationContentValidator':
      isValid = insertEducationContentValidator(data);
      break;

    case 'updateEducationContentValidator':
      isValid = updateEducationContentValidator(data);  
      break; 
    }
    if (isValid.error){
      throw new Error(`Invalid data in EducationContent entity. ${isValid.error}`);
    }
      
    return Object.freeze({
      get title (){return data.title;},
      get description (){return data.description;},
      get files (){return data.files;},
      get createdBy (){return data.createdBy;},
      get updatedBy (){return data.updatedBy;},
      get deletedBy (){return data.deletedBy;},
      get isDeleted (){return data.isDeleted;},
      get isActive (){return data.isActive;},
      get addedBy (){return data.addedBy;},
            
    });
  };
}
module.exports =  buildMakeEducationContent;
