
function buildMakeFile ({
  insertFileValidator,updateFileValidator
}){
  return function makeFile (data,validatorName){
    let isValid = '';
    switch (validatorName){
    case 'insertFileValidator':
      isValid = insertFileValidator(data);
      break;

    case 'updateFileValidator':
      isValid = updateFileValidator(data);  
      break; 
    }
    if (isValid.error){
      throw new Error(`Invalid data in File entity. ${isValid.error}`);
    }
      
    return Object.freeze({
      get name (){return data.name;},
      get type (){return data.type;},
      get slug (){return data.slug;},
      get uri (){return data.uri;},
      get mime_type (){return data.mime_type;},
      get file_size (){return data.file_size;},
      get title (){return data.title;},
      get alt (){return data.alt;},
      get link (){return data.link;},
      get width (){return data.width;},
      get height (){return data.height;},
      get status (){return data.status;},
      get viewType (){return data.viewType;},
      get createdBy (){return data.createdBy;},
      get updatedBy (){return data.updatedBy;},
      get deletedBy (){return data.deletedBy;},
      get deletedAt (){return data.deletedAt;},
      get isActive (){return data.isActive;},
      get isDelete (){return data.isDelete;},
      get isDeleted (){return data.isDeleted;},
      get addedBy (){return data.addedBy;},
            
    });
  };
}
module.exports =  buildMakeFile;
