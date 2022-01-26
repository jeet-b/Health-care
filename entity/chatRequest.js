
function buildMakeChatRequest({
    insertChatRequestValidator, updateChatRequestValidator
}) {
    return function makeChatRequest(data, validatorName) {
        let isValid = '';
        switch (validatorName) {
            case 'insertChatRequestValidator':
                isValid = insertChatRequestValidator(data);
                break;

            case 'updateChatRequestValidator':
                isValid = updateChatRequestValidator(data);
                break;
        }
        if (isValid.error) {
            throw new Error(`Invalid data in Chat entity. ${isValid.error}`);
        }

        return Object.freeze({
            get chatWith() { return data.chatWith; },
            get requestedBy() { return data.requestedBy; },
            get user() { return data.user; },
            get isDeleted() { return data.isDeleted; },
            get status() { return data.status; }
        });
    };
}
module.exports = buildMakeChatRequest;
