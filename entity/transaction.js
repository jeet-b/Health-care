
function buildMakeTransaction ({
  insertTransactionValidator,updateTransactionValidator
}){
  return function makeTransaction (data,validatorName){
    let isValid = '';
    switch (validatorName){
    case 'insertTransactionValidator':
      isValid = insertTransactionValidator(data);
      break;

    case 'updateTransactionValidator':
      isValid = updateTransactionValidator(data);  
      break; 
    }
    if (isValid.error){
      throw new Error(`Invalid data in Transaction entity. ${isValid.error}`);
    }
      
    return Object.freeze({
      get transactionType (){return data.transactionType;},
      get transactionBy (){return data.transactionBy;},
      get orderId (){return data.orderId;},
      get providerId (){return data.providerId;},
      get appointmentId (){return data.appointmentId;},
      get amount (){return data.amount;},
      get status (){return data.status;},
      get remark (){return data.remark;},
      get statusTrack (){return data.statusTrack;},
      get paymentTransactionId (){return data.paymentTransactionId;},
      get chargeType (){return data.chargeType;},
      get isRefunded (){return data.isRefunded;},
      get card (){return data.card;},
      get fees (){return data.fees;},
      get physicianAmount (){return data.physicianAmount;},
      get createdBy (){return data.createdBy;},
      get updatedBy (){return data.updatedBy;},
      get isActive (){return data.isActive;},
      get isDelete (){return data.isDelete;},
      get isDeleted (){return data.isDeleted;},
      get addedBy (){return data.addedBy;},
      get type (){return data.type;},     
    });
  };
}
module.exports =  buildMakeTransaction;
