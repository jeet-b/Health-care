const db = require("../config/db");
const Appointment = require("../model/appointment")(db);
const Role = require("../model/role")(db);
const { USER_ROLE, DASHBOARD_FILTER } = require("../config/authConstant");
const moment = require("moment");
const { date } = require("joi");
moment.tz.setDefault(process.env.UTC_TIMEZONE);

const extractDateWise = async (type) => {
  try {
    let fromDate, toDate;
    let currentTime = new Date();
    if (type === DASHBOARD_FILTER.WEEK) {
      // let first = currentTime.getDate() - currentTime.getDay();
      // let last = first + 6;
      // fromDate = new Date(currentTime.setDate(first));
      // toDate = new Date(currentTime.setDate(last));
      fromDate = moment().startOf('week').toDate();
      toDate = moment().endOf('week').toDate();
    } else if (type === DASHBOARD_FILTER.FORTNIGHT) {
      let halfMonthDate = new Date(
        currentTime.getFullYear(),
        currentTime.getMonth(),
        15
      );
      if (currentTime <= halfMonthDate) {
        fromDate = new Date(
          currentTime.getFullYear(),
          currentTime.getMonth(),
          1
        );
        toDate = new Date(
          currentTime.getFullYear(),
          currentTime.getMonth(),
          15
        );
      } else {
        fromDate = new Date(
          currentTime.getFullYear(),
          currentTime.getMonth(),
          16
        );
        toDate = new Date(
          currentTime.getFullYear(),
          currentTime.getMonth() + 1,
          0
        );
      }
    } else if (type === DASHBOARD_FILTER.MONTH) {
      // fromDate = new Date(currentTime.getFullYear(), currentTime.getMonth(), 1);
      // toDate = new Date(
      //   currentTime.getFullYear(),
      //   currentTime.getMonth() + 1,
      //   0
      // );
      fromDate = moment().startOf('month').toDate();
      toDate = moment().endOf('month').toDate();
    }

    return { fromDate, toDate };
  } catch (error) {
    console.error("Error - extractDateWise", error);
  }
};
const aggregationChart = async (
  userType,
  fromDate,
  toDate,
  currentTime,
  groupByDate
) => {
  let aggregate = [
    {
      $match: {
        availableSlotId: { $exists: true },
      },
    },
    {
      $match: userType,
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
      $addFields: {
        startTime: "$availableSlot.startTime",
      },
    },
    {
      $addFields: {
        endTime: "$availableSlot.endTime",
      },
    },
    {
      $match: {
        startTime: {
          $gte: fromDate,
          $lte: toDate,
        },
      },
    },
    {
      $addFields: {
        startDate: {
          $dateToString: { format: "%Y-%m-%d", date: "$startTime" },
        },
      },
    },
    {
      $addFields: {
        endDate: { $dateToString: { format: "%Y-%m-%d", date: "$endTime" } },
      },
    },
    {
      $group: {
        _id: groupByDate,
        upcomingCount: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $eq: ["$isCancelled", false] },
                  { $eq: ["$noShow", false] },
                  { $eq: ["$isInterrupted", false] },
                  { $eq: ["$isFollowUp", false] },
                  { $eq: ["$isAppointmentCompleted", false] },
                  { $ifNull: ["$parentAppointmentId", true] },
                  { $gte: ["$startTime", currentTime] },
                  { $lte: ["$startTime", toDate] },
                ],
              },
              1,
              0,
            ],
          },
        },
        completedCount: {
          $sum: {
            $cond: [
              {
                $or: [
                  {
                    $and: [
                      { $gte: ["$endTime", fromDate] },
                      { $lte: ["$endTime", currentTime] },
                    ],
                  },
                  { $eq: ["$isAppointmentCompleted", true] },
                  // { $eq: ["$isCancelled", true] },
                  // { $eq: ["$isInterrupted", true] },
                  // { $eq: ["$noShow", true] },
                ],
              },
              1,
              0,
            ],
          },
        },
        followUpCount: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $eq: ["$isCancelled", false] },
                  { $eq: ["$isFollowUp", true] },
                  { $eq: ["$isAppointmentCompleted", false] },
                  { $ifNull: ["$parentAppointmentId", false] },
                  { $gte: ["$startTime", currentTime] },
                  { $lte: ["$startTime", toDate] },
                ],
              },
              1,
              0,
            ],
          },
        },
      },
    },

    {
      $sort: { _id: 1 },
    },
  ];
  return aggregate;
};
const dashboardCount = async ({ req }) => {
  try {
    // console.log(req.headers.offset);
    let roleCode = await Role.find({ _id: req.user.roleIds });
    let aggregateData = {};
    let userType = {};
    let currentTime = new Date();
    const type = req.body.type;
    let dateRange = await extractDateWise(type);
    // dateRange.toDate = dateRange.toDate.setDate(dateRange.toDate.getDate() + 1);

    // console.log(dateRange);
    user = roleCode[0].code == USER_ROLE.Physician ? "providerId" : "patientId";
    userType[user] = req.user.id;

    let result = {};
    fromDate = new Date(dateRange.fromDate);
    toDate = new Date(dateRange.toDate);
    let groupByDate = {};
    aggregateData = await aggregationChart(
      userType,
      fromDate,
      toDate,
      currentTime,
      groupByDate
    );
    result = await Appointment.aggregate(aggregateData);
    // console.log(result.length);
    if (result.length !== 0) {
      result[0].totalCount =
        result[0].upcomingCount +
        result[0].completedCount +
        result[0].followUpCount;
    } else {
      let obj = {
        _id: {},
        upcomingCount: 0,
        completedCount: 0,
        followUpCount: 0,
        totalCount: 0,
      };
      result.push(obj);
    }
    // console.log(result);
    return result;
  } catch (error) {
    console.error("Error - dashboardCount", error);
    throw new Error(error);
  }
};

const dashboardChartCount = async ({ req }) => {
  try {
    let roleCode = await Role.find({ _id: req.user.roleIds });
    let aggregateData = {};
    let userType = {};
    let fromDate, toDate;
    let currentTime = new Date();

    const type = req.body.type;
    let dateRange = await extractDateWise(type);

    fromDate = new Date(dateRange.fromDate);
    toDate = new Date(dateRange.toDate);

    user = roleCode[0].code == USER_ROLE.Physician ? "providerId" : "patientId";
    userType[user] = req.user.id;
    let result = {};
    groupByDate = "$startDate";
    aggregateData = await aggregationChart(
      userType,
      fromDate,
      toDate,
      currentTime,
      groupByDate
    );
    result = await Appointment.aggregate(aggregateData);

    let output = [];
    let diffTime = new Date(toDate) - new Date(fromDate);
    let diffDays = diffTime / (1000 * 60 * 60 * 24);

    let date = new Date(fromDate);
    for (let i = 0; i <= diffDays; i++) {
      let currentDate = new Date(date).toISOString().split("T")[0];
      if (result.length === 0) {
        let obj = {
          _id: currentDate,
          upcomingCount: 0,
          completedCount: 0,
          followUpCount: 0,
        };
        output.push(obj);
      } else {
        let filterResult = result.filter((e) => e._id == currentDate);
        if (filterResult.length == 1) {
          output.push(filterResult[0]);
        } else {
          let obj = {
            _id: currentDate,
            upcomingCount: 0,
            completedCount: 0,
            followUpCount: 0,
          };
          output.push(obj);
        }
      }
      date.setDate(date.getDate() + 1);
    }
    return output;
  } catch (error) {
    console.error("Error - dashboardChartCount", error);
  }
};

module.exports = {
  dashboardCount,
  dashboardChartCount,
};
