
function buildMakeUserActivity ({
  insertUserActivityValidator,updateUserActivityValidator
}){
  return function makeUserActivity (data,validatorName){
    let isValid = '';
    switch (validatorName){
    case 'insertUserActivityValidator':
      isValid = insertUserActivityValidator(data);
      break;

    case 'updateUserActivityValidator':
      isValid = updateUserActivityValidator(data);  
      break; 
    }
    if (isValid.error){
      throw new Error(`Invalid data in UserActivity entity. ${isValid.error}`);
    }
      
    return Object.freeze({
      get name (){return data.name;},
      get activityName (){return data.activityName;},
      get frontend_route (){return data.frontend_route;},
      get route (){return data.route;},
      get device (){return data.device;},
      get response (){return data.response;},
      get userId (){return data.userId;},
      get roleId (){return data.roleId;},
      get adminId (){return data.adminId;},
      get deviceId (){return data.deviceId;},
      get location (){return data.location;},
      get ip (){return data.ip;},
      get requestData (){return data.requestData;},
      get createdBy (){return data.createdBy;},
      get updatedBy (){return data.updatedBy;},
      get deletedBy (){return data.deletedBy;},
      get isDeleted (){return data.isDeleted;},
      get isActive (){return data.isActive;},
      get addedBy (){return data.addedBy;},
            
    });
  };
}
module.exports =  buildMakeUserActivity;
