
function buildMakeMaster ({
  insertMasterValidator,updateMasterValidator
}){
  return function makeMaster (data,validatorName){
    let isValid = '';
    switch (validatorName){
    case 'insertMasterValidator':
      isValid = insertMasterValidator(data);
      break;

    case 'updateMasterValidator':
      isValid = updateMasterValidator(data);  
      break; 
    }
    if (isValid.error){
      throw new Error(`Invalid data in Master entity. ${isValid.error}`);
    }
      
    return Object.freeze({
      get name (){return data.name;},
      get code (){return data.code;},
      get isActive (){return data.isActive;},
      get fileId (){return data.fileId;},
      get parentId (){return data.parentId;},
      get createdBy (){return data.createdBy;},
      get updatedBy (){return data.updatedBy;},
      get deletedBy (){return data.deletedBy;},
      get deletedAt (){return data.deletedAt;},
      get isDelete (){return data.isDelete;},
      get isDeleted (){return data.isDeleted;},
      get addedBy (){return data.addedBy;},
            
    });
  };
}
module.exports =  buildMakeMaster;
