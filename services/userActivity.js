const jwt = require("jsonwebtoken");
const authConstant = require("./../config/authConstant");
const db = require("./../config/db");
const User = require("./../model/user")(db);
const userActivity = require("./../model/userActivity")(db);
const routeArray = require("../config/activity");

async function getAuthUser(req) {
  if (
    req.headers.authorization &&
    req.headers.authorization.includes("Bearer")
  ) {
    try {
      let secretKey = req.originalUrl.includes("admin")
        ? authConstant.JWT.ADMIN_SECRET
        : authConstant.JWT.DEVICE_SECRET;
      let token = req.headers.authorization.split(" ")[1];
      const { exp } = jwt.decode(token, secretKey);
      if (Date.now() >= exp * 1000) {
        return { status: false, user: null, reason: "token expired!" };
      } else {
        let users = jwt.verify(token, secretKey);
        let userData = await User.findById(users.id);
        return {
          status: true,
          user: userData,
          reason: "token is still active!",
        };
      }
    } catch (error) {
      return { status: false, user: null, reason: error.message };
    }
  } else if (req.originalUrl.includes("login")) {
    let userData = await User.findOne({
      email: req.body.email,
      isActive: true,
    });
    if (userData) {
      return {
        status: true,
        user: userData,
        reason: "Account trying to log in!",
      };
    } else {
      return { status: false, user: null, reason: "Account not found!" };
    }
  } else {
    return { status: false, user: null, reason: "token expired!" };
  }
}

function getClientIP(req) {
  if (req.headers["x-forwarded-for"]) {
    return req.headers["x-forwarded-for"].split(",")[0];
  } else if (req.connection && req.connection.remoteAddress) {
    return req.connection.remoteAddress;
  } else {
    return req.ip;
  }
}

async function createActivity(req, res) {
  let authUser = { status: false, user: null, reason: "token expired!" };
  if (req) {
    authUser = await getAuthUser(req);
  }

  let activity_name = req.originalUrl
    .substring(1, req.originalUrl.length)
    .split("/")
    .join("_");
  let newActivity = {
    activityName: activity_name,
    frontend_route: "",
    device: "",
    route: req.originalUrl,
    response: {
      httpStatus: res.statusCode,
      method: req.method,
      message: res.data.MESSAGE,
      data: JSON.stringify(res.data.DATA),
    },
    ip: getClientIP(req),
    requestData: req.body,
    roleId: authUser.user ? authUser.user.roleIds[0] : null,
  };
  if (authUser.status == true) {
    newActivity.userId = authUser.user._id;
  } else if (req.headers.deviceId != null) {
    newActivity.device = req.headers.deviceId;
  } else if (req.headers.frontendRoute != null) {
    newActivity.frontend_route = req.headers.frontendRoute;
  }
  
  if (req.originalUrl !== undefined && routeArray.includes(req.route.path)) {
    await userActivity.create(newActivity);
  }
  return true;
}

module.exports = createActivity;
