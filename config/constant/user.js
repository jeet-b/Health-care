module.exports = {
    ROLE:{
        PHYSICIAN : "PHYSICIAN",
        PATIENT : "PATIENT",
        SUPER_ADMIN : "SUPER_ADMIN",
        ADMIN : "ADMIN",
    },
    MASTER:{
        OTP:"123456"
    },
    POPULATE : [
        { path: "specialisations",populate:{path:"file"} },
        { path: "languageIds", select: "name code" },
        // {path: "occupation",select:'name code'},
        {
          path: "practiceAddressId",
          populate: [
            { path: "countryId", select: "name code", model: "country" },
            {
              path: "provinceId",
              select: "name code countryId",
              model: "province",
            },
            { path: "cityId", select: "name code provinceId", model: "city" },
            {
              path: "postalCodeId",
              select: "postalCode cityId",
              model: "postalCode",
            },
          ],
        },
        "profilePictureId",
        {
          path: "shippingAddress",
          populate: [
            { path: "countryId", select: "name code", model: "country" },
            {
              path: "provinceId",
              select: "name code countryId",
              model: "province",
            },
            { path: "cityId", select: "name code provinceId", model: "city" },
            {
              path: "postalCodeId",
              select: "postalCode cityId",
              model: "postalCode",
            },
          ],
        },
        { path: "genderId", select: "name code" },
        { path: "hearAboutUs", select: "name code" },
        "libraryPhotos",
        { path: "deactivationReason", select: "name code" },
        { path: "roleIds", select: "name code" },
    ],

    PATIENT_UNIQUE_PREFIX: 'PID-',
    PHYSICIAN_UNIQUE_PREFIX: 'PHID-'
}