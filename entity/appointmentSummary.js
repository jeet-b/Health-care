
function buildMakeAppointmentSummary ({
  insertAppointmentSummaryValidator,updateAppointmentSummaryValidator
}){
  return function makeAppointmentSummary (data,validatorName){
    let isValid = '';
    switch (validatorName){
    case 'insertAppointmentSummaryValidator':
      isValid = insertAppointmentSummaryValidator(data);
      break;

    case 'updateAppointmentSummaryValidator':
      isValid = updateAppointmentSummaryValidator(data);  
      break; 
    }
    if (isValid.error){
      throw new Error(`Invalid data in AppointmentSummary entity. ${isValid.error}`);
    }
      
    return Object.freeze({
      get appointmentId (){return data.appointmentId;},
      get patientId (){return data.patientId;},
      get providerId (){return data.providerId;},
      get diagnosis (){return data.diagnosis;},
      get allergies (){return data.allergies;},
      get pregnancyStatus (){return data.pregnancyStatus;},
      get note (){return data.note;},
      get medication (){return data.medication;},
      get followupDate (){return data.followupDate;},
      get treatmentIds (){return data.treatmentIds;},
      get treatment (){return data.treatment;},
      get referTo (){return data.referTo;},
      get furtherInstructions (){return data.furtherInstructions;},
      get pharmacyId (){return data.pharmacyId;},
      get treatmentInvoice (){return data.treatmentInvoice;},
      get treatmentAmount (){return data.treatmentAmount;},
      get orderId (){return data.orderId;},
      get createdBy (){return data.createdBy;},
      get updatedBy (){return data.updatedBy;},
      get isActive (){return data.isActive;},
      get isDelete (){return data.isDelete;},
      get isDeleted (){return data.isDeleted;},
      get addedBy (){return data.addedBy;},
            
    });
  };
}
module.exports =  buildMakeAppointmentSummary;
