const message = require("../../../utils/messages");
const responseCode = require("../../../utils/responseCode");
const moment = require("moment");
const db = require("../../../config/db");
const availableSlot = require("../../../model/availableSlot")(db);
const providerSlotModel = require("../../../model/providerSlot")(db);
const Role = require("../../../model/role")(db);
const User = require("../../../model/user")(db);
const {
  TIMESLOT_TYPE,
  TIMEZONE,
  OFFSET,
  BUFFERAVAILABLESLOT_IN_DAYS,
} = require("../../../config/authConstant");
const { getTimezone } = require("countries-and-timezones");
const Slot = require("../../../model/slot")(db);
var ObjectId = require("mongodb").ObjectId;
const _ = require("lodash");
const { USER_ROLE } = require("../../../config/authConstant");

moment.tz.setDefault(process.env.UTC_TIMEZONE);

function makeProviderSlotController({ providerSlotService, makeProviderSlot }) {
  const getDate = async (dayOfWeek) => {
    try {
      const desiredWeekday = dayOfWeek;
      const currentWeekday = moment().isoWeekday();
      return (desiredWeekday - currentWeekday + 7) % 7;
    } catch (error) {
      console.error("Error - getDate", error);
      throw new Error(error);
    }
  };

  const addAvailableSlot = async (
    offset,
    dayOfWeek,
    sTime,
    eTime,
    duration,
    providerId,
    startDate,
    repeatDate = new moment()
  ) => {
    try {
      // console.log(repeatDate);
      await User.findOneAndUpdate({ _id: providerId }, { hasSlots: true });
      let i = 0;
      do {
        // const missingDays = await getDate(dayOfWeek);
        // let startTime = moment().add(missingDays, "days");
        // startTime = startTime.format("YYYY-MM-DD[T]" + sTime);
        // let endTime = moment().add(missingDays, "days");
        // endTime = endTime.format("YYYY-MM-DD[T]" + eTime);
        let startTime = moment(startDate).format(
          "YYYY-MM-DD[T]" + sTime + ":00"
        );
        let endTime = moment(startDate).format("YYYY-MM-DD[T]" + eTime + ":00");
        // console.log(startTime, endTime);
        // if (offset <= 0) {
        //   startTime = moment(startTime).add(moment.duration().hours(offset));
        //   endTime = moment(endTime).add(moment.duration().hours(offset));
        // } else {
        //   startTime = moment(startTime).subtract(
        //     moment.duration().hours(offset)
        //   );
        //   endTime = moment(endTime).subtract(moment.duration().hours(offset));
        // }
        if (offset[0] === "-") {
          startTime = moment(startTime).add(
            moment.duration(offset.split("-")[1])
          );
          endTime = moment(endTime).add(moment.duration(offset.split("-")[1]));
        } else {
          startTime = moment(startTime).subtract(
            moment.duration(offset.split("+")[1])
          );
          endTime = moment(endTime).subtract(
            moment.duration(offset.split("+")[1])
          );
        }

        let result = await availableSlot.create({
          startTime: startTime,
          endTime: endTime,
          duration: duration,
          providerId: providerId,
        });
        // console.log(result);
        startDate = moment(startDate).add(7, "days").format("YYYY-MM-DD");
        // console.log(startDate, i);
        i++;
      } while (startDate <= repeatDate && i <= BUFFERAVAILABLESLOT_IN_DAYS / 7);
    } catch (error) {
      console.error(error);
      throw new Error("Error -addAvailableSlot");
    }
  };

  const defaultSlot = async () => {
    try {
      let result = await Slot.find();
      return message.successResponse(
        { "Content-Type": "application/json" },
        responseCode.success,
        result
      );
    } catch (error) {
      console.error("Error -defaultSlot", error);
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

  const makeDurations = async (data) => {
    try {
      let durations = data.durations;
      let durationsIds = _.map(durations, (doc) => {
        let startTime = moment(doc.startTime, "HH:mm");
        let endTime = moment(doc.endTime, "HH:mm");
        let allDurations = [];
        let interval = 30;
        let startDateTime = moment(startTime).add(interval, "minutes");
        let i = 1;
        while (startDateTime <= endTime) {
          let startDate = moment(startTime);
          startTime.add(interval, "minutes");
          startDateTime.add(interval, "minutes");
          let endDate = moment(startTime);
          allDurations.push({
            durationNumber: i,
            startTime: startDate.format("HH:mm"),
            endTime: endDate.format("HH:mm"),
            duration: interval,
          });
          i++;
        }

        return allDurations;
      });
      data.durations = durationsIds.flat();
      return data;
    } catch (error) {
      console.error("Error -makeDurations", error);
      throw new Error(error);
    }
  };

  const addProviderSlot = async ({ req }) => {
    try {
      // console.log(req.headers.timezone);
      let data = req.body;
      let createdProviderSlotData = [];
      let offset;
      const resultData = _.map(data, async (doc) => {
        if (doc.type == TIMESLOT_TYPE.DAILY) {
          doc = await makeDurations(doc);
        }
        // console.log(doc);
        createdProviderSlot = await providerSlotModel.create(doc);
        createdProviderSlotData.push(createdProviderSlot);

        let durations = createdProviderSlot.durations;
        const timezoneOffset = req.headers.timezone
          ? req.headers.timezone
          : TIMEZONE;
        let offset = getTimezone(timezoneOffset).utcOffsetStr;
        // offset = moment().utcOffset(offset).utcOffset();
        await Promise.all(
          _.map(durations, async (doc) => {
            let missingDays = await getDate(createdProviderSlot.dayOfWeek);
            let startDate = moment().add(missingDays, "days");
            startDate = startDate.format("YYYY-MM-DD");
            if (createdProviderSlot.repeatUntil) {
              let repeatDate = moment(createdProviderSlot.repeatDate).format(
                "YYYY-MM-DD"
              );
              if (repeatDate >= startDate) {
                await addAvailableSlot(
                  offset,
                  createdProviderSlot.dayOfWeek,
                  doc.startTime,
                  doc.endTime,
                  doc.duration,
                  createdProviderSlot.providerId,
                  startDate,
                  repeatDate
                );
              }
            } else {
              await addAvailableSlot(
                offset,
                createdProviderSlot.dayOfWeek,
                doc.startTime,
                doc.endTime,
                doc.duration,
                createdProviderSlot.providerId,
                startDate
              );
            }
          })
        );
      });
      const result = await Promise.all(resultData);
      return message.successResponse(
        { "Content-Type": "application/json" },
        responseCode.success,
        createdProviderSlotData,
        req.i18n.t("providerSlot.create")
      );
    } catch (error) {
      console.error("Error -addProviderSlot", error);
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
  const updateProviderSlot = async ({ req }) => {
    try {
      await providerSlotModel.deleteMany({
        providerId: req.user.id,
      });
      let sTime = moment().format("YYYY-MM-DD[T]00:00:00.SSS[Z]");
      await availableSlot.deleteMany({
        providerId: req.body[0].providerId,
        startTime: {
          $gte: sTime,
        },
        isActive: true,
      });
      createdProviderSlotData = [];
      const resultData = _.map(req.body, async (doc) => {
        if (doc.type == TIMESLOT_TYPE.DAILY) {
          doc = await makeDurations(doc);
        }
        createdProviderSlot = await providerSlotModel.create(doc);
        createdProviderSlotData.push(createdProviderSlot);

        let durations = createdProviderSlot.durations;
        // if (req.headers.offset == undefined) {
        // offset = getTimezone(TIMEZONE).utcOffsetStr;
        // offset = moment().utcOffset(offset).utcOffset();
        // } else {
        //   offset = req.headers.offset;
        // }
        const timezoneOffset = req.headers.timezone
          ? req.headers.timezone
          : TIMEZONE;
        let offset = getTimezone(timezoneOffset).utcOffsetStr;
        // offset = moment().utcOffset(offset).utcOffset();
        await Promise.all(
          _.map(durations, async (doc) => {
            let missingDays = await getDate(createdProviderSlot.dayOfWeek);
            let startDate = moment().add(missingDays, "days");
            startDate = startDate.format("YYYY-MM-DD");
            if (createdProviderSlot.repeatUntil) {
              let repeatDate = moment(createdProviderSlot.repeatDate).format(
                "YYYY-MM-DD"
              );
              if (repeatDate >= startDate) {
                await addAvailableSlot(
                  offset,
                  createdProviderSlot.dayOfWeek,
                  doc.startTime,
                  doc.endTime,
                  doc.duration,
                  createdProviderSlot.providerId,
                  startDate,
                  repeatDate
                );
              }
            } else {
              await addAvailableSlot(
                offset,
                createdProviderSlot.dayOfWeek,
                doc.startTime,
                doc.endTime,
                doc.duration,
                createdProviderSlot.providerId,
                startDate
              );
            }
          })
        );
      });
      const result = await Promise.all(resultData);
      return message.successResponse(
        { "Content-Type": "application/json" },
        responseCode.success,
        createdProviderSlotData,
        req.i18n.t("providerSlot.update")
      );
    } catch (error) {
      console.error("Error -updateProviderSlot", error);
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

  const getProviderSlotByProviderId = async (req) => {
    try {
      if (req) {
        let providerSlot = await providerSlotModel.find({
          providerId: req.user.id,
        });
        if (!providerSlot) {
          providerSlot = [];
        }
        return message.successResponse(
          { "Content-Type": "application/json" },
          responseCode.success,
          providerSlot,
          req.i18n.t("providerSlot.findAll")
        );
      }
      return message.badRequest(
        { "Content-Type": "application/json" },
        responseCode.badRequest,
        {},
        req.i18n.t("response_message.badRequest")
      );
    } catch (error) {
      console.error("Error -getProviderSlotByProviderId", error);
      return message.failureResponse(
        { "Content-Type": "application/json" },
        responseCode.internalServerError,
        error.message
      );
    }
  };

  function convertLocalDateToUTCDate(date, offset) {
    // var newDate = new Date(
    //   date.getTime() + date.getTimezoneOffset() * 60 * 1000
    // );

    // var offset = date.getTimezoneOffset() / 60;
    // var hours = date.getHours();

    // newDate.setHours(hours - offset);
    if (offset <= 0) {
      date = moment(date).add(moment.duration().hours(offset));
    } else {
      date = moment(date).subtract(moment.duration().hours(offset));
    }
    return date;
  }

  const getAllAvailableProviderSlot = async ({ req }) => {
    try {
      const timezoneOffset = req.headers.timezone
        ? req.headers.timezone
        : TIMEZONE;
      let offset = getTimezone(timezoneOffset).utcOffsetStr;
      offset = moment().utcOffset(offset).utcOffset();
      let skip = 0;
      skip = req.body.page <= 0 ? 0 : (req.body.page - 1) * req.body.limit;
      const data = {
        ...req.body,
      };
      if (data.query == undefined) {
        throw new Error("Enter the query");
      }
      data.query = _.map(data.query, (doc) => {
        return ObjectId(doc);
      });
      const roleCodes = await Role.find({
        code: USER_ROLE.Physician,
      });
      const allProviderIds = await User.distinct("_id", {
        roleIds: roleCodes[0]._id,
      });
      let todayTime = convertLocalDateToUTCDate(new Date(), offset);
      todayTime = new Date(todayTime);
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
          $match: {
            slots: {
              $not: { $size: 0 },
            },
          },
        },
        {
          $sort: { _id: 1 },
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
              $all: data.query,
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
            firstName: "$user.firstName",
            lastName: "$user.lastName",
            description: { $ifNull: ["$user.description", ""] },
            profilePictureId: "$profilePictureId",
            specialisation: "$specialisation",
            city: "$city.name",
            province: "$province.name",
            services: "$services",
            rating: {
              $ifNull: ["$user.averageRating", 0],
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
        {
          $facet: {
            metadata: [{ $count: "total" }],
            data: [
              { $skip: skip },
              { $limit: data.limit },
              { $sort: { nextAvailableSlot: 1 } },
            ],
          },
        },
      ];
      const allProviderSlots = await availableSlot.aggregate(aggregate);
      return message.successResponse(
        { "Content-Type": "application/json" },
        responseCode.success,
        allProviderSlots,
        req.i18n.t("providerSlot.findAll")
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

  const getAvailableProviderSlot = async ({ req }) => {
    try {
      let data = req.body;
      let id = req.pathParams.id;
      // let offset = req.headers.offset ? req.headers.offset : OFFSET;
      // const timezone = req.headers.timezone ? req.headers.timezone : TIMEZONE;
      // let offsetHours = getTimezone(timezone).utcOffsetStr;
      const timezoneOffset = req.headers.timezone
        ? req.headers.timezone
        : TIMEZONE;
      let offset = getTimezone(timezoneOffset).utcOffsetStr;
      let startDate, endDate;
      startDate = moment(data.date);
      // console.log(startDate);
      startDate = new Date(startDate.format(`YYYY-MM-DD`));
      endDate = moment(data.date).add(1, "days");
      endDate = new Date(endDate.format(`YYYY-MM-DD`));
      // console.log(startDate, endDate, offset.split("+")[1]);
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
              // {
              //   isActive: true,
              // },
              // {
              //   isDeleted: false,
              // },
            ],
          },
        },
        {
          $addFields: {
            startTime: {
              $dateToString: {
                date: "$startTime",
                timezone: timezoneOffset,
              },
            },
            endTime: {
              $dateToString: {
                date: "$endTime",
                timezone: timezoneOffset,
              },
            },
          },
        },
        {
          $sort: { startTime: 1 },
        },
      ]);
      return message.successResponse(
        { "Content-Type": "application/json" },
        responseCode.success,
        slots,
        req.i18n.t("providerSlot.findAll")
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
        if (options.populate) {
          delete options.populate;
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
        const providerSlot = await providerSlotModel.find({
          providerId: id,
        });
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
    defaultSlot,
    getProviderSlotByProviderId,
    getAvailableProviderSlot,
    getAllAvailableProviderSlot,
    findAllProviderSlot,
    getProviderSlotById,
    getProviderSlotCount,
    getProviderSlotByAggregate,
    updateProviderSlot,
    softDeleteProviderSlot,
    bulkInsertProviderSlot,
    bulkUpdateProviderSlot,
    deleteProviderSlot,
    removeEmpty,
  });
}

module.exports = makeProviderSlotController;
