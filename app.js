const express = require("express");
const cron = require("node-cron");
const cors = require("cors");
const path = require("path");
const http = require("http");
const fs = require("fs");
const dotenv = require("dotenv");
const socket = require("./services/socketService");
dotenv.config();
global.__basedir = __dirname;
const ejs = require("ejs");
const listEndpoints = require("express-list-endpoints");
let cookieParser = require("cookie-parser");
let logger = require("morgan");
const passport = require("passport");
const fileUpload = require("express-fileupload");
const cronService = require("./services/cron");
const { adminPassportStrategy } = require("./config/adminPassportStrategy");
const { devicePassportStrategy } = require("./config/devicePassportStrategy");
const rateLimit = require("express-rate-limit");
const i18next = require("i18next");
const i18nextMiddleware = require("i18next-express-middleware");
const FilesystemBackend = require("i18next-node-fs-backend");
const {
  MAX_REQUEST_PER_TIME,
  MAX_TIME_PER_REQUEST,
  TOO_MANY_REQUEST_MESSAGE,
} = require("./config/authConstant");

const limiter = rateLimit({
  windowMs: MAX_TIME_PER_REQUEST, // 1 minute
  max: MAX_REQUEST_PER_TIME, // limit each IP to 200 requests per windowMs
  message: TOO_MANY_REQUEST_MESSAGE,
});
const constants = require("./config/constant/socket");
const app = express();
app.use(cors());

//template engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

//all routes
const routes = require("./routes/index");

//jobs configuration
require("./jobs/index");

i18next
  .use(FilesystemBackend)
  .use(i18nextMiddleware.LanguageDetector)
  .init({
    backend: {
      loadPath: path.join(__dirname, "/locales/en.json"),
      addPath: path.join(__dirname, "/locales/en.json"),
    },
    detection: {
      order: ["querystring", "cookie"],
      caches: ["cookie"],
    },
    fallbackLng: "en",
    preload: ["en"],
  });
app.use(i18nextMiddleware.handle(i18next));
app.use(limiter);
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use(
  fileUpload({
    createParentPath: true,
  })
);
app.use(routes);

adminPassportStrategy(passport);
devicePassportStrategy(passport);
const seeder = require("./seeders");
const allRegisterRoutes = listEndpoints(app);
seeder(allRegisterRoutes);

cron.schedule("* * * * *", function () {
  cronService.disablePastAvailableSlot();
  cronService.appointmentReminder();
  cronService.videoCallReminder();
  cronService.interruptedAppointment();
  // cronService.refundPatient();
});
cron.schedule("0 0 * * *", function () {
  cronService.deleteUnfilledAppointments();
  cronService.addAvailableSlot();
  cronService.followUpMailForTreatment();
  cronService.treatmentPaymentReminder();
});

let logoPath = path.join(__dirname, "./assets/images/logo.png");
let footerPath = path.join(__dirname, "./assets/images/footerLogo.png");

global.logoPath64 = base64_encode(logoPath);
global.footerPath64 = base64_encode(footerPath);
global.appUrl = process.env.appUrl;
function base64_encode(f) {
  // read binary data
  var bitmap = fs.readFileSync(f);
  // convert binary data to base64 encoded string
  return new Buffer(bitmap).toString("base64");
}

//allowing to open the server socket package path publically.
app.use("/socket", express.static(__dirname + "/node_modules/socket.io/client-dist"));

let server = http.createServer(app);
let io = require("socket.io")(server, {
  cors: {
    origin: "*",
  },
});
io.on("connection", function (client) {
  console.log("Socket handshake done!");
  // id, name of user from client side
  client.on("init", async function (received) {
    if (received) {
      console.log(`User: ${received.name}`);
      client.join(constants.SOCKET_CHANNEL);
    } else {
      console.log(`Initialization failed: ${received}`);
    }
  });
});

server.listen(process.env.PORT, () => {
  console.log(`Server is running on port: ${process.env.PORT}`);
});

exports.io = io;

// socket.socket.io.attach(server);
