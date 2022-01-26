
function buildMakeAppointment ({
  insertAppointmentValidator,updateAppointmentValidator
}){
  return function makeAppointment (data,validatorName){
    let isValid = '';
    switch (validatorName){
    case 'insertAppointmentValidator':
      isValid = insertAppointmentValidator(data);
      break;

    case 'updateAppointmentValidator':
      isValid = updateAppointmentValidator(data);  
      break; 
    }
    if (isValid.error){
      throw new Error(`Invalid data in Appointment entity. ${isValid.error}`);
    }
      
    return Object.freeze({
      get patientName (){return data.patientName;},
      get providerName (){return data.providerName;},
      get specialisationName (){return data.specialisationName;},
      get isAppointmentCompleted (){return data.isAppointmentCompleted;},
      get slotId (){return data.slotId;},
      get availableSlotId (){return data.availableSlotId;},
      get appointmentDateTime (){return data.appointmentDateTime;},
      get isBooked (){return data.isBooked;},
      get cancelledBy (){return data.cancelledBy;},
      get noShow (){return data.noShow;},
      get noShowReason (){return data.noShowReason;},
      get APID (){return data.APID;},
      get providerId (){return data.providerId;},
      get isRescheduled (){return data.isRescheduled;},
      get rescheduleReason (){return data.rescheduleReason;},
      get isApproved (){return data.isApproved;},
      get specialisationId (){return data.specialisationId;},
      get cancellationReason (){return data.cancellationReason;},
      get isAppointmentStarted (){return data.isAppointmentStarted;},
      get appointmentStartTime (){return data.appointmentStartTime;},
      get appointmentEndTime (){return data.appointmentEndTime;},
      get appointmentStartTimeActual (){return data.appointmentStartTimeActual;},
      get appointmentEndTimeActual (){return data.appointmentEndTimeActual;},
      get patientIntakeFormId (){return data.patientIntakeFormId;},
      get treatmentAvailable (){return data.treatmentAvailable;},
      get appointmentSummaryId (){return data.appointmentSummaryId;},
      get treatmentAssignedOn (){return data.treatmentAssignedOn;},
      get treatmentPaidOn (){return data.treatmentPaidOn;},
      get firstTreatmentReminderPaymentMail (){return data.firstTreatmentReminderPaymentMail;},
      get secondTreatmentReminderPaymentMail (){return data.secondTreatmentReminderPaymentMail;},
      get firstFollowUpTreatmentMail (){return data.firstFollowUpTreatmentMail;},
      get secondFollowUpTreatmentMail (){return data.secondFollowUpTreatmentMail;},
      get createdBy (){return data.createdBy;},
      get updatedBy (){return data.updatedBy;},
      get isActive (){return data.isActive;},
      get isDelete (){return data.isDelete;},
      get isDeleted (){return data.isDeleted;},
      get patientId (){return data.patientId;},
      get cardId (){return data.cardId;},
      get status (){return data.status;},
      get orderId (){return data.orderId;},
      get isPaid (){return data.isPaid;},
      get isFollowUp (){return data.isFollowUp;},
      get isCancelled (){return data.isCancelled;},
      get isTreatmentPaid (){return data.isTreatmentPaid;},
      get isInterrupted (){return data.isInterrupted;},
      get canReBook (){return data.canReBook;},
      get isReviewAppointment (){return data.isReviewAppointment;},
      get invoiceId (){return data.invoiceId;},
      get appointmentFollowUpId (){return data.appointmentFollowUpId;},
      get isPhysicianDisconnected (){return data.isPhysicianDisconnected;},
      get physicianDisconnectedAt (){return data.physicianDisconnectedAt;},
      get isPatientDisconnected (){return data.isPatientDisconnected;},
      get patientDisconnectedAt (){return data.patientDisconnectedAt;},
      get isConnected (){return data.isConnected;},
      get patientJoinedAt (){return data.patientJoinedAt;},
      get isPatientJoined (){return data.isPatientJoined;},
      get physicianJoinedAt (){return data.physicianJoinedAt;},
      get isPhysicianJoined (){return data.isPhysicianJoined;},
      get isConnected (){return data.isConnected;},
      get sessionToken (){return data.sessionToken;},
      get sessionId (){return data.sessionId;},
      get appointmentHistory (){return data.appointmentHistory;},
      get parentAppointmentId (){return data.parentAppointmentId;},
      get appointmentType (){return data.appointmentType;},
      get addedBy (){return data.addedBy;},
      get penalty (){return data.penalty;},



            
    });
  };
}
module.exports =  buildMakeAppointment;
