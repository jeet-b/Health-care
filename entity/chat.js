
function buildMakeChat ({
  insertChatValidator,updateChatValidator
}){
  return function makeChat (data,validatorName){
    let isValid = '';
    switch (validatorName){
    case 'insertChatValidator':
      isValid = insertChatValidator(data);
      break;

    case 'updateChatValidator':
      isValid = updateChatValidator(data);  
      break; 
    }
    if (isValid.error){
      throw new Error(`Invalid data in Chat entity. ${isValid.error}`);
    }
      
    return Object.freeze({
      get fromId (){return data.fromId;},
      get toId (){return data.toId;},
      get file (){return data.file;},
      get content (){return data.content;},
      get isDeleted (){return data.isDeleted;},
      get isActive (){return data.isActive;},
    });
  };
}
module.exports =  buildMakeChat;
