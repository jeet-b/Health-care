const db = require("../../../config/db");
const Master = require("../../../model/master")(db);
const Transaction = require("../../../model/transaction")(db);
const { PAYMENT_STATUS, TIMEZONE } = require("../../../config/authConstant");
var ObjectId = require("mongodb").ObjectId;
const message = require("../../../utils/messages");
const responseCode = require("../../../utils/responseCode");
let moment = require("moment");
const { getTimezone } = require("countries-and-timezones");

const convertDateToLocalDate = (offset, startTime) => {
  try {
    if (offset >= 0) {
      startTime = moment(startTime).add(offset, "m").toDate();
      // endTime = moment(endTime).add(offset, "m").toDate();
    } else {
      startTime = moment(startTime).subtract(offset, "m").toDate();
      // endTime = moment(endTime).subtract(offset, "m").toDate();
    }
    return startTime;
  } catch (error) {
    console.error("Error - convertDateToLocalDate", error);
    throw new Error(error);
  }
};

function makeTransactionController({ transactionService, makeTransaction }) {
  const addTransaction = async ({ data }) => {
    try {
      const originalData = data;

      const transaction = makeTransaction(
        originalData,
        "insertTransactionValidator"
      );
      let createdTransaction = await transactionService.createDocument(
        transaction
      );

      return message.successResponse(
        { "Content-Type": "application/json" },
        responseCode.success,
        createdTransaction
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
  const revenueCount = async ({ data }, i18n) => {
    try {
      let date = new Date();
      let fromDate = new Date(date.getFullYear(), date.getMonth(), 1);
      let toDate = new Date(date.getFullYear(), date.getMonth() + 1, 1);
      let status = await Master.findOne({
        code: PAYMENT_STATUS.SUCCESS,
      }).select("_id");
      let aggregate = [
        {
          $facet: {
            total: [
              {
                $match: {
                  providerId: ObjectId(data.providerId),
                },
              },
              {
                $group: {
                  _id: "$providerId",
                  totalTransaction: {
                    $sum: {
                      $cond: [
                        {
                          $and: [
                            {
                              $eq: [ObjectId(status._id), "$status"],
                            },
                          ],
                        },
                        "$physicianAmount",
                        0,
                      ],
                    },
                  },
                },
              },
            ],
            monthly: [
              {
                $match: {
                  $and: [
                    { providerId: ObjectId(data.providerId) },
                    {
                      createdAt: {
                        $gte: fromDate,
                        $lte: toDate,
                      },
                    },
                  ],
                },
              },
              {
                $group: {
                  _id: "$providerId",
                  monthlyTransaction: {
                    $sum: {
                      $cond: [
                        {
                          $and: [
                            {
                              $eq: [ObjectId(status._id), "$status"],
                            },
                          ],
                        },
                        "$physicianAmount",
                        0,
                      ],
                    },
                  },
                },
              },
            ],
          },
        },
      ];

      let result = await Transaction.aggregate(aggregate);
      return message.successResponse(
        { "Content-Type": "application/json" },
        responseCode.success,
        result,
        i18n.t("transaction.revenueCount")
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

  const findAllTransaction = async ({ req }) => {
    try {
      // TODO uncomment this code in production
      // const timezoneOffset = req.user.preferredTimeZone
      // ? req.user.preferredTimeZone
      // : TIMEZONE;

      const timezoneOffset = TIMEZONE;
      let offset = getTimezone(timezoneOffset).utcOffsetStr;
      offset = moment().utcOffset(offset).utcOffset();
      const data = req.body;
      const i18n = req.i18n;
      let options = {};
      let query = {};
      let result;
      if (data.isCountOnly) {
        if (data.query !== undefined) {
          query = { ...data.query };
        }
        result = await transactionService.countDocument(query);
        if (result) {
          result = { totalRecords: result };
        } else {
          return message.recordNotFound(
            { "Content-Type": "application/json" },
            responseCode.success,
            i18n.t("response_message.recordNotFound")
          );
        }
      } else {
        if (data.options !== undefined) {
          options = { ...data.options };
        }
        if (data.query !== undefined) {
          query = { ...data.query };
        }
        let secondaryStatus = [
          PAYMENT_STATUS.SUCCESS,
          PAYMENT_STATUS.PAYMENT_FAILED,
          PAYMENT_STATUS.PENDING,
        ];
        let aggregateQuery = [];
        if (query.patientId != undefined) {
          aggregateQuery.push({
            $match: { patientId: ObjectId(query.patientId) },
          });
        } else if (query.providerId != undefined) {
          // console.log("inside");
          aggregateQuery.push({
            $match: {
              providerId: ObjectId(query.providerId),
              physicianAmount: { $exists: true },
              physicianAmount: { $ne: null },
            },
          });
        }
        if (secondaryStatus.includes(query.status)) {
          if (query.fromDate !== undefined && query.toDate !== undefined) {
            query.fromDate = new Date(query.fromDate);
            query.toDate = new Date(query.toDate);
            let matcher = {
              createdAt: {
                $gte: query.fromDate,
                $lte: query.toDate,
              },
            };
            aggregateQuery.push({ $match: matcher });
          } else if (query.date !== undefined) {
            query.fromDate = new Date(query.date);
            query.toDate = new Date(query.date);
            query.toDate.setDate(query.toDate.getDate() + 1);
            let matcher = {
              createdAt: {
                $gte: query.fromDate,
                $lte: query.toDate,
              },
            };
            aggregateQuery.push({ $match: matcher });
          }

          if (query.status == PAYMENT_STATUS.SUCCESS) {
            let masterData = await Master.findOne({
              code: PAYMENT_STATUS.SUCCESS,
            });
            matcher = {
              status: masterData._id,
            };
          } else if (query.status == PAYMENT_STATUS.PAYMENT_FAILED) {
            let masterData = await Master.findOne({
              code: PAYMENT_STATUS.PAYMENT_FAILED,
            });
            matcher = {
              status: masterData._id,
            };
          } else if (query.status == PAYMENT_STATUS.PENDING) {
            let masterData = await Master.findOne({
              code: PAYMENT_STATUS.PENDING,
            });
            matcher = {
              status: masterData._id,
            };
          }
          aggregateQuery.push({
            $match: matcher,
          });
          runnerResult = await Transaction.aggregate(aggregateQuery);
          let transactionIds = runnerResult.map((element) => {
            return element._id;
          });
          let nQuery = { _id: { $in: transactionIds } };
          result = await transactionService.getAllDocuments(nQuery, options);
        } else if (query.fromDate !== undefined && query.toDate !== undefined) {
          query.fromDate = new Date(query.fromDate);
          query.toDate = new Date(query.toDate);
          let matcher = {
            createdAt: {
              $gte: query.fromDate,
              $lte: query.toDate,
            },
          };
          aggregateQuery.push({ $match: matcher });
          runnerResult = await Transaction.aggregate(aggregateQuery);
          let transactionIds = runnerResult.map((element) => {
            return element._id;
          });
          let nQuery = { _id: { $in: transactionIds } };
          result = await transactionService.getAllDocuments(nQuery, options);
        } else if (query.date !== undefined) {
          query.fromDate = new Date(query.date);
          query.toDate = new Date(query.date);
          query.toDate.setDate(query.toDate.getDate() + 1);
          let matcher = {
            createdAt: {
              $gte: query.fromDate,
              $lte: query.toDate,
            },
          };
          aggregateQuery.push({ $match: matcher });
          runnerResult = await Transaction.aggregate(aggregateQuery);
          let transactionIds = runnerResult.map((element) => {
            return element._id;
          });
          let nQuery = { _id: { $in: transactionIds } };
          result = await transactionService.getAllDocuments(nQuery, options);
        } else {
          result = await transactionService.getAllDocuments(query, options);
        }
        if (result.docs != undefined) {
          result.docs = result.docs.filter(function (error, i) {
            // let createdAt = moment(result.docs[i].createdAt)
            // .tz(timezoneOffset).toDate();
            // console.log(createdAt);
            if (offset !== 0) {
              let convertedDate = convertDateToLocalDate(
                offset,
                result.docs[i].createdAt
              );
              result.docs[i].createdAt = convertedDate;
            }
            return result.docs[i];
          });
        }
        if (result) {
          return message.successResponse(
            { "Content-Type": "application/json" },
            responseCode.success,
            result,
            i18n.t("transaction.findAll")
          );
        } else {
          return message.badRequest(
            { "Content-Type": "application/json" },
            responseCode.badRequest,
            {},
            i18n.t("response_message.badRequest")
          );
        }
      }
    } catch (error) {
      return message.failureResponse(
        { "Content-Type": "application/json" },
        responseCode.internalServerError,
        error.message
      );
    }
  };
  const getTransactionById = async (id) => {
    try {
      if (id) {
        const transaction = await transactionService.getSingleDocumentById(id);
        return message.successResponse(
          { "Content-Type": "application/json" },
          responseCode.success,
          transaction
        );
      }
      return message.badRequest(
        { "Content-Type": "application/json" },
        responseCode.badRequest,
        {}
      );
    } catch (error) {
      return message.failureResponse(
        { "Content-Type": "application/json" },
        responseCode.internalServerError,
        error.message
      );
    }
  };
  const getTransactionCount = async (data) => {
    try {
      let where = {};
      if (data.where) {
        where = data.where;
      }
      let result = await transactionService.countDocument(where);
      if (result) {
        result = { totalRecords: result };
        return message.successResponse(
          { "Content-Type": "application/json" },
          responseCode.success,
          result
        );
      }
      return message.badRequest(
        { "Content-Type": "application/json" },
        responseCode.badRequest,
        {}
      );
    } catch (error) {
      return message.failureResponse(
        { "Content-Type": "application/json" },
        responseCode.internalServerError,
        error.message
      );
    }
  };
  const getTransactionByAggregate = async ({ data }) => {
    try {
      if (data) {
        let result = await transactionService.getDocumentByAggregation(data);
        if (result) {
          return message.successResponse(
            { "Content-Type": "application/json" },
            responseCode.success,
            result
          );
        }
      }
      return message.badRequest(
        { "Content-Type": "application/json" },
        responseCode.badRequest,
        {}
      );
    } catch (error) {
      return message.failureResponse(
        { "Content-Type": "application/json" },
        responseCode.internalServerError,
        error.message
      );
    }
  };
  const updateTransaction = async (data, id) => {
    try {
      if (id && data) {
        const transaction = makeTransaction(data, "updateTransactionValidator");
        const filterData = removeEmpty(transaction);
        let updatedTransaction =
          await transactionService.findOneAndUpdateDocument(
            { _id: id },
            filterData,
            { new: true }
          );
        return message.successResponse(
          { "Content-Type": "application/json" },
          responseCode.success,
          updatedTransaction
        );
      }
      return message.badRequest(
        { "Content-Type": "application/json" },
        responseCode.badRequest,
        {}
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
  const softDeleteTransaction = async (id) => {
    try {
      const deleteDependentService = require("../../../utils/deleteDependent");
      let pos = [
        {
          model: "invoice",
          refId: "transactionId",
        },
      ];
      await transactionService.softDeleteDocument(id);
      let result = await deleteDependentService.softDeleteTransaction({
        _id: id,
      });
      return message.successResponse(
        { "Content-Type": "application/json" },
        responseCode.success,
        result
      );
    } catch (error) {
      return message.failureResponse(
        { "Content-Type": "application/json" },
        responseCode.internalServerError,
        error.message
      );
    }
  };
  const bulkInsertTransaction = async ({ body }) => {
    try {
      let data = body.data;
      const transactionEntities = body.data.map((item) =>
        makeTransaction(item, "insertTransactionValidator")
      );
      const results = await transactionService.bulkInsert(transactionEntities);
      return message.successResponse(
        { "Content-Type": "application/json" },
        responseCode.success,
        results
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
  const bulkUpdateTransaction = async (data) => {
    try {
      if (data.filter && data.data) {
        const transaction = makeTransaction(
          data.data,
          "updateTransactionValidator"
        );
        const filterData = removeEmpty(transaction);
        const updatedTransactions = await transactionService.bulkUpdate(
          data.filter,
          filterData
        );
        return message.successResponse(
          { "Content-Type": "application/json" },
          responseCode.success,
          updatedTransactions
        );
      }
      return message.badRequest(
        { "Content-Type": "application/json" },
        responseCode.badRequest,
        {}
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
  const deleteTransaction = async (data, id) => {
    try {
      let possibleDependent = [
        {
          model: "invoice",
          refId: "transactionId",
        },
      ];
      const deleteDependentService = require("../../../utils/deleteDependent");
      if (data.isWarning) {
        let all = await deleteDependentService.countTransaction({ _id: id });
        return message.successResponse(
          { "Content-Type": "application/json" },
          responseCode.success,
          all
        );
      } else {
        let result = await deleteDependentService.deleteTransaction({
          _id: id,
        });
        if (result) {
          return message.successResponse(
            { "Content-Type": "application/json" },
            responseCode.success,
            result
          );
        }
      }
      return message.badRequest(
        { "Content-Type": "application/json" },
        responseCode.badRequest,
        {}
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

  const removeEmpty = (obj) => {
    let newObj = {};
    Object.keys(obj).forEach((key) => {
      if (obj[key] === Object(obj[key])) newObj[key] = removeEmpty(obj[key]);
      else if (obj[key] !== undefined) newObj[key] = obj[key];
    });
    return newObj;
  };
  return Object.freeze({
    addTransaction,
    revenueCount,
    findAllTransaction,
    getTransactionById,
    getTransactionCount,
    getTransactionByAggregate,
    updateTransaction,
    softDeleteTransaction,
    bulkInsertTransaction,
    bulkUpdateTransaction,
    deleteTransaction,
    removeEmpty,
  });
}

module.exports = makeTransactionController;
