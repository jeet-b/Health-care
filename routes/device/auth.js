const express = require("express");
const router = express.Router();
const adaptRequest = require("../../helpers/adaptRequest");
const sendResponse = require("../../helpers/sendResponse");
const authController = require("../../controller/device/authentication");
const auth = require("../../middleware/auth");
const checkRolePermission = require("../../middleware/checkRolePermission");

router.post("/register", (req, res, next) => {
  req = adaptRequest(req);
  authController.register({ data: req.body }, req.i18n).then((result) => {
    sendResponse(res, result);
  });
});
router.post("/login", (req, res, next) => {
  req = adaptRequest(req);
  authController
    .authentication(req)
    .then((result) => {
      sendResponse(res, result);
    })
    .catch((e) => {
      sendResponse(res, e);
    });
});
router.post("/forgot-password", (req, res, next) => {
  req = adaptRequest(req);
  authController
    .forgotPassword(req.body, req.i18n)
    .then((result) => {
      sendResponse(res, result);
    })
    .catch((e) => {
      sendResponse(res, e);
    });
});
router.post("/verify-email", (req, res, next) => {
  req = adaptRequest(req);
  authController
    .verifyEmail(req)
    .then((result) => {
      sendResponse(res, result);
    })
    .catch((e) => {
      sendResponse(res, e);
    });
});

router.post("/verify-phone", (req, res, next) => {
  req = adaptRequest(req);
  authController
    .verifyPhone(req)
    .then((result) => {
      sendResponse(res, result);
    })
    .catch((e) => {
      sendResponse(res, e);
    });
});

router.post("/validate-otp", (req, res, next) => {
  req = adaptRequest(req);
  authController
    .validateResetPasswordOtp(req.body, req.i18n)
    .then((result) => {
      sendResponse(res, result);
    })
    .catch((e) => {
      sendResponse(res, e);
    });
});

router.put("/reset-password", (req, res, next) => {
  req = adaptRequest(req);
  authController
    .resetPassword(req.body, req.i18n)
    .then((result) => {
      sendResponse(res, result);
    })
    .catch((e) => {
      sendResponse(res, e);
    });
});

router.put("/reset-password-by-link", (req, res, next) => {
  req = adaptRequest(req);
  authController
    .resetPasswordByLink(req.body, req.i18n)
    .then((result) => {
      sendResponse(res, result);
    })
    .catch((e) => {
      sendResponse(res, e);
    });
});

router.post("/resendEmailOTP", (req, res, next) => {
  req = adaptRequest(req);
  authController
    .resendEmail(req.body, req.i18n)
    .then((result) => {
      sendResponse(res, result);
    })
    .catch((e) => {
      sendResponse(res, e);
    });
});

router.post("/resendPhoneOTP", (req, res, next) => {
  req = adaptRequest(req);
  authController
    .resendPhone(req.body, req.i18n)
    .then((result) => {
      sendResponse(res, result);
    })
    .catch((e) => {
      sendResponse(res, e);
    });
});
router.post(
  "/add-sns-token",
  auth(...["createByUserInDevicePlatform", "createByAdminInDevicePlatform"]),
  (req, res, next) => {
    req = adaptRequest(req);
    authController
      .notificationIdentifierSnsUpsert({ req })
      .then((result) => {
        sendResponse(res, result);
      })
      .catch((e) => {
        sendResponse(res, e);
      });
  }
);
router.post(
  "/logout",
  auth(...["createByUserInDevicePlatform", "createByAdminInDevicePlatform"]),checkRolePermission,
  (req, res, next) => {
    req = adaptRequest(req);
    authController
      .logout({ req })
      .then((result) => {
        sendResponse(res, result);
      })
      .catch((e) => {
        sendResponse(res, e);
      });
  }
);

module.exports = router;
