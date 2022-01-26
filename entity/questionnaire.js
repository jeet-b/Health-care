
function buildMakeQuestionnaire ({
  insertQuestionnaireValidator,updateQuestionnaireValidator
}){
  return function makeQuestionnaire (data,validatorName){
    let isValid = '';
    switch (validatorName){
    case 'insertQuestionnaireValidator':
      isValid = insertQuestionnaireValidator(data);
      break;

    case 'updateQuestionnaireValidator':
      isValid = updateQuestionnaireValidator(data);  
      break; 
    }
    if (isValid.error){
      throw new Error(`Invalid data in Questionnaire entity. ${isValid.error}`);
    }
      
    return Object.freeze({
      get serviceId (){return data.serviceId;},
      get question (){return data.question;},
      get answer (){return data.answer;},
      get sectionId (){return data.sectionId;},
      get page (){return data.page;},
      get sequence (){return data.sequence;},
      get optionsPerLine (){return data.optionsPerLine;},
      get isActive (){return data.isActive;},
      get isDeleted (){return data.isDeleted;},
    });
  };
}
module.exports =  buildMakeQuestionnaire;
