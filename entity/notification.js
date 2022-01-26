
function buildMakeNotification ({
  insertNotificationValidator,updateNotificationValidator
}){
  return function makeNotification (data,validatorName){
    let isValid = '';
    switch (validatorName){
    case 'insertNotificationValidator':
      isValid = insertNotificationValidator(data);
      break;

    case 'updateNotificationValidator':
      isValid = updateNotificationValidator(data);  
      break; 
    }
    if (isValid.error){
      throw new Error(`Invalid data in Notification entity. ${isValid.error}`);
    }
      
    return Object.freeze({
      get type (){return data.type;},
      get title (){return data.title;},
      get content (){return data.content;},
      get sentBy (){return data.sentBy;},
      get seenAt (){return data.seenAt;},
      get receivedBy (){return data.receivedBy;},
      get createdBy (){return data.createdBy;},
      get updatedBy (){return data.updatedBy;},
      get isActive (){return data.isActive;},
      get isDelete (){return data.isDelete;},
      get isDeleted (){return data.isDeleted;},
      get addedBy (){return data.addedBy;},
            
    });
  };
}
module.exports =  buildMakeNotification;
