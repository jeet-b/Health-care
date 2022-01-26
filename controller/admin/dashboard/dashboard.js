const message = require("../../../utils/messages");
const responseCode = require("../../../utils/responseCode");
const db = require("../../../config/db");
const User = require("../../../model/user")(db);
const Appointment = require("../../../model/appointment")(db);
const Role = require("../../../model/role")(db);
const moment = require("moment");
const { USER_ROLE } = require("../../../config/authConstant");
const ObjectId = require("mongodb").ObjectId;
const dashboardCount = async ({ req }) => {
  try {
    let rolePhysician = await Role.findOne({
      code: USER_ROLE.Physician,
    }).select("_id");
    let rolePatient = await Role.findOne({ code: USER_ROLE.Patient }).select(
      "_id"
    );
    let aggregate = [
      {
        $group: {
          _id: null,
          totalPhysicians: {
            $sum: {
              $cond: [
                {
                  $in: [ObjectId(rolePhysician._id), "$roleIds"],
                },
                1,
                0,
              ],
            },
          },
          pendingApprovalPhysicians: {
            $sum: {
              $cond: [
                {
                  $and: [
                    {
                      $in: [ObjectId(rolePhysician._id), "$roleIds"],
                    },
                    { $eq: ["$isApproved", false] },
                  ],
                },
                1,
                0,
              ],
            },
          },
          activeCountPhysicians: {
            $sum: {
              $cond: [
                {
                  $and: [
                    {
                      $in: [ObjectId(rolePhysician._id), "$roleIds"],
                    },
                    { $eq: ["$isActive", true] },
                    { $eq: ["$isApproved", true] },
                  ],
                },
                1,
                0,
              ],
            },
          },
          totalPatients: {
            $sum: {
              $cond: [
                {
                  $in: [ObjectId(rolePatient._id), "$roleIds"],
                },
                1,
                0,
              ],
            },
          },
          activeCountPatients: {
            $sum: {
              $cond: [
                {
                  $and: [
                    {
                      $in: [ObjectId(rolePatient._id), "$roleIds"],
                    },
                    { $eq: ["$isActive", true] },
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
        $project: {
          totalPhysicians: 1,
          pendingApprovalPhysicians: 1,
          percentagePendingApprovalPhysicians: {
            $cond: {
              if: { $eq: ["$totalPhysicians", 0] },
              then: 0,
              else: {
                $multiply: [
                  {
                    $divide: ["$pendingApprovalPhysicians", "$totalPhysicians"],
                  },
                  100,
                ],
              },
            },
          },
          activeCountPhysicians: 1,
          percentageActivePhysicians: {
            $cond: {
              if: { $eq: ["$totalPhysicians", 0] },
              then: 0,
              else: {
                $multiply: [
                  { $divide: ["$activeCountPhysicians", "$totalPhysicians"] },
                  100,
                ],
              },
            },
          },
          totalPatients: 1,
          activeCountPatients: 1,
          percentageActivePatiens: {
            $cond: {
              if: { $eq: ["$totalPatients", 0] },
              then: 0,
              else: {
                $multiply: [
                  { $divide: ["$activeCountPatients", "$totalPatients"] },
                  100,
                ],
              },
            },
          },
        },
      },
    ];
    let result = await User.aggregate(aggregate);
    return message.successResponse(
      { "Content-Type": "application/json" },
      responseCode.success,
      result,
      req.i18n.t("dashboard.admin_count")
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
const ratioAppointment = async ({ req }) => {
  try {
    let fromDate = moment().startOf("day").toDate();
    let toDate = moment(fromDate).endOf("day").toDate();
    let aggregate = [
      {
        $group: {
          _id: null,
          totalAppointment: {
            $sum: {
              $cond: [
                {
                  $and: [
                    {
                      $gte: ["$createdAt", fromDate],
                    },
                    {
                      $lte: ["$createdAt", toDate],
                    },
                  ],
                },
                1,
                0,
              ],
            },
          },
          newAppointment: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ["$isFollowUp", false] },
                    { $ifNull: ["$parentAppointmentId", true] },
                    {
                      $gte: ["$createdAt", fromDate],
                    },
                    {
                      $lte: ["$createdAt", toDate],
                    },
                  ],
                },
                1,
                0,
              ],
            },
          },
          followUpAppointment: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ["$isFollowUp", true] },
                    { $ifNull: ["$parentAppointmentId", false] },
                    {
                      $gte: ["$createdAt", fromDate],
                    },
                    {
                      $lte: ["$createdAt", toDate],
                    },
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
        $project: {
          newAppointmentPercentage: {
            $cond: {
              if: { $eq: ["$totalAppointment", 0] },
              then: 0,
              else: {
                $multiply: [
                  { $divide: ["$newAppointment", "$totalAppointment"] },
                  100,
                ],
              },
            },
          },
          followUpAppointmentPercentage: {
            $cond: {
              if: { $eq: ["$totalAppointment", 0] },
              then: 0,
              else: {
                $multiply: [
                  { $divide: ["$followUpAppointment", "$totalAppointment"] },
                  100,
                ],
              },
            },
          },
        },
      },
    ];
    let result = await Appointment.aggregate(aggregate);
    return message.successResponse(
      { "Content-Type": "application/json" },
      responseCode.success,
      result,
      req.i18n.t("dashboard.admin_count")
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
  dashboardCount,
  ratioAppointment,
};
