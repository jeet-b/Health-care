
function buildMakeUser ({
  insertUserValidator,updateUserValidator
}){
  return function makeUser (data,validatorName){
    let isValid = '';
    switch (validatorName){
    case 'insertUserValidator':
      isValid = insertUserValidator(data);
      break;

    case 'updateUserValidator':
      isValid = updateUserValidator(data);  
      break; 
    }
    if (isValid.error){
      throw new Error(`Invalid data in User entity. ${isValid.error}`);
    }
      
    return Object.freeze({
      get stripeCustomerId (){return data.stripeCustomerId;},
      get requestId (){return data.requestId;},
      get isVerified (){return data.isVerified;},
      get firstName (){return data.firstName;},
      get lastName (){return data.lastName;},
      get genderId (){return data.genderId;},
      get dob (){return data.dob;},
      get emails (){return data.emails;},
      get temporaryPhones (){return data.temporaryPhones;},
      get temporaryEmails (){return data.temporaryEmails;},
      get phones (){return data.phones;},
      get password (){return data.password;},
      get qualifications_and_current_position (){return data.qualifications_and_current_position;},
      get accomplishments (){return data.accomplishments;},
      get languageIds (){return data.languageIds;},
      get favouriteActivity (){return data.favouriteActivity;},
      get rewarding_part_of_practice (){return data.rewarding_part_of_practice;},
      get specialisations (){return data.specialisations;},
      get APDNumber (){return data.APDNumber;},
      get practiceAddressId (){return data.practiceAddressId;},
      get profilePictureId (){return data.profilePictureId;},
      get isApproved (){return data.isApproved;},
      get slots (){return data.slots;},
      get repeatUntilDate (){return data.repeatUntilDate;},
      get referalBy (){return data.referalBy;},
      get referalCode (){return data.referalCode;},
      get uniquePractitioner (){return data.uniquePractitioner;},
      get occupation (){return data.occupation;},
      get libraryPhotos (){return data.libraryPhotos;},
      get hearAboutUs (){return data.hearAboutUs;},
      get shippingAddress (){return data.shippingAddress;},
      get preferredTimeZone (){return data.preferredTimeZone;},
      get roleIds (){return data.roleIds;},
      get cards (){return data.cards;},
      get uniqueId (){return data.uniqueId;},
      get deactivationReason (){return data.deactivationReason;},
      get averageRating (){return data.averageRating;},
      get createdBy (){return data.createdBy;},
      get updatedBy (){return data.updatedBy;},
      get deletedBy (){return data.deletedBy;},
      get deletedAt (){return data.deletedAt;},
      get isActive (){return data.isActive;},
      get isDelete (){return data.isDelete;},
      get email (){return data.email;},
      get name (){return data.name;},
      get phone (){return data.phone;},
      get isDeleted (){return data.isDeleted;},
      get role (){return data.role;},
      get resetPasswordLink (){return data.resetPasswordLink;},
      get loginRetryLimit (){return data.loginRetryLimit;},
      get loginReactiveTime (){return data.loginReactiveTime;},
      get addedBy (){return data.addedBy;},
            
    });
  };
}
module.exports =  buildMakeUser;
