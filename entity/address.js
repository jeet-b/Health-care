
function buildMakeAddress ({
  insertAddressValidator,updateAddressValidator
}){
  return function makeAddress (data,validatorName){
    let isValid = '';
    switch (validatorName){
    case 'insertAddressValidator':
      isValid = insertAddressValidator(data);
      break;

    case 'updateAddressValidator':
      isValid = updateAddressValidator(data);  
      break; 
    }
    if (isValid.error){
      throw new Error(`Invalid data in Address entity. ${isValid.error}`);
    }
      
    return Object.freeze({
      get addressLine1 (){return data.addressLine1;},
      get addressLine2 (){return data.addressLine2;},
      get countryId (){return data.countryId;},
      get cityId (){return data.cityId;},
      get provinceId (){return data.provinceId;},
      get postalCodeId (){return data.postalCodeId;},
      get isActive (){return data.isActive;},
      get isDelete (){return data.isDelete;},
      get isDeleted (){return data.isDeleted;},
      get addedBy (){return data.addedBy;},
            
    });
  };
}
module.exports =  buildMakeAddress;
