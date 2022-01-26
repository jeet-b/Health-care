
function buildMakeOrder ({
  insertOrderValidator,updateOrderValidator
}){
  return function makeOrder (data,validatorName){
    let isValid = '';
    switch (validatorName){
    case 'insertOrderValidator':
      isValid = insertOrderValidator(data);
      break;

    case 'updateOrderValidator':
      isValid = updateOrderValidator(data);  
      break; 
    }
    if (isValid.error){
      throw new Error(`Invalid data in Order entity. ${isValid.error}`);
    }
      
    return Object.freeze({
      get patientId (){return data.patientId;},
      get providerId (){return data.providerId;},
      get appointmentId (){return data.appointmentId;},
      get subTotal (){return data.subTotal;},
      get taxAmount (){return data.taxAmount;},
      get total (){return data.total;},
      get createdBy (){return data.createdBy;},
      get updatedBy (){return data.updatedBy;},
      get statusHistory (){return data.statusHistory;},
      get isActive (){return data.isActive;},
      get isDelete (){return data.isDelete;},
      get isDeleted (){return data.isDeleted;},
      get addedBy (){return data.addedBy;},
      get specialisationId (){return data.specialisationId;},
      get status (){return data.status;},
      get penalty (){return data.penalty;},
      get transactionId (){return data.transactionId;},



            
    });
  };
}
module.exports =  buildMakeOrder;
