
function buildMakeTreatment({
    insertTreatmentValidator, updateTreatmentValidator
}) {
    return function makeTreatment(data, validatorName) {
        let isValid = '';
        switch (validatorName) {
            case 'insertTreatmentValidator':
                isValid = insertTreatmentValidator(data);
                break;

            case 'updateTreatmentValidator':
                isValid = updateTreatmentValidator(data);
                break;
        }
        if (isValid.error) {
            throw new Error(`Invalid data in Treatment entity. ${isValid.error}`);
        }

        return Object.freeze({
            get specialisationId() { return data.specialisationId; },
            get name() { return data.name; },
            get images() { return data.images; },
            get productDescription() { return data.productDescription; },
            get price() { return data.price; },
            get size() { return data.size; },
            get patientInstruction() { return data.patientInstruction; },
            get isActive() { return data.isActive; },
            get isDeleted() { return data.isDeleted; },
        });
    };
}
module.exports = buildMakeTreatment;
