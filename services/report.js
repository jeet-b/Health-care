const db = require("../config/db");
const User = require("../model/user")(db);
const Appointment = require("../model/appointment")(db);
const Role = require("../model/role")(db);
const Transaction = require("../model/transaction")(db);
const moment = require("moment");
const mongoose = require("mongoose");
const { USER_ROLE, REPORT_FILTER } = require("../config/authConstant");
const _ = require("lodash");
const dbservice = require("../services/mongoDbService");
const transaction = require("../model/transaction");
const userService = require("../services/mongoDbService")({
  model: User,
});
const transactionService = require("../services/mongoDbService")({
  model: Transaction,
});
const excel = require("exceljs");

const extractDateWise = async (type) => {
  if (type === REPORT_FILTER.WEEK) {
    fromDate = moment().subtract(6, "days").format("YYYY-MM-DD");
    toDate = moment().add(1, "d").format("YYYY-MM-DD");
  } else if (type === REPORT_FILTER.MONTH) {
    var date = new Date();
    fromDate = new Date(date.getFullYear(), date.getMonth(), 1);
    toDate = new Date(date.getFullYear(), date.getMonth() + 1, 1);
  } else if (type === REPORT_FILTER.HALFYEAR) {
    var date = new Date();
    fromDate = new Date(date.getFullYear(), date.getMonth() - 5, 1);
    toDate = new Date(date.getFullYear(), date.getMonth() + 1, 1);
  } else {
    var date = new Date();
    fromDate = new Date(date.getFullYear(), 0, 1);
    toDate = new Date(date.getFullYear() + 1, 0, 1);
  }
  return { fromDate, toDate };
};
module.exports = {
  newUserCount: async (body) => {
    try {
      let { userType, type, fromDate, toDate } = body;
      let group = {};
      let aggregate = [];
      let query = {};
      let options = {};
      if (body.query !== undefined) {
        query = {
          ...body.query,
        };
      }
      if (body.options !== undefined) {
        options = {
          ...body.options,
        };
      }
      if (query.name != undefined && query.email != undefined) {
        aggregate.push(
          {
            $addFields: {
              matchName: {
                $regexMatch: {
                  input: "$name",
                  regex: query.name,
                  options: "i",
                },
              },
            },
          },
          {
            $addFields: {
              matchEmail: {
                $regexMatch: {
                  input: "$email",
                  regex: query.email,
                  options: "i",
                },
              },
            },
          },
          {
            $match: {
              $or: [
                {
                  matchName: {
                    $eq: true,
                  },
                },
                {
                  matchEmail: {
                    $eq: true,
                  },
                },
              ],
            },
          }
        );
      }
      if (userType === USER_ROLE.Physician) {
        let roleData = await Role.findOne({ code: USER_ROLE.Physician });
        aggregate.push({
          $match: {
            roleIds: {
              $eq: roleData._id,
            },
          },
        });
      } else {
        let roleData = await Role.findOne({ code: USER_ROLE.Patient });
        aggregate.push({
          $match: {
            roleIds: {
              $eq: roleData._id,
            },
          },
        });
      }
      let result;
      if (fromDate === undefined && toDate === undefined) {
        result = await extractDateWise(type);
        aggregate.push({
          $match: {
            createdAt: {
              $gte: new Date(result.fromDate),
              $lte: new Date(result.toDate),
            },
          },
        });
      } else {
        aggregate.push({
          $match: {
            createdAt: {
              $gte: new Date(fromDate),
              $lte: new Date(toDate),
            },
          },
        });
      }
      if (type === REPORT_FILTER.WEEK || type === REPORT_FILTER.MONTH) {
        aggregate.push(
          {
            $addFields: {
              cDate: {
                $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
              },
            },
          },
          {
            $group: {
              _id: "$cDate",
              count: { $sum: 1 },
            },
          },
          {
            $sort: { _id: options.sort },
          }
        );
      } else if (type === REPORT_FILTER.HALFYEAR) {
        aggregate.push(
          {
            $addFields: {
              cDate: {
                $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
              },
            },
          },
          {
            $group: {
              _id: {
                week: {
                  $week: "$createdAt",
                },
                month: {
                  $month: "$createdAt",
                },
                year: {
                  $year: "$createdAt",
                },
              },
              cDate: {
                $first: "$cDate",
              },
              count: { $sum: 1 },
            },
          },
          {
            $sort: { cDate: options.sort },
          }
        );
      } else if (type === REPORT_FILTER.YEAR) {
        aggregate.push(
          {
            $addFields: {
              cDate: {
                $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
              },
            },
          },
          {
            $group: {
              _id: {
                month: {
                  $month: "$createdAt",
                },
                year: {
                  $year: "$createdAt",
                },
              },
              cDate: {
                $first: "$cDate",
              },
              count: { $sum: 1 },
            },
          },
          {
            $sort: { cDate: options.sort },
          }
        );
      }
      const count = await User.aggregate(aggregate);
      if (count) {
        return count;
      } else {
        throw new Error("Error while fetching data from database");
      }
    } catch (error) {
      throw new Error(error);
    }
  },

  newUserReport: async (body) => {
    try {
      var { userType, type, fromDate, toDate } = body;
      let options = {};
      let query = {};
      if (body.options !== undefined) {
        options = {
          ...body.options,
        };
      }
      if (body.query !== undefined) {
        query = {
          ...body.query,
        };
      }
      let dateFormat;
      let rolePatientData = await Role.findOne({ code: USER_ROLE.Patient });
      let rolePhysicianData = await Role.findOne({ code: USER_ROLE.Physician });
      query.roleIds =
        userType === USER_ROLE.Physician ? rolePhysicianData : rolePatientData;
      if (fromDate === undefined && toDate === undefined) {
        dateFormat = await extractDateWise(type);
        query.createdAt = {
          $gte: new Date(dateFormat.fromDate),
          $lte: new Date(dateFormat.toDate),
        };
      } else {
        query.createdAt = {
          $gte: new Date(fromDate),
          $lte: new Date(toDate),
        };
      }
      //   if (body.method === "GET") {
      //     options.pagination = false;
      //   }
      let result = await userService.getAllDocuments(query, options);
      if (result) {
        return result;
      } else {
        throw new Error("Error while fetching data from database");
      }
    } catch (error) {
      throw new Error(error);
    }
  },

  physicianAppointmentCount: async (body) => {
    try {
      let { type, fromDate, toDate } = body;
      let aggregate = [];
      let query = {};
      let options = {};

      if (body.query !== undefined) {
        query = {
          ...body.query,
        };
      }
      if (body.options !== undefined) {
        options = {
          ...body.options,
        };
      }
      let result;
      if (fromDate === undefined && toDate === undefined) {
        result = await extractDateWise(type);
        aggregate.push({
          $match: {
            createdAt: {
              $gte: new Date(result.fromDate),
              $lte: new Date(result.toDate),
            },
          },
        });
      } else {
        aggregate.push({
          $match: {
            createdAt: {
              $gte: new Date(fromDate),
              $lte: new Date(toDate),
            },
          },
        });
      }
      if (query.name != undefined && query.email != undefined) {
        aggregate.push(
          {
            $match: {
              availableSlotId: { $exists: true },
              providerId: { $exists: true },
            },
          },
          {
            $lookup: {
              from: "availableSlot",
              localField: "availableSlotId",
              foreignField: "_id",
              as: "availableSlot",
            },
          },
          {
            $unwind: {
              path: "$availableSlot",
            },
          },
          {
            $lookup: {
              from: "user",
              let: { id: "$providerId" },
              pipeline: [
                { $match: { $expr: { $eq: ["$_id", "$$id"] } } },
                {
                  $match: {
                    $or: [
                      { name: { $regex: query.name, $options: "i" } },
                      { email: { $regex: query.email, $options: "i" } },
                    ],
                  },
                },
              ],
              as: "provider",
            },
          },
          {
            $unwind: {
              path: "$provider",
            },
          }
        );
      } else {
        aggregate.push(
          {
            $match: {
              availableSlotId: { $exists: true },
              providerId: { $exists: true },
            },
          },
          {
            $lookup: {
              from: "availableSlot",
              localField: "availableSlotId",
              foreignField: "_id",
              as: "availableSlot",
            },
          },
          {
            $unwind: {
              path: "$availableSlot",
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
          }
        );
      }
      if (type === REPORT_FILTER.WEEK || type === REPORT_FILTER.MONTH) {
        aggregate.push(
          {
            $addFields: {
              cDate: {
                $dateToString: { format: "%Y-%m-%d", date: "$availableSlot.startTime" },
              },
            },
          },
          {
            $group: {
              _id: {
                day: {
                  $dayOfMonth: "$availableSlot.startTime",
                },
                month: {
                  $month: "$availableSlot.startTime",
                },
                year: {
                  $year: "$availableSlot.startTime",
                },
                provider: "$provider.name",
              },
              totalCount: { $sum: 1 },
              cDate:{
                $first:"$cDate"
              }
            },
          },
          {
            $group: {
              _id: {
                day: "$_id.day",
                month: "$_id.month",
                year: "$_id.year",
              },
              provider: {
                $push: { name: "$_id.provider", count: "$totalCount" },
              },
              cDate:{
                $first: "$cDate"
              }
            },
          },
          {
            $sort: { cDate: options.sort },
          }
        );
      } else if (type === REPORT_FILTER.HALFYEAR) {
        aggregate.push(
          {
            $addFields: {
              cDate: {
                $dateToString: { format: "%Y-%m-%d", date: "$availableSlot.startTime" },
              },
            },
          },
          {
            $group: {
              _id: {
                week: {
                  $week: "$availableSlot.startTime",
                },
                month: {
                  $month: "$availableSlot.startTime",
                },
                year: {
                  $year: "$availableSlot.startTime",
                },
                provider: "$provider.name",
              },
              totalCount: { $sum: 1 },
              cDate:{
                $first:"$cDate"
              }
            },
          },
          {
            $group: {
              _id: {
                week: "$_id.week",
                month: "$_id.month",
                year: "$_id.year",
              },
              provider: {
                $push: { name: "$_id.provider", count: "$totalCount" },
              },
              cDate:{
                $first:"$cDate"
              }
            },
          },
          {
            $sort: { cDate: options.sort },
          }
        );
      } else if (type === REPORT_FILTER.YEAR) {
        aggregate.push(
          {
            $addFields: {
              cDate: {
                $dateToString: { format: "%Y-%m-%d", date: "$availableSlot.startTime" },
              },
            },
          },
          {
            $group: {
              _id: {
                month: {
                  $month: "$availableSlot.startTime",
                },
                year: {
                  $year: "$availableSlot.startTime",
                },
                provider: "$provider.name",
              },
              totalCount: { $sum: 1 },
              cDate:{
                $first:"$cDate"
              }
            },
          },
          {
            $group: {
              _id: {
                month: "$_id.month",
                year: "$_id.year",
              },
              provider: {
                $push: { name: "$_id.provider", count: "$totalCount" },
              },
              cDate:{
                $first:"$cDate"
              }
            },
          },
          {
            $sort: { cDate: options.sort },
          }
        );
      }
      // aggregate.push({
      //   $sort: options.sort,
      // });
      const count = await Appointment.aggregate(aggregate);
      if (count) {
        return count;
      } else {
        throw new Error("Error while fetching data from database");
      }
    } catch (error) {
      throw new Error(error);
    }
  },

  physicianReport: async (body) => {
    try {
      var { type, fromDate, toDate } = body;
      let aggregate = [];
      let options = {};
      let query = {};
      if (body.options !== undefined) {
        options = {
          ...body.options,
        };
      }
      if (body.query !== undefined) {
        query = {
          ...body.query,
        };
      }
      if (fromDate !== undefined && toDate !== undefined) {
        aggregate.push({
          $match: {
            createdAt: {
              $gte: new Date(fromDate),
              $lte: new Date(toDate),
            },
          },
        });
      }
      if (query.name != undefined && query.email != undefined) {
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
              let: { id: "$providerId" },
              pipeline: [
                { $match: { $expr: { $eq: ["$_id", "$$id"] } } },
                {
                  $match: {
                    $or: [
                      { name: { $regex: query.name, $options: "i" } },
                      { email: { $regex: query.email, $options: "i" } },
                    ],
                  },
                },
              ],
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
          {
            $lookup: {
              from: "file",
              localField: "_id.profilePictureId",
              foreignField: "_id",
              as: "profilePicture",
            },
          },
          {
            $facet: {
              data: [
                { $skip: options.offset },
                { $limit: options.limit },
                { $sort: options.sort },
              ],
            },
          }
        );
      } else {
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
          {
            $lookup: {
              from: "file",
              localField: "_id.profilePictureId",
              foreignField: "_id",
              as: "profilePicture",
            },
          },
          {
            $facet: {
              data: [
                { $skip: options.offset },
                { $limit: options.limit },
                { $sort: options.sort },
              ],
            },
          }
        );
      }
      const result = await Appointment.aggregate(aggregate);
      if (result) {
        return result;
      } else {
        throw new Error("Error while fetching data from database");
      }
    } catch (error) {
      throw new Error(error);
    }
  },

  transactionFrequency: async (body) => {
    try {
      let { type, fromDate, toDate } = body;
      let group = {};
      let aggregate = [];
      let query = {};
      let options = {};
      if (body.query !== undefined) {
        query = {
          ...body.query,
        };
      }
      if (body.options !== undefined) {
        options = {
          ...body.options,
        };
      }
      if (query.name != undefined) {
        aggregate.push(
          {
            $addFields: {
              matchName: {
                $regexMatch: {
                  input: "$patient.name",
                  regex: query.name,
                  options: "i",
                },
              },
            },
          },
          {
            $match: {
              matchName: {
                $eq: true,
              },
            },
          }
        );
      }
      let result;
      if (fromDate === undefined && toDate === undefined) {
        result = await extractDateWise(type);
        aggregate.push({
          $match: {
            createdAt: {
              $gte: new Date(result.fromDate),
              $lte: new Date(result.toDate),
            },
          },
        });
      } else {
        aggregate.push({
          $match: {
            createdAt: {
              $gte: new Date(fromDate),
              $lte: new Date(toDate),
            },
          },
        });
      }
      if (type === REPORT_FILTER.WEEK || type === REPORT_FILTER.MONTH) {
        aggregate.push(
          {
            $addFields: {
              cDate: {
                $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
              },
            },
          },
          {
            $group: {
              _id: "$cDate",
              count: { $sum: 1 },
            },
          },
          {
            $sort: { _id: options.sort },
          }
        );
      } else if (type === REPORT_FILTER.HALFYEAR) {
        aggregate.push(
          {
            $addFields: {
              cDate: {
                $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
              },
            },
          },
          {
            $group: {
              _id: {
                week: {
                  $week: "$createdAt",
                },
                month: {
                  $month: "$createdAt",
                },
                year: {
                  $year: "$createdAt",
                },
              },
              cDate: {
                $first: "$cDate",
              },
              count: { $sum: 1 },
            },
          },
          {
            $sort: { cDate: options.sort },
          }
        );
      } else if (type === REPORT_FILTER.YEAR) {
        aggregate.push(
          {
            $addFields: {
              cDate: {
                $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
              },
            },
          },
          {
            $group: {
              _id: {
                month: {
                  $month: "$createdAt",
                },
                year: {
                  $year: "$createdAt",
                },
              },
              cDate: {
                $first: "$cDate",
              },
              count: { $sum: 1 },
            },
          },
          {
            $sort: { cDate: options.sort },
          }
        );
      }

      const count = await Transaction.aggregate(aggregate);
      if (count) {
        return count;
      } else {
        throw new Error("Error while fetching data from database");
      }
    } catch (error) {
      throw new Error(error);
    }
  },

  transactionFrequencyReport: async (body) => {
    try {
      let { type, fromDate, toDate } = body;
      let group = {};
      let aggregate = [];
      let query = {};
      let options = {};
      if (body.query !== undefined) {
        query = {
          ...body.query,
        };
      }
      if (body.options !== undefined) {
        options = {
          ...body.options,
        };
      }
      let result;
      if (fromDate !== undefined && toDate !== undefined) {
        query.createdAt = {
          $gte: new Date(fromDate),
          $lte: new Date(toDate),
        };
      }
      const count = await transactionService.getAllDocuments(query, options);
      if (count) {
        return count;
      } else {
        throw new Error("Error while fetching data from database");
      }
    } catch (error) {
      throw new Error(error);
    }
  },

  averageTransaction: async (body) => {
    try {
      let { type, fromDate, toDate } = body;
      let group = {};
      let aggregate = [];
      let query = {};
      let options = {};
      if (body.query !== undefined) {
        query = {
          ...body.query,
        };
      }
      if (body.options !== undefined) {
        options = {
          ...body.options,
        };
      }
      if (query.name != undefined) {
        aggregate.push(
          {
            $addFields: {
              matchName: {
                $regexMatch: {
                  input: "$patient.name",
                  regex: query.name,
                  options: "i",
                },
              },
            },
          },
          {
            $match: {
              matchName: {
                $eq: true,
              },
            },
          }
        );
      }
      let result;
      if (fromDate === undefined && toDate === undefined) {
        result = await extractDateWise(type);
        aggregate.push({
          $match: {
            createdAt: {
              $gte: new Date(result.fromDate),
              $lte: new Date(result.toDate),
            },
          },
        });
      } else {
        aggregate.push({
          $match: {
            createdAt: {
              $gte: new Date(fromDate),
              $lte: new Date(toDate),
            },
          },
        });
      }
      if (type === REPORT_FILTER.WEEK || type === REPORT_FILTER.MONTH) {
        aggregate.push(
          {
            $addFields: {
              cDate: {
                $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
              },
            },
          },
          {
            $group: {
              _id: "$cDate",
              totalTransaction: { $sum: "$amount" },
              count: { $sum: 1 },
            },
          },
          {
            $addFields: {
              averageTransactionCount: {
                $divide: ["$totalTransaction", "$count"],
              },
            },
          },
          {
            $sort: { _id: options.sort },
          }
        );
      } else if (type === REPORT_FILTER.HALFYEAR) {
        aggregate.push(
          {
            $addFields: {
              cDate: {
                $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
              },
            },
          },
          {
            $group: {
              _id: {
                week: {
                  $week: "$createdAt",
                },
                month: {
                  $month: "$createdAt",
                },
                year: {
                  $year: "$createdAt",
                },
              },
              cDate: {
                $first: "$cDate",
              },
              totalTransaction: { $sum: "$amount" },
              count: { $sum: 1 },
            },
          },
          {
            $addFields: {
              averageTransactionCount: {
                $divide: ["$totalTransaction", "$count"],
              },
            },
          },
          {
            $sort: { cDate: options.sort },
          }
        );
      } else if (type === REPORT_FILTER.YEAR) {
        aggregate.push(
          {
            $addFields: {
              cDate: {
                $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
              },
            },
          },
          {
            $group: {
              _id: {
                month: {
                  $month: "$createdAt",
                },
                year: {
                  $year: "$createdAt",
                },
              },
              cDate: {
                $first: "$cDate",
              },
              totalTransaction: { $sum: "$amount" },
              count: { $sum: 1 },
            },
          },
          {
            $addFields: {
              averageTransactionCount: {
                $divide: ["$totalTransaction", "$count"],
              },
            },
          },
          {
            $sort: { cDate: options.sort },
          }
        );
      }
      const count = await Transaction.aggregate(aggregate);
      if (count) {
        return count;
      } else {
        throw new Error("Error while fetching data from database");
      }
    } catch (error) {
      throw new Error(error);
    }
  },

  revenueCount: async (body) => {
    try {
      let { type, fromDate, toDate } = body;
      let group = {};
      let aggregate = [];
      let query = {};
      let options = {};
      if (body.query !== undefined) {
        query = {
          ...body.query,
        };
      }
      if (body.options !== undefined) {
        options = {
          ...body.options,
        };
      }
      if (query.name != undefined) {
        aggregate.push(
          {
            $addFields: {
              matchName: {
                $regexMatch: {
                  input: "$patient.name",
                  regex: query.name,
                  options: "i",
                },
              },
            },
          },
          {
            $match: {
              matchName: {
                $eq: true,
              },
            },
          }
        );
      }
      let result;
      if (fromDate === undefined && toDate === undefined) {
        result = await extractDateWise(type);
        aggregate.push({
          $match: {
            createdAt: {
              $gte: new Date(result.fromDate),
              $lte: new Date(result.toDate),
            },
          },
        });
      } else {
        aggregate.push({
          $match: {
            createdAt: {
              $gte: new Date(fromDate),
              $lte: new Date(toDate),
            },
          },
        });
      }
      if (type === REPORT_FILTER.WEEK || type === REPORT_FILTER.MONTH) {
        aggregate.push(
          {
            $addFields: {
              cDate: {
                $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
              },
            },
          },
          {
            $group: {
              _id: "$cDate",
              totalTransaction: { $sum: "$amount" },
              count: { $sum: 1 },
            },
          },
          {
            $sort: { _id: options.sort },
          }
        );
      } else if (type === REPORT_FILTER.HALFYEAR) {
        aggregate.push(
          {
            $addFields: {
              cDate: {
                $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
              },
            },
          },
          {
            $group: {
              _id: {
                week: {
                  $week: "$createdAt",
                },
                month: {
                  $month: "$createdAt",
                },
                year: {
                  $year: "$createdAt",
                },
              },
              cDate: {
                $first: "$cDate",
              },
              totalTransaction: { $sum: "$amount" },
              count: { $sum: 1 },
            },
          },
          {
            $sort: { cDate: options.sort },
          }
        );
      } else if (type === REPORT_FILTER.YEAR) {
        aggregate.push(
          {
            $addFields: {
              cDate: {
                $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
              },
            },
          },
          {
            $group: {
              _id: {
                month: {
                  $month: "$createdAt",
                },
                year: {
                  $year: "$createdAt",
                },
              },
              cDate: {
                $first: "$cDate",
              },
              totalTransaction: { $sum: "$amount" },
              count: { $sum: 1 },
            },
          },
          {
            $sort: { cDate: options.sort },
          }
        );
      }

      const count = await Transaction.aggregate(aggregate);
      if (count) {
        return count;
      } else {
        throw new Error("Error while fetching data from database");
      }
    } catch (error) {
      throw new Error(error);
    }
  },

  //   patientLogin: async (body) => {
  //     try {
  //       var { type, fromDate, toDate } = body;
  //       let options = {};
  //       let query = {};

  //       if (body.options !== undefined) {
  //         options = {
  //           ...body.options,
  //         };
  //       }
  //       if (body.query !== undefined) {
  //         query = {
  //           ...body.query,
  //         };
  //       }
  //       let dateFormat;
  //       if (fromDate === undefined && toDate === undefined) {
  //         dateFormat = await extractDateWise(fromDate, toDate, type);
  //         query.createdAt = {
  //           $gte: new Date(dateFormat.fromDate),
  //           $lte: new Date(dateFormat.toDate),
  //         };
  //       } else {
  //         query.createdAt = {
  //           $gte: new Date(fromDate),
  //           $lte: new Date(toDate),
  //         };
  //       }

  //       if (body.method === "GET") {
  //         if (body.limit) {
  //           options.limit = parseInt(body.limit);
  //           options.offset = 0;
  //         }
  //       }

  //       if (body.sort == -1) {
  //         options.sort = -1;
  //       } else {
  //         options.sort = 1;
  //       }
  //       if (!body.patientName) {
  //         body.patientName = "";
  //       }
  //       ////
  //       const patientRole = await role.findOne({
  //         code: USER_ROLE.PATIENT,
  //       });

  //       const result = await userLoginRequestActivity.aggregate([
  //         {
  //           $match: query,
  //         },
  //         {
  //           $lookup: {
  //             from: "user",
  //             localField: "user_id",
  //             foreignField: "_id",
  //             as: "patients",
  //           },
  //         },
  //         {
  //           $match: {
  //             "patients.roleId": patientRole._id,
  //           },
  //         },
  //         {
  //           $lookup: {
  //             from: "user",
  //             localField: "patients.prefferedPhysicianId",
  //             foreignField: "_id",
  //             as: "physicians",
  //           },
  //         },
  //         { $unwind: "$physicians" },
  //         {
  //           $match: {
  //             $or: [
  //               {
  //                 "patients.firstName": {
  //                   $regex: body.patientName,
  //                   $options: "i",
  //                 },
  //               },
  //               {
  //                 "patients.lastName": {
  //                   $regex: body.patientName,
  //                   $options: "i",
  //                 },
  //               },
  //             ],
  //           },
  //         },
  //         { $sort: { "patients.revenue": options.sort } },
  //         {
  //           $facet: {
  //             paginatedResults: [
  //               {
  //                 $skip: options.offset,
  //               },
  //               {
  //                 $limit: options.limit,
  //               },
  //             ],
  //             totalCount: [
  //               {
  //                 $count: "count",
  //               },
  //             ],
  //           },
  //         },
  //         {
  //           $addFields: {
  //             total: {
  //               $ifNull: [
  //                 {
  //                   $arrayElemAt: ["$totalCount.count", 0],
  //                 },
  //                 0,
  //               ],
  //             },
  //           },
  //         },
  //         {
  //           $project: {
  //             paginatedResults: 1,
  //             total: 1,
  //           },
  //         },
  //       ]);

  //       if (result) {
  //         return result;
  //       } else {
  //         throw new Error("Error while fetching data from database");
  //       }
  //     } catch (error) {
  //       console.log("error", error);
  //       throw new Error(error);
  //     }
  //   },
  //   patientLoginCount: async (body) => {
  //     try {
  //       var { type, fromDate, toDate } = body;
  //       var group = {};
  //       var project = {};
  //       var addFields = {};
  //       addFields = {
  //         service: { $ifNull: ["$service_request_id", false] },
  //       };
  //       project = {
  //         user_id: 1,
  //         createdAt: 1,
  //         loginCount: {
  //           $cond: [{ $eq: ["$service", false] }, 1, 0],
  //         },
  //         requestCount: {
  //           // Set to 1 if value > 10
  //           $cond: [{ $ne: ["$service", false] }, 1, 0],
  //         },
  //       };
  //       group = {
  //         _id: {
  //           day: {
  //             $dayOfMonth: "$createdAt",
  //           },
  //           month: {
  //             $month: "$createdAt",
  //           },
  //           year: {
  //             $year: "$createdAt",
  //           },
  //         },
  //         login: {
  //           $sum: "$loginCount",
  //         },
  //         requests: { $sum: "$requestCount" },
  //       };
  //       let query = {};
  //       let options = {};
  //       if (body.query !== undefined) {
  //         query = {
  //           ...body.query,
  //         };
  //       }
  //       if (body.options !== undefined) {
  //         options = {
  //           ...body.options,
  //         };
  //       }
  //       let result;
  //       if (fromDate === undefined && toDate === undefined) {
  //         result = await extractDateWise(fromDate, toDate, type);
  //         query.createdAt = {
  //           $gte: new Date(result.fromDate),
  //           $lte: new Date(result.toDate),
  //         };
  //       } else {
  //         query.createdAt = {
  //           $gte: new Date(fromDate),
  //           $lte: new Date(toDate),
  //         };
  //       }

  //       if (body.sort == -1) {
  //         options.sort = -1;
  //       } else {
  //         options.sort = 1;
  //       }
  //       const count = await userLoginRequestActivity.aggregate([
  //         {
  //           $match: query,
  //         },
  //         { $addFields: addFields },
  //         { $project: project },
  //         {
  //           $group: group,
  //         },
  //         {
  //           $sort: { requests: options.sort },
  //         },
  //       ]);
  //       if (count) {
  //         return count;
  //       } else {
  //         throw new Error("Error while fetching data from database");
  //       }
  //     } catch (error) {
  //       throw new Error(error);
  //     }
  //   },

  //   grossRevenueList: async (body) => {
  //     try {
  //       var { type, fromDate, toDate } = body;
  //       var group = {};
  //       let options = {};
  //       let query = {};
  //       if (body.options !== undefined) {
  //         options = {
  //           ...body.options,
  //         };
  //       }
  //       if (body.query !== undefined) {
  //         query = {
  //           ...body.query,
  //         };
  //       }
  //       let dateFormat;
  //       if (fromDate === undefined && toDate === undefined) {
  //         dateFormat = await extractDateWise(fromDate, toDate, type);
  //         query.createdAt = {
  //           $gte: new Date(dateFormat.fromDate),
  //           $lte: new Date(dateFormat.toDate),
  //         };
  //       } else {
  //         query.createdAt = {
  //           $gte: new Date(fromDate),
  //           $lte: new Date(toDate),
  //         };
  //       }

  //       const result = await serviceRequest.aggregate([
  //         {
  //           $match: query,
  //         },
  //         {
  //           $lookup: {
  //             from: "user",
  //             localField: "doctorId",
  //             foreignField: "_id",
  //             as: "physician",
  //           },
  //         },
  //         { $unwind: "$physician" },
  //         {
  //           $group: {
  //             _id: "$doctorId",
  //             doc: { $first: "$$ROOT" },
  //             totalRevenue: { $sum: "$fees" },
  //           },
  //         },
  //         {
  //           $replaceRoot: {
  //             newRoot: {
  //               $mergeObjects: [{ totalRevenue: "$totalRevenue" }, "$doc"],
  //             },
  //           },
  //         },
  //         {
  //           $facet: {
  //             paginatedResults: [
  //               {
  //                 $skip: options.offset,
  //               },
  //               {
  //                 $limit: options.limit,
  //               },
  //             ],
  //             totalCount: [
  //               {
  //                 $count: "count",
  //               },
  //             ],
  //           },
  //         },
  //         {
  //           $addFields: {
  //             total: {
  //               $ifNull: [
  //                 {
  //                   $arrayElemAt: ["$totalCount.count", 0],
  //                 },
  //                 0,
  //               ],
  //             },
  //           },
  //         },
  //         {
  //           $project: {
  //             paginatedResults: 1,
  //             total: 1,
  //           },
  //         },
  //       ]);

  //       if (result) {
  //         return result;
  //       } else {
  //         throw new Error("Error while fetching data from database");
  //       }
  //     } catch (error) {
  //       throw new Error(error);
  //     }
  //   },

  //   grossRevenueCount: async (body) => {
  //     try {
  //       var { type, fromDate, toDate } = body;
  //       let options = {};
  //       let query = {};
  //       if (body.options !== undefined) {
  //         options = {
  //           ...body.options,
  //         };
  //       }
  //       if (body.query !== undefined) {
  //         query = {
  //           ...body.query,
  //         };
  //       }
  //       let dateFormat;
  //       if (fromDate === undefined && toDate === undefined) {
  //         dateFormat = await extractDateWise(fromDate, toDate, type);
  //         query.createdAt = {
  //           $gte: new Date(dateFormat.fromDate),
  //           $lte: new Date(dateFormat.toDate),
  //         };
  //       } else {
  //         query.createdAt = {
  //           $gte: new Date(fromDate),
  //           $lte: new Date(toDate),
  //         };
  //       }
  //       const result = await serviceRequest.aggregate([
  //         {
  //           $match: query,
  //         },
  //         {
  //           $addFields: {
  //             cDate: {
  //               $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
  //             },
  //           },
  //         },
  //         {
  //           $group: { _id: "$cDate", count: { $sum: "$fees" } },
  //         },
  //         {
  //           $sort: { _id: 1 },
  //         },
  //       ]);
  //       if (result) {
  //         return result;
  //       } else {
  //         throw new Error("Error while fetching data from database");
  //       }
  //     } catch (error) {
  //       throw new Error(error);
  //     }
  //   },
  //   physicianLifetimeValue: async (body) => {
  //     try {
  //       var { type, fromDate, toDate } = body;
  //       let options = {};
  //       let query = {};
  //       if (body.options !== undefined) {
  //         options = {
  //           ...body.options,
  //         };
  //       }
  //       if (body.query !== undefined) {
  //         query = {
  //           ...body.query,
  //         };
  //       }
  //       let dateFormat;
  //       if (fromDate === undefined && toDate === undefined) {
  //         dateFormat = await extractDateWise(fromDate, toDate, type);
  //         query.createdAt = {
  //           $gte: new Date(dateFormat.fromDate),
  //           $lte: new Date(dateFormat.toDate),
  //         };
  //       } else {
  //         query.createdAt = {
  //           $gte: new Date(fromDate),
  //           $lte: new Date(toDate),
  //         };
  //       }
  //       const result = await serviceRequest.aggregate([
  //         {
  //           $match: query,
  //         },
  //         {
  //           $lookup: {
  //             from: "user",
  //             localField: "doctorId",
  //             foreignField: "_id",
  //             as: "physician",
  //           },
  //         },
  //         { $unwind: "$physician" },
  //         {
  //           $group: {
  //             _id: "$doctorId",
  //             doc: { $first: "$$ROOT" },
  //             totalLifeTimeRevenue: { $sum: "$physicianLifeTimeValue" },
  //           },
  //         },
  //         { $unwind: "$doc" },
  //         {
  //           $replaceRoot: {
  //             newRoot: {
  //               $mergeObjects: [
  //                 { totalLifeTimeRevenue: "$totalLifeTimeRevenue" },
  //                 "$doc",
  //               ],
  //             },
  //           },
  //         },
  //         {
  //           $facet: {
  //             paginatedResults: [
  //               {
  //                 $skip: options.offset,
  //               },
  //               {
  //                 $limit: options.limit,
  //               },
  //             ],
  //             totalCount: [
  //               {
  //                 $count: "count",
  //               },
  //             ],
  //           },
  //         },
  //         {
  //           $addFields: {
  //             total: {
  //               $ifNull: [
  //                 {
  //                   $arrayElemAt: ["$totalCount.count", 0],
  //                 },
  //                 0,
  //               ],
  //             },
  //           },
  //         },
  //         {
  //           $project: {
  //             paginatedResults: 1,
  //             total: 1,
  //           },
  //         },
  //       ]);
  //       if (result) {
  //         return result;
  //       } else {
  //         throw new Error("Error while fetching data from database");
  //       }
  //     } catch (error) {
  //       throw new Error(error);
  //     }
  //   },

  //   physicianLifetimeValueCount: async (body) => {
  //     try {
  //       var { type, fromDate, toDate } = body;
  //       let options = {};
  //       let query = {};
  //       if (body.options !== undefined) {
  //         options = {
  //           ...body.options,
  //         };
  //       }
  //       if (body.query !== undefined) {
  //         query = {
  //           ...body.query,
  //         };
  //       }
  //       let dateFormat;
  //       if (fromDate === undefined && toDate === undefined) {
  //         dateFormat = await extractDateWise(fromDate, toDate, type);
  //         query.createdAt = {
  //           $gte: new Date(dateFormat.fromDate),
  //           $lte: new Date(dateFormat.toDate),
  //         };
  //       } else {
  //         query.createdAt = {
  //           $gte: new Date(fromDate),
  //           $lte: new Date(toDate),
  //         };
  //       }
  //       const result = await serviceRequest.aggregate([
  //         {
  //           $match: query,
  //         },
  //         {
  //           $addFields: {
  //             cDate: {
  //               $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
  //             },
  //           },
  //         },
  //         {
  //           $group: { _id: "$cDate", count: { $sum: "$physicianLifeTimeValue" } },
  //         },
  //         {
  //           $sort: { _id: 1 },
  //         },
  //       ]);
  //       if (result) {
  //         return result;
  //       } else {
  //         throw new Error("Error while fetching data from database");
  //       }
  //     } catch (error) {
  //       throw new Error(error);
  //     }
  //   },
  //   subsciberList: async (body) => {
  //     try {
  //       var { type, fromDate, toDate } = body;
  //       let options = {};
  //       let query = {};
  //       if (body.options !== undefined) {
  //         options = {
  //           ...body.options,
  //         };
  //       }
  //       if (body.query !== undefined) {
  //         query = {
  //           ...body.query,
  //         };
  //       }
  //       let dateFormat;
  //       if (fromDate === undefined && toDate === undefined) {
  //         dateFormat = await extractDateWise(fromDate, toDate, type);
  //         query.createdAt = {
  //           $gte: new Date(dateFormat.fromDate),
  //           $lte: new Date(dateFormat.toDate),
  //         };
  //       } else {
  //         query.createdAt = {
  //           $gte: new Date(fromDate),
  //           $lte: new Date(toDate),
  //         };
  //       }

  //       const result = await serviceRequest.aggregate([
  //         {
  //           $match: query,
  //         },
  //         {
  //           $lookup: {
  //             from: "user",
  //             localField: "patientId",
  //             foreignField: "_id",
  //             as: "patient",
  //           },
  //         },
  //         {
  //           $lookup: {
  //             from: "user",
  //             localField: "doctorId",
  //             foreignField: "_id",
  //             as: "physician",
  //           },
  //         },
  //         {
  //           $lookup: {
  //             from: "service",
  //             localField: "serviceId",
  //             foreignField: "_id",
  //             as: "services",
  //           },
  //         },
  //         { $unwind: "$patient" },
  //         { $unwind: "$physician" },
  //         { $unwind: "$services" },
  //         {
  //           $group: { _id: "$orderId", doc: { $first: "$$ROOT" } },
  //         },
  //         { $unwind: "$doc" },
  //         {
  //           $replaceRoot: {
  //             newRoot: { $mergeObjects: ["$doc"] },
  //           },
  //         },
  //         {
  //           $facet: {
  //             paginatedResults: [
  //               {
  //                 $skip: options.offset,
  //               },
  //               {
  //                 $limit: options.limit,
  //               },
  //             ],
  //             totalCount: [
  //               {
  //                 $count: "count",
  //               },
  //             ],
  //           },
  //         },
  //         {
  //           $addFields: {
  //             total: {
  //               $ifNull: [
  //                 {
  //                   $arrayElemAt: ["$totalCount.count", 0],
  //                 },
  //                 0,
  //               ],
  //             },
  //           },
  //         },
  //         {
  //           $project: {
  //             paginatedResults: 1,
  //             total: 1,
  //           },
  //         },
  //       ]);
  //       if (result) {
  //         return result;
  //       } else {
  //         throw new Error("Error while fetching data from database");
  //       }
  //     } catch (error) {
  //       throw new Error(error);
  //     }
  //   },

  //   subsciberListCount: async (body) => {
  //     try {
  //       var { type, fromDate, toDate } = body;
  //       let options = {};
  //       let query = {};
  //       if (body.options !== undefined) {
  //         options = {
  //           ...body.options,
  //         };
  //       }
  //       if (body.query !== undefined) {
  //         query = {
  //           ...body.query,
  //         };
  //       }
  //       let dateFormat;
  //       if (fromDate === undefined && toDate === undefined) {
  //         dateFormat = await extractDateWise(fromDate, toDate, type);
  //         query.createdAt = {
  //           $gte: new Date(dateFormat.fromDate),
  //           $lte: new Date(dateFormat.toDate),
  //         };
  //       } else {
  //         query.createdAt = {
  //           $gte: new Date(fromDate),
  //           $lte: new Date(toDate),
  //         };
  //       }

  //       const result = await serviceRequest.aggregate([
  //         {
  //           $match: query,
  //         },
  //         {
  //           $group: { _id: "$orderId", doc: { $first: "$$ROOT" } },
  //         },
  //         { $unwind: "$doc" },
  //         {
  //           $replaceRoot: {
  //             newRoot: { $mergeObjects: ["$doc"] },
  //           },
  //         },
  //         {
  //           $addFields: {
  //             cDate: { $dateToString: { format: "%m-%G", date: "$createdAt" } },
  //           },
  //         },
  //         {
  //           $group: { _id: "$cDate", count: { $sum: 1 } },
  //         },
  //         {
  //           $sort: { _id: 1 },
  //         },
  //       ]);
  //       if (result) {
  //         return result;
  //       } else {
  //         throw new Error("Error while fetching data from database");
  //       }
  //     } catch (error) {
  //       throw new Error(error);
  //     }
  //   },

  //   physicianNetRevenueCount: async (body) => {
  //     try {
  //       var { type, fromDate, toDate } = body;
  //       let options = {};
  //       let query = {};
  //       if (body.options !== undefined) {
  //         options = {
  //           ...body.options,
  //         };
  //       }
  //       if (body.query !== undefined) {
  //         query = {
  //           ...body.query,
  //         };
  //       }
  //       let dateFormat;
  //       if (fromDate === undefined && toDate === undefined) {
  //         dateFormat = await extractDateWise(fromDate, toDate, type);
  //         query.createdAt = {
  //           $gte: new Date(dateFormat.fromDate),
  //           $lte: new Date(dateFormat.toDate),
  //         };
  //       } else {
  //         query.createdAt = {
  //           $gte: new Date(fromDate),
  //           $lte: new Date(toDate),
  //         };
  //       }

  //       const result = await serviceRequest.aggregate([
  //         {
  //           $match: query,
  //         },
  //         {
  //           $addFields: {
  //             cDate: {
  //               $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
  //             },
  //           },
  //         },
  //         {
  //           $group: { _id: "$cDate", count: { $sum: "$physicianNetRevenue" } },
  //         },
  //         {
  //           $sort: { _id: 1 },
  //         },
  //       ]);
  //       if (result) {
  //         return result;
  //       } else {
  //         throw new Error("Error while fetching data from database");
  //       }
  //     } catch (error) {
  //       console.log("Error - physicianNetRevenueCount", error);
  //       throw new Error(error);
  //     }
  //   },

  //   physicianNetRevenue: async (body) => {
  //     try {
  //       var { type, fromDate, toDate } = body;
  //       let options = {};
  //       let query = {};
  //       if (body.options !== undefined) {
  //         options = {
  //           ...body.options,
  //         };
  //       }
  //       if (body.query !== undefined) {
  //         query = {
  //           ...body.query,
  //         };
  //       }
  //       let dateFormat;
  //       if (fromDate === undefined && toDate === undefined) {
  //         dateFormat = await extractDateWise(fromDate, toDate, type);
  //         query.createdAt = {
  //           $gte: new Date(dateFormat.fromDate),
  //           $lte: new Date(dateFormat.toDate),
  //         };
  //       } else {
  //         query.createdAt = {
  //           $gte: new Date(fromDate),
  //           $lte: new Date(toDate),
  //         };
  //       }

  //       const result = await serviceRequest.aggregate([
  //         {
  //           $match: query,
  //         },
  //         {
  //           $lookup: {
  //             from: "user",
  //             localField: "doctorId",
  //             foreignField: "_id",
  //             as: "physician",
  //           },
  //         },
  //         { $unwind: "$physician" },
  //         {
  //           $group: {
  //             _id: "$doctorId",
  //             doc: { $first: "$$ROOT" },
  //             totalNetRevenue: { $sum: "$physicianNetRevenue" },
  //           },
  //         },
  //         { $unwind: "$doc" },
  //         {
  //           $replaceRoot: {
  //             newRoot: {
  //               $mergeObjects: [{ totalNetRevenue: "$totalNetRevenue" }, "$doc"],
  //             },
  //           },
  //         },
  //         {
  //           $facet: {
  //             paginatedResults: [
  //               {
  //                 $skip: options.offset,
  //               },
  //               {
  //                 $limit: options.limit,
  //               },
  //             ],
  //             totalCount: [
  //               {
  //                 $count: "count",
  //               },
  //             ],
  //           },
  //         },
  //         {
  //           $addFields: {
  //             total: {
  //               $ifNull: [
  //                 {
  //                   $arrayElemAt: ["$totalCount.count", 0],
  //                 },
  //                 0,
  //               ],
  //             },
  //           },
  //         },
  //         {
  //           $project: {
  //             paginatedResults: 1,
  //             total: 1,
  //           },
  //         },
  //       ]);
  //       if (result) {
  //         return result;
  //       } else {
  //         throw new Error("Error while fetching data from database");
  //       }
  //     } catch (error) {
  //       console.log("Error - physicianNetRevenue", error);
  //       throw new Error(error);
  //     }
  //   },

  //   patientNetRevenueCount: async (body) => {
  //     try {
  //       var { type, fromDate, toDate } = body;
  //       let options = {};
  //       let query = {};
  //       if (body.options !== undefined) {
  //         options = {
  //           ...body.options,
  //         };
  //       }
  //       if (body.query !== undefined) {
  //         query = {
  //           ...body.query,
  //         };
  //       }
  //       let dateFormat;
  //       if (fromDate === undefined && toDate === undefined) {
  //         dateFormat = await extractDateWise(fromDate, toDate, type);
  //         query.createdAt = {
  //           $gte: new Date(dateFormat.fromDate),
  //           $lte: new Date(dateFormat.toDate),
  //         };
  //       } else {
  //         query.createdAt = {
  //           $gte: new Date(fromDate),
  //           $lte: new Date(toDate),
  //         };
  //       }

  //       const result = await serviceRequest.aggregate([
  //         {
  //           $match: query,
  //         },
  //         {
  //           $addFields: {
  //             cDate: {
  //               $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
  //             },
  //           },
  //         },
  //         {
  //           $group: { _id: "$cDate", count: { $sum: "$patientNetRevenue" } },
  //         },
  //         {
  //           $sort: { _id: 1 },
  //         },
  //       ]);
  //       if (result) {
  //         return result;
  //       } else {
  //         throw new Error("Error while fetching data from database");
  //       }
  //     } catch (error) {
  //       console.log("Error - patientNetRevenueCount", error);
  //       throw new Error(error);
  //     }
  //   },

  //   patientNetRevenue: async (body) => {
  //     try {
  //       var { type, fromDate, toDate } = body;
  //       let options = {};
  //       let query = {};
  //       if (body.options !== undefined) {
  //         options = {
  //           ...body.options,
  //         };
  //       }
  //       if (body.query !== undefined) {
  //         query = {
  //           ...body.query,
  //         };
  //       }
  //       let dateFormat;
  //       if (fromDate === undefined && toDate === undefined) {
  //         dateFormat = await extractDateWise(fromDate, toDate, type);
  //         query.createdAt = {
  //           $gte: new Date(dateFormat.fromDate),
  //           $lte: new Date(dateFormat.toDate),
  //         };
  //       } else {
  //         query.createdAt = {
  //           $gte: new Date(fromDate),
  //           $lte: new Date(toDate),
  //         };
  //       }

  //       const result = await serviceRequest.aggregate([
  //         {
  //           $match: query,
  //         },
  //         {
  //           $lookup: {
  //             from: "user",
  //             localField: "patientId",
  //             foreignField: "_id",
  //             as: "patient",
  //           },
  //         },
  //         { $unwind: "$patient" },
  //         {
  //           $group: {
  //             _id: "$patientId",
  //             doc: { $first: "$$ROOT" },
  //             totalPatientNetRevenue: { $sum: "$patientNetRevenue" },
  //           },
  //         },
  //         { $unwind: "$doc" },
  //         {
  //           $replaceRoot: {
  //             newRoot: {
  //               $mergeObjects: [
  //                 { totalPatientNetRevenue: "$totalPatientNetRevenue" },
  //                 "$doc",
  //               ],
  //             },
  //           },
  //         },
  //         // {
  //         //     $skip: options.offset
  //         // }, {
  //         //     $limit: options.limit
  //         // },
  //         {
  //           $facet: {
  //             paginatedResults: [
  //               {
  //                 $skip: options.offset,
  //               },
  //               {
  //                 $limit: options.limit,
  //               },
  //             ],
  //             totalCount: [
  //               {
  //                 $count: "count",
  //               },
  //             ],
  //           },
  //         },
  //         {
  //           $addFields: {
  //             total: {
  //               $ifNull: [
  //                 {
  //                   $arrayElemAt: ["$totalCount.count", 0],
  //                 },
  //                 0,
  //               ],
  //             },
  //           },
  //         },
  //         {
  //           $project: {
  //             paginatedResults: 1,
  //             total: 1,
  //           },
  //         },
  //       ]);
  //       if (result) {
  //         return result;
  //       } else {
  //         throw new Error("Error while fetching data from database");
  //       }
  //     } catch (error) {
  //       console.log("Error - patientNetRevenue", error);
  //       throw new Error(error);
  //     }
  //   },

  //   patientLifetimeValueCount: async (body) => {
  //     try {
  //       var { type, fromDate, toDate } = body;
  //       let options = {};
  //       let query = {};
  //       if (body.options !== undefined) {
  //         options = {
  //           ...body.options,
  //         };
  //       }
  //       if (body.query !== undefined) {
  //         query = {
  //           ...body.query,
  //         };
  //       }
  //       let dateFormat;
  //       if (fromDate === undefined && toDate === undefined) {
  //         dateFormat = await extractDateWise(fromDate, toDate, type);
  //         query.createdAt = {
  //           $gte: new Date(dateFormat.fromDate),
  //           $lte: new Date(dateFormat.toDate),
  //         };
  //       } else {
  //         query.createdAt = {
  //           $gte: new Date(fromDate),
  //           $lte: new Date(toDate),
  //         };
  //       }

  //       const result = await serviceRequest.aggregate([
  //         {
  //           $match: query,
  //         },
  //         {
  //           $addFields: {
  //             cDate: {
  //               $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
  //             },
  //             patient: { $cond: { if: "$patientId", then: 1, else: 0 } },
  //           },
  //         },
  //         {
  //           $group: {
  //             _id: "$cDate",
  //             patientNetRevenue: { $sum: "$patientNetRevenue" },
  //             patient: { $sum: "$patient" },
  //           },
  //         },
  //         {
  //           $addFields: {
  //             ratio: {
  //               $cond: {
  //                 if: { $eq: ["$patient", 0] },
  //                 then: 0,
  //                 else: { $divide: ["$patientNetRevenue", "$patient"] },
  //               },
  //             },
  //           },
  //         },
  //         {
  //           $sort: { _id: 1 },
  //         },
  //       ]);
  //       if (result) {
  //         return result;
  //       } else {
  //         throw new Error("Error while fetching data from database");
  //       }
  //     } catch (error) {
  //       console.log("Error - patientLifetimeValueCount", error);
  //       throw new Error(error);
  //     }
  //   },

  exportToExcel: async (sheetName, columns, data) => {
    let workbook = new excel.Workbook();
    let worksheet = workbook.addWorksheet(sheetName);
    worksheet.columns = columns;
    worksheet.columns.forEach((column) => {
      column.width = column.header.length < 12 ? 12 : column.header.length;
    });
    worksheet.getRow(1).font = { bold: true };
    worksheet.addRows(data);
    return workbook;
  },
};
// async function getService(query, body) {
//   if (body.serviceName !== undefined) {
//     const serviceName = body.serviceName;

//     const serviceIds = await serviceRequest.aggregate([
//       {
//         $lookup: {
//           from: "service",
//           localField: "serviceId",
//           foreignField: "_id",
//           as: "serviceName",
//         },
//       },
//       {
//         $match: {
//           "serviceName.name": {
//             $regex: serviceName,
//             $options: "i",
//           },
//         },
//       },
//     ]);

//     // delete query["serviceName"]
//     if (serviceIds[0] !== null && serviceIds[0] !== undefined) {
//       query.serviceId = serviceIds[0].serviceId;
//     } else {
//       query.serviceId = null;
//     }
//   }
//   return query;
// };
