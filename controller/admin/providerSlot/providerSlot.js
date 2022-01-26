const message = require("../../../utils/messages");
const responseCode = require("../../../utils/responseCode");
const db = require("../../../config/db");
const Role = require("../../../model/role")(db);
const User = require("../../../model/user")(db);
const availableSlot = require("../../../model/availableSlot")(db);
const providerSlotModel = require("../../../model/providerSlot")(db);
const { TIMESLOT_TYPE, TIMEZONE } = require("../../../config/authConstant");
const Slot = require("../../../model/slot")(db);
const _ = require("lodash");
const moment = require("moment");
var ObjectId = require("mongodb").ObjectId;
const { USER_ROLE } = require("../../../config/authConstant");
const { getTimezone } = require("countries-and-timezones");
moment.tz.setDefault(process.env.UTC_TIMEZONE);

function makeProviderSlotController({ providerSlotService, makeProviderSlot }) {
  const addProviderSlot = async ({ data }) => {
    try {
      const originalData = data;

      const providerSlot = makeProviderSlot(
        originalData,
        "insertProviderSlotValidator"
      );
      let createdProviderSlot = await providerSlotService.createDocument(
        providerSlot
      );

      return message.successResponse(
        { "Content-Type": "application/json" },
        responseCode.success,
        createdProviderSlot
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
  const findAllProviderSlot = async ({ data }) => {
    try {
      let options = {};
      let query = {};
      let result;
      if (data.isCountOnly) {
        if (data.query !== undefined) {
          query = { ...data.query };
        }
        result = await providerSlotService.countDocument(query);
        if (result) {
          result = { totalRecords: result };
        } else {
          return message.recordNotFound(
            { "Content-Type": "application/json" },
            responseCode.success,
            []
          );
        }
      } else {
        if (data.options !== undefined) {
          options = { ...data.options };
        }
        if (data.query !== undefined) {
          query = { ...data.query };
        }
        result = await providerSlotService.getAllDocuments(query, options);
      }

      if (result) {
        return message.successResponse(
          { "Content-Type": "application/json" },
          responseCode.success,
          result
        );
      } else {
        return message.badRequest(
          { "Content-Type": "application/json" },
          responseCode.badRequest,
          {}
        );
      }
    } catch (error) {
      return message.failureResponse(
        { "Content-Type": "application/json" },
        responseCode.internalServerError,
        error.message
      );
    }
  };
  const getProviderSlotById = async (id) => {
    try {
      if (id) {
        const providerSlot = await providerSlotService.getSingleDocumentById(
          id
        );
        return message.successResponse(
          { "Content-Type": "application/json" },
          responseCode.success,
          providerSlot
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
  const getProviderSlotCount = async (data) => {
    try {
      let where = {};
      if (data.where) {
        where = data.where;
      }
      let result = await providerSlotService.countDocument(where);
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
  const getProviderSlotByAggregate = async ({ data }) => {
    try {
      if (data) {
        let result = await providerSlotService.getDocumentByAggregation(data);
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
  const updateProviderSlot = async (data, id) => {
    try {
      if (id && data) {
        const providerSlot = makeProviderSlot(
          data,
          "updateProviderSlotValidator"
        );
        const filterData = removeEmpty(providerSlot);
        let updatedProviderSlot =
          await providerSlotService.findOneAndUpdateDocument(
            { _id: id },
            filterData,
            { new: true }
          );
        return message.successResponse(
          { "Content-Type": "application/json" },
          responseCode.success,
          updatedProviderSlot
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
  const softDeleteProviderSlot = async (id) => {
    try {
      const deleteDependentService = require("../../../utils/deleteDependent");
      let pos = [
        {
          model: "appointment",
          refId: "timeSlotId",
        },
      ];
      await providerSlotService.softDeleteDocument(id);
      let result = await deleteDependentService.softDeleteProviderSlot({
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
  const bulkInsertProviderSlot = async ({ body }) => {
    try {
      let data = body.data;
      const providerSlotEntities = body.data.map((item) =>
        makeProviderSlot(item, "insertProviderSlotValidator")
      );
      const results = await providerSlotService.bulkInsert(
        providerSlotEntities
      );
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
  const bulkUpdateProviderSlot = async (data) => {
    try {
      if (data.filter && data.data) {
        const providerSlot = makeProviderSlot(
          data.data,
          "updateProviderSlotValidator"
        );
        const filterData = removeEmpty(providerSlot);
        const updatedProviderSlots = await providerSlotService.bulkUpdate(
          data.filter,
          filterData
        );
        return message.successResponse(
          { "Content-Type": "application/json" },
          responseCode.success,
          updatedProviderSlots
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
  const deleteProviderSlot = async (data, id) => {
    try {
      let possibleDependent = [
        {
          model: "appointment",
          refId: "timeSlotId",
        },
      ];
      const deleteDependentService = require("../../../utils/deleteDependent");
      if (data.isWarning) {
        let all = await deleteDependentService.countProviderSlot({ _id: id });
        return message.successResponse(
          { "Content-Type": "application/json" },
          responseCode.success,
          all
        );
      } else {
        let result = await deleteDependentService.deleteProviderSlot({
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

  function convertUTCDateToLocalDate(date) {
    var newDate = new Date(
      date.getTime() + date.getTimezoneOffset() * 60 * 1000
    );

    var offset = date.getTimezoneOffset() / 60;
    var hours = date.getHours();

    newDate.setHours(hours - offset);

    return newDate;
  }

  const getAllAvailableProviderSlot = async ({ req }) => {
    try {
      const timezoneOffset = req.headers.timezone
        ? req.headers.timezone
        : TIMEZONE;
      let offset = getTimezone(timezoneOffset).utcOffsetStr;
      offset = moment().utcOffset(offset).utcOffset();
      const data = {
        ...req.body,
      };
      if (data.query == undefined) {
        throw new Error("Enter the query");
      }
      data.query.specialisationId = _.map(
        data.query.specialisationId,
        (doc) => {
          return ObjectId(doc);
        }
      );
      const roleCodes = await Role.find({
        code: USER_ROLE.Physician,
      });
      const allProviderIds = await User.distinct("_id", {
        roleIds: roleCodes[0]._id,
      });
      let todayTime = convertUTCDateToLocalDate(new Date());
      let aggregate = [
        {
          $match: {
            providerId: {
              $in: allProviderIds,
            },
          },
        },
        {
          $addFields: {
            date: "$startTime",
          },
        },
        {
          $group: {
            _id: "$providerId",
            slots: {
              $push: {
                $cond: [
                  {
                    $gt: ["$date", todayTime],
                  },
                  "$date",
                  "$$REMOVE",
                ],
              },
            },
          },
        },
        {
          $lookup: {
            from: "user",
            localField: "_id",
            foreignField: "_id",
            as: "user",
          },
        },
        {
          $unwind: {
            path: "$user",
          },
        },
        {
          $lookup: {
            from: "specialisation",
            localField: "user.specialisations",
            foreignField: "_id",
            as: "specialisation",
          },
        },
        {
          $addFields: {
            spec: "$specialisation._id",
          },
        },
        {
          $match: {
            spec: {
              $all: data.query.specialisationId,
            },
          },
        },

        {
          $lookup: {
            from: "address",
            localField: "user.practiceAddressId",
            foreignField: "_id",
            as: "address",
          },
        },
        {
          $unwind: {
            path: "$address",
          },
        },
        {
          $lookup: {
            from: "city",
            localField: "address.cityId",
            foreignField: "_id",
            as: "city",
          },
        },
        {
          $unwind: {
            path: "$city",
          },
        },
        {
          $lookup: {
            from: "province",
            localField: "address.provinceId",
            foreignField: "_id",
            as: "province",
          },
        },
        {
          $unwind: {
            path: "$province",
          },
        },
        {
          $lookup: {
            from: "file",
            localField: "user.profilePictureId",
            foreignField: "_id",
            as: "profilePictureId",
          },
        },
        {
          $project: {
            name: "$user.name",
            firstName: "$user.firstName",
            lastName: "$user.lastName",
            description: { $ifNull: ["$user.description", ""] },
            profilePictureId: "$profilePictureId",
            specialisation: "$specialisation",
            city: "$city.name",
            province: "$province.name",
            services: "$services",
            rating: {
              $ifNull: ["$user.averageRating", "0"],
            },
            nextAvailableSlot: {
              $ifNull: [
                {
                  $dateToString: {
                    date: { $min: "$slots" },
                    timezone: timezoneOffset,
                  },
                },
                "",
              ],
            },
          },
        },
      ];

      if (
        data.query.searchByPhysicianName != undefined &&
        data.query.searchByPhysicianName != ""
      ) {
        let searchName = new RegExp(data.query.searchByPhysicianName, "i");
        aggregate.push({
          $match: {
            $or: [{ name: searchName }],
          },
        });
      }

      const allProviderSlots = await availableSlot.aggregate(aggregate);
      return message.successResponse(
        { "Content-Type": "application/json" },
        responseCode.success,
        allProviderSlots
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

  const getAvailableProviderSlot = async (data, id) => {
    try {
      let startDate = new Date(moment(data.date).format("YYYY-MM-DD"));
      let endDate = moment(data.date).add(1, "days");
      endDate = new Date(endDate.format("YYYY-MM-DD"));
      const slots = await availableSlot.aggregate([
        {
          $match: {
            $and: [
              {
                providerId: ObjectId(id),
              },
              {
                startTime: {
                  $gte: startDate,
                  $lte: endDate,
                },
              },
              {
                isActive: true,
              },
              {
                isDeleted: false,
              },
            ],
          },
        },
      ]);
      return message.successResponse(
        { "Content-Type": "application/json" },
        responseCode.success,
        slots
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
    addProviderSlot,
    findAllProviderSlot,
    getProviderSlotById,
    getProviderSlotCount,
    getProviderSlotByAggregate,
    updateProviderSlot,
    softDeleteProviderSlot,
    bulkInsertProviderSlot,
    bulkUpdateProviderSlot,
    deleteProviderSlot,
    getAllAvailableProviderSlot,
    getAvailableProviderSlot,
    removeEmpty,
  });
}

module.exports = makeProviderSlotController;
