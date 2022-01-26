const reportService = require("../../../services/report");
const message = require("../../../utils/messages");
const responseCode = require("../../../utils/responseCode");
const db = require("../../../config/db");
const User = require("../../../model/user")(db);
const Role = require("../../../model/role")(db);
const Appointment = require("../../../model/appointment")(db);
const Transaction = require("../../../model/transaction")(db);
const { USER_ROLE } = require("../../../config/authConstant");
const dbService = require("../../../services/mongoDbService");
const userService = require("../../../services/mongoDbService")({
  model: User,
});
const transactionService = require("../../../services/mongoDbService")({
  model: Transaction,
});

const exportNewUserReport = async (req, res) => {
  try {
    let options = {};
    let query = {};
    const body = req.queryParams;

    let { userType, fromDate, toDate } = body;
    let rolePatientData = await Role.findOne({ code: USER_ROLE.Patient });
    let rolePhysicianData = await Role.findOne({ code: USER_ROLE.Physician });
    query.roleIds =
      userType === USER_ROLE.Physician ? rolePhysicianData : rolePatientData;
    if (body.fromDate && body.toDate) {
      query.createdAt = {
        $gte: new Date(fromDate),
        $lte: new Date(toDate),
      };
    }
    options.populate = ["roleIds"];
    options.pagination = false;
    const result = await userService.getAllDocuments(query, options);
    let columns = [
      { header: "User Name", key: "name" },
      { header: "User Type", key: "roleIds" },
      { header: "Date of Signup", key: "createdAt" },
    ];
    const finalData = [];
    for (let i = 0; i < result.data.length; i++) {
      const doc = result.data[i].toObject();
      doc._id = doc._id.toString();
      // doc.name = (doc.firstName && doc.lastName) ? doc.firstName + " " + doc.lastName : (doc.firstName) ? doc.firstName : (doc.lastName) ? doc.lastName : " " ;
      doc.roleIds = doc.roleIds[0].name;
      finalData.push(doc);
    }
    const data = finalData;
    const workbook = await reportService.exportToExcel(
      "NewUserReport",
      columns,
      data
    );
    if (workbook) {
      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      res.setHeader(
        "Content-Disposition",
        "attachment; filename=" + "NewUserReport.xlsx"
      );
      workbook.xlsx.write(res).then(function () {
        res.end();
      });
    }

    return message.successResponse(
      { "Content-Type": "application/json" },
      responseCode.success,
      result
    );
  } catch (error) {
    if (error.name === "ValidationError") {
      return message.inValidParam(
        { "Content-Type": "application/json" },
        responseCode.validationError,
        error.message
      );
    }
    return message.failureResponse(
      { "Content-Type": "application/json" },
      responseCode.internalServerError,
      error.message
    );
  }
};

const physicianReport = async (req, res) => {
  try {
    let options = {};
    let query = {};
    let aggregate = [];
    const body = req.queryParams;
    let { fromDate, toDate } = body;
    if (fromDate !== undefined && toDate !== undefined) {
      // result = await extractDateWise(type);
      aggregate.push({
        $match: {
          createdAt: {
            $gte: new Date(fromDate),
            $lte: new Date(toDate),
          },
        },
      });
    }
    aggregate.push(
      {
        $match: {
          availableSlotId: { $exists: true },
          providerId: { $exists: true },
        },
      },
      {
        $lookup: {
          from: "user",
          localField: "providerId",
          foreignField: "_id",
          as: "provider",
        },
      },
      {
        $unwind: {
          path: "$provider",
        },
      },
      {
        $group: {
          _id: "$provider",
          count: { $sum: 1 },
        },
      },
      // {
      //   $project: {
      //     providerName: "$provider.name",
      //     email: "$provider.email",
      //     phone: "$provider.phone",
      //     rating: "$provider.averageRating",
      //     count: "$count",
      //   },
      // },
      // {
      // {
      //   $facet: {
      //     // metadata: [{ $count: "provider" }],
      //     data: [{ $skip: 0 }, { $limit: 100 }, { $sort: { _id: 1 } }],
      //   },
      // }
    );
    const result = await Appointment.aggregate(aggregate);
    let columns = [
        {header: 'Physician name', key: 'name'},
        {header: 'email', key: 'email'},
        {header: 'phone', key: 'phone'},
        {header: 'Rating', key: 'averageRating'},
        {header: 'Count of appointments', key: 'count'},
      ]
    const finalData = [];
    for(let i=0; i<result.length; i++){
        const doc = result[i];
        // doc.name = (doc.firstName && doc.lastName) ? doc.firstName + " " + doc.lastName : (doc.firstName) ? doc.firstName : (doc.lastName) ? doc.lastName : " " ;
        doc.name = doc._id.name;
        doc.email = doc._id.email;
        doc.phone = doc._id.phone;
        doc.averageRating = doc._id.averageRating;
        finalData.push(doc);
    }
    const data = finalData;
    const workbook = await reportService.exportToExcel("PhysicianReport",columns,data);
    if (workbook) {
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader("Content-Disposition", "attachment; filename=" + "PhysicianReport.xlsx");
    workbook.xlsx.write(res)
        .then(function(){
        res.end()
    });
    }

    return message.successResponse(
      { "Content-Type": "application/json" },
      responseCode.success,
      result
    );
  } catch (error) {
    if (error.name === "ValidationError") {
      return message.inValidParam(
        { "Content-Type": "application/json" },
        responseCode.validationError,
        error.message
      );
    }
    return message.failureResponse(
      { "Content-Type": "application/json" },
      responseCode.internalServerError,
      error.message
    );
  }
};

const exportTransactionReport = async (req, res) => {
  try {
    let options = {};
    let query = {};
    const body = req.queryParams;

    let { fromDate, toDate } = body;
    if (body.fromDate && body.toDate) {
      query.createdAt = {
        $gte: new Date(fromDate),
        $lte: new Date(toDate),
      };
    }
    options.populate = [
      "status",
      { path: "orderId", populate: { path: "specialisationId" } },
    ];
    options.pagination = false;
    const result = await transactionService.getAllDocuments(query, options);
    let columns = [
      { header: "Transaction Id", key: "paymentTransactionId" },
      { header: "Patient Name", key: "patientName" },
      { header: "Physician Name", key: "providerName" },
      { header: "Date Of Payment", key: "createdAt" },
      { header: "Service Name", key: "serviceName" },
      { header: "Status of payment", key: "status" },
      { header: "Transaction amount", key: "amount" },

    ];
    const finalData = [];
    for (let i = 0; i < result.data.length; i++) {
      const doc = result.data[i].toObject();
      doc._id = doc._id.toString();
      // doc.name = (doc.firstName && doc.lastName) ? doc.firstName + " " + doc.lastName : (doc.firstName) ? doc.firstName : (doc.lastName) ? doc.lastName : " " ;
      // doc.roleIds = doc.roleIds[0].name;
      doc.patientName = doc.patient.name;
      doc.providerName = doc.provider.name;
      doc.serviceName = doc.orderId.specialisationId.name;
      doc.status = doc.status.name
      finalData.push(doc);
    }
    const data = finalData;
    const workbook = await reportService.exportToExcel(
      "TransactionReport",
      columns,
      data
    );
    if (workbook) {
      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      res.setHeader(
        "Content-Disposition",
        "attachment; filename=" + "TransactionReport.xlsx"
      );
      workbook.xlsx.write(res).then(function () {
        res.end();
      });
    }

    return message.successResponse(
      { "Content-Type": "application/json" },
      responseCode.success,
      result
    );
  } catch (error) {
    if (error.name === "ValidationError") {
      return message.inValidParam(
        { "Content-Type": "application/json" },
        responseCode.validationError,
        error.message
      );
    }
    return message.failureResponse(
      { "Content-Type": "application/json" },
      responseCode.internalServerError,
      error.message
    );
  }
};

const averageTransaction = async ({ req }) => {
  try {
    let result = await reportService.averageTransaction(req.body);
    return message.successResponse(
      { "Content-Type": "application/json" },
      responseCode.success,
      result
    );
  } catch (error) {
    if (error.name === "ValidationError") {
      return message.inValidParam(
        { "Content-Type": "application/json" },
        responseCode.validationError,
        error.message
      );
    }
    return message.failureResponse(
      { "Content-Type": "application/json" },
      responseCode.internalServerError,
      error.message
    );
  }
};

module.exports = {
  exportNewUserReport,
  physicianReport,
  exportTransactionReport,
  averageTransaction,
};
