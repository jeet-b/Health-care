const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const db = require("../config/db");
const Transaction = require("../model/transaction")(db);
const Order = require("../model/order")(db);
const User = require("../model/user")(db);
const Appointment = require("../model/appointment")(db);
const AppointmentSummary = require("../model/appointmentSummary")(db);
const Specialisation = require("../model/specialisation")(db);
const Master = require("../model/master")(db);
const Invoice = require("../model/invoice")(db);
const Role = require("../model/role")(db);
const pdf = require("html-pdf");
const fs = require("fs");
const moment = require("moment");
const ejs = require("ejs");
const path = require("path");
const { getTimezone } = require("countries-and-timezones");
const {
  TAX_PERCENTAGE,
  PAYMENT_STATUS,
  TRANSACTION_LOG,
  CHARGE_TYPE,
  PHYSICIAN_AMOUNT,
  INVOICE_PREFIX,
  COUNTRYCODE,
  EMAIL_SUBJECT,
  NOTIFICATION_TITLE,
  USER_ROLE,
  TIMEZONE,
} = require("../config/authConstant");
const PaymentService = require("./stripe/payment");
const _ = require("lodash");
const { POPULATE } = require("../config/constant/user");
const {
  sendSESEmail,
  emailQueue,
  sendEmailPdf,
} = require("./email/emailService");
const { NOTIFICATION_MESSAGE } = require("../config/message");
const notificationService = require("./notification");
// const { sendEmailPdf } = require("../config/email");
const createPdf = async (html, pdfName, order_Id) =>
  new Promise(async (resolve, reject) => {
    const options = {
      // "format": "Letter",        // allowed units: A3, A4, A5, Legal, Letter, Tabloid
      // "orientation": "portrait", // portrait or landscape
      height: "14in", // allowed units: mm, cm, in, px
      width: "8.5in",
    };
    pdf
      .create(html, options)
      .toFile(
        `public/invoice/${order_Id}/public_invoice/${pdfName}.pdf`,
        (err, result) => {
          if (err) {
            reject(err);
          }
          resolve(result.filename);
        }
      );
  });

const randomString = async (length, chars) => {
  var result = "";
  for (var i = length; i > 0; --i)
    result += chars[Math.floor(Math.random() * chars.length)];
  return result;
};
const generateInvoiceNumber = async () => {
  var rString = await randomString(7, "0123456789");
  const invoiceData = await Invoice.findOne({ invoiceNumber: rString });
  if (!invoiceData) {
    return rString;
  } else {
    var rString = await randomString(7, "0123456789");
    return rString;
  }
};
const convertDateToLocalDate = (startTime, endTime) => {
  try {
    const timezoneOffset = TIMEZONE;
    let offset = getTimezone(timezoneOffset).utcOffsetStr;
    offset = moment().utcOffset(offset).utcOffset();
    if (offset >= 0) {
      startTime = moment(startTime).add(offset, "m").toDate();
      endTime = moment(endTime).add(offset, "m").toDate();
    } else {
      startTime = moment(startTime).subtract(offset, "m").toDate();
      endTime = moment(endTime).subtract(offset, "m").toDate();
    }
    return { startTime, endTime };
  } catch (error) {
    console.error("Error - convertDateToLocalDate", error);
    throw new Error(error);
  }
};
const createPayment = async (appointmentId) => {
  try {
    let taxAmount = 0;
    let price = 0;
    let appointmentData = await Appointment.findById(appointmentId).populate([
      "patientId",
    ]);
    let specialisationData = await Specialisation.findById(
      appointmentData.specialisationId
    );
    let physicianAmount = PHYSICIAN_AMOUNT;
    let chargeType = null;
    let paymentData;
    let orderData = {
      addedBy: appointmentData.addedBy,
      appointmentId: appointmentData._id,
      providerId: appointmentData.providerId,
      patientId: appointmentData.patientId._id,
      specialisationId: appointmentData.specialisationId,
    };

    if (appointmentData.penalty != undefined) {
      orderData.penalty = appointmentData.penalty;
      price = specialisationData.price + appointmentData.penalty;
    } else {
      price = specialisationData.price;
    }
    if (price != 0) {
      taxAmount = Math.round((TAX_PERCENTAGE / 100) * price * 100) / 100;
    }
    orderData.subTotal = price;
    orderData.taxAmount = taxAmount;
    orderData.total = price + taxAmount;
    orderDetails = await Order.create(orderData);
    await Appointment.findOneAndUpdate(
      { _id: appointmentId },
      { orderId: orderDetails._id }
    );
    let response = {};
    if (orderDetails.total > 0) {
      paymentData = await PaymentService.chargeCustomer(
        orderDetails,
        appointmentData.cardId
      );
      // console.log(paymentData)
      response = await transactionLog(paymentData, chargeType, physicianAmount);
      let adminRole = await Role.findOne({ code: USER_ROLE.Admin });
      let adminUser = await User.find({ roleIds: adminRole._id });
      let date = moment(orderDetails.createdAt).format("YYYY-MM-DD");
      let localDate = await convertDateToLocalDate(
        moment(orderDetails.createdAt)
      );
      let time = moment(localDate.startTime).format("HH:mm");
      if (paymentData.transactionSuccess !== false) {
        await Appointment.findOneAndUpdate(
          { _id: appointmentId },
          { isPaid: true }
        );
        await Promise.all(
          _.map(adminUser, async (doc) => {
            await notificationService.create(
              doc._id,
              NOTIFICATION_TITLE.PAYMENT_SUCCESS,
              NOTIFICATION_MESSAGE.PAYMENT_SUCCESS_ADMIN(
                appointmentData.APID,
                date,
                time,
                paymentData.paymentTransactionId
              )
            );
          })
        );
        await notificationService.create(
          appointmentData.patientId,
          NOTIFICATION_TITLE.PAYMENT_SUCCESS,
          NOTIFICATION_MESSAGE.PAYMENT_SUCCESS_PATIENT(appointmentData.APID)
        );
        await notificationService.create(
          appointmentData.providerId,
          NOTIFICATION_TITLE.PAYMENT_SUCCESS,
          NOTIFICATION_MESSAGE.PAYMENT_SUCCESS_PHYSICIAN(
            appointmentData.patientId.name,
            appointmentData.APID
          )
        );
        await sendInvoice(appointmentId);
      } else {
        await Promise.all(
          _.map(adminUser, async (doc) => {
            await notificationService.create(
              doc._id,
              NOTIFICATION_TITLE.PAYMENT_SUCCESS,
              NOTIFICATION_MESSAGE.PAYMENT_FAILED_ADMIN(
                appointmentData.APID,
                date,
                time,
                paymentData.failedTransactionId
              )
            );
          })
        );
        await notificationService.create(
          appointmentData.patientId,
          NOTIFICATION_TITLE.PAYMENT_FAILED,
          NOTIFICATION_MESSAGE.PAYMENT_FAILED_PATIENT(appointmentData.APID)
        );
        await notificationService.create(
          appointmentData.providerId,
          NOTIFICATION_TITLE.PAYMENT_FAILED,
          NOTIFICATION_MESSAGE.PAYMENT_FAILED_PHYSICIAN(
            appointmentData.patientId.name,
            appointmentData.APID
          )
        );
      }
    } else {
      response = await addFreeTransactionLog(orderDetails);
    }

    return (paymentData = {
      transactionSuccess: paymentData.transactionSuccess,
    });
  } catch (error) {
    console.error("Error - createPayment", error);
    throw new Error(error);
  }
};

const treatmentPayment = async (appointmentSummaryId, cardId, chargeType) => {
  let taxAmount = 0;
  let price = 0;
  let paymentData = {};
  let appointmentSummaryData = await AppointmentSummary.findById(
    appointmentSummaryId
  ).populate([
    "appointmentId",
    { path: "treatmentIds", populate: { path: "images" } },
  ]);
  let specialisationData = await Specialisation.findById(
    appointmentSummaryData.appointmentId.specialisationId
  );

  let orderData = {
    addedBy: appointmentSummaryData.patientId,
    appointmentId: appointmentSummaryData.appointmentId,
    providerId: appointmentSummaryData.providerId,
    patientId: appointmentSummaryData.patientId,
    specialisationId: appointmentSummaryData.appointmentId.specialisationId,
  };
  let resultData = await _.map(
    appointmentSummaryData.treatmentIds,
    async (doc) => {
      price = price + doc.price;
      return price;
    }
  );
  if (specialisationData.price < price) {
    price = price - specialisationData.price;
  } else {
    price = 0;
  }
  if (price != 0) {
    taxAmount = Math.round((TAX_PERCENTAGE / 100) * price * 100) / 100;
  }
  // console.log(price);
  orderData.subTotal = price;
  orderData.taxAmount = taxAmount;
  orderData.total = price + taxAmount;
  orderDetails = await Order.create(orderData);
  await AppointmentSummary.findOneAndUpdate(
    { _id: appointmentSummaryData._id },
    { orderId: orderDetails._id }
  );
  let response = {};
  if (orderDetails.total > 0) {
    paymentData = await PaymentService.chargeCustomer(orderDetails, cardId);
    // console.log(paymentData)
    // console.log(chargeType);
    response = await transactionLog(paymentData, chargeType);
    if (paymentData.transactionSuccess !== false) {
      let tenWeek = new Date();
      tenWeek.setDate(tenWeek.getDate() + 70);
      let twelveWeek = new Date();
      twelveWeek.setDate(twelveWeek.getDate() + 84);
      await Appointment.findOneAndUpdate(
        { _id: appointmentSummaryData.appointmentId },
        {
          isTreatmentPaid: true,
          treatmentPaidOn: new Date(),
          firstFollowUpTreatmentMail: tenWeek,
          secondFollowUpTreatmentMail: twelveWeek,
        }
      );
      await sendTreatmentInvoice(appointmentSummaryId);
      await sendPharmacyInvoice(appointmentSummaryId);
    }
  } else {
    response = await addFreeTransactionLog(orderDetails, chargeType);
    paymentData.transactionSuccess = true;
  }
  // if (response) {
  //   await sendInvoice(appointmentId, appointmentData.orderId);
  // }
  // let transactionStatus = {
  //   transactionSuccess: transactionSuccess
  // }
  return (paymentData = {
    transactionSuccess: paymentData.transactionSuccess,
  });
};

const sendInvoice = async (appointmentId) => {
  try {
    // let appUrl = process.env.CLIENT_URL;
    const populate = [
      "providerId",
      "specialisationId",
      {
        path: "patientId",
        populate: [
          {
            path: "practiceAddressId",
            populate: [
              { path: "countryId", select: "name code", model: "country" },
              {
                path: "provinceId",
                select: "name code countryId",
                model: "province",
              },
              { path: "cityId", select: "name code provinceId", model: "city" },
              {
                path: "postalCodeId",
                select: "postalCode cityId",
                model: "postalCode",
              },
            ],
          },
        ],
      },
      {
        path: "orderId",
        populate: [
          {
            path: "transactionId",
          },
        ],
      },
    ];
    const appointmentData = await Appointment.findOne({
      _id: appointmentId,
    }).populate(populate);

    const invoiceNumber = INVOICE_PREFIX + (await generateInvoiceNumber());
    let createdAt = moment().format("MMM D, YYYY");
    let appointmentNumber = appointmentData.APID.split("-")[1];
    let invoiceDetails = {
      logo: logoPath64,
      footerLogo: footerPath64,
      invoiceNumber: invoiceNumber,
      addressLine1: appointmentData.patientId.practiceAddressId.addressLine1,
      province: appointmentData.patientId.practiceAddressId.provinceId.name,
      country: appointmentData.patientId.practiceAddressId.countryId.name,
      city: appointmentData.patientId.practiceAddressId.cityId.name,
      postalCode:
        appointmentData.patientId.practiceAddressId.postalCodeId.postalCode,
      apid: appointmentData.APID,
      patientName: appointmentData.patientId.name,
      providerName: appointmentData.providerId.name,
      patientId: appointmentData.patientId.uniqueId,
      dateIssued: createdAt,
      specialisationName: appointmentData.specialisationId.name,
      specialisationDescription: appointmentData.specialisationId.description,
      qty: 1,
      specialisationPrice: appointmentData.specialisationId.price,
      patientPhone: COUNTRYCODE + appointmentData.patientId.phone,
      patientEmail: appointmentData.patientId.email,
      appointmentNumber: appointmentNumber,
      endingWith: appointmentData.orderId.transactionId.card.last4,
    };

    let html;
    html = await ejs.renderFile(
      path.join(__dirname, "../views/pdf/appointment-invoice.ejs"),
      {
        data: invoiceDetails,
      }
    );

    let invoiceData = await Invoice.create({
      uri: `/invoice/${appointmentData.orderId._id}/public_invoice/${invoiceNumber}.pdf`,
      invoiceNumber: invoiceNumber,
      orderId: appointmentData.orderId._id,
      transactionId: appointmentData.orderId.transactionId._id,
      appointmentId: appointmentData._id,
      patientId: appointmentData.patientId._id,
      providerId: appointmentData.providerId._id,
      totalAmount: appointmentData.specialisationId.price,
    });
    if (invoiceData) {
      await Appointment.findOneAndUpdate(
        { _id: appointmentId },
        { invoiceId: invoiceData.id }
      );
      await Transaction.findOneAndUpdate(
        { _id: appointmentData.orderId.transactionId._id },
        { invoice: invoiceData.uri }
      );
    }

    const pdf = await createPdf(
      html,
      invoiceNumber,
      appointmentData.orderId._id
    );

    const attachment = [
      {
        filename: `${invoiceNumber}.pdf`,
        path: path.join(
          __dirname +
            `/../public/invoice/${appointmentData.orderId._id}/public_invoice/${invoiceNumber}.pdf`
        ),
        content: fs.readFileSync(
          path.join(
            __dirname +
              `/../public/invoice/${appointmentData.orderId._id}/public_invoice/${invoiceNumber}.pdf`
          )
        ),
        contentType: "application/pdf",
      },
    ];
    await sendEmailPdf(
      // process.env.TESTING_EMAIL,
      appointmentData.patientId.email,
      EMAIL_SUBJECT.APPOINTMENT_INVOICE,
      NOTIFICATION_MESSAGE.APPOINTMENT_INVOICE(),
      attachment
    );
    return true;
  } catch (error) {
    console.error(error);
    throw new Error(error);
  }
};

const sendTreatmentInvoice = async (appointmentSummaryId, totalAmount) => {
  try {
    // let appUrl = process.env.CLIENT_URL;
    const populate = [
      "providerId",
      "appointmentId",
      {
        path: "patientId",
        populate: [
          {
            path: "practiceAddressId",
            populate: [
              { path: "countryId", select: "name code", model: "country" },
              {
                path: "provinceId",
                select: "name code countryId",
                model: "province",
              },
              { path: "cityId", select: "name code provinceId", model: "city" },
              {
                path: "postalCodeId",
                select: "postalCode cityId",
                model: "postalCode",
              },
            ],
          },
        ],
      },
      {
        path: "orderId",
        populate: [
          {
            path: "transactionId",
          },
        ],
      },
      {
        path: "treatment.treatmentId",
        populate: [{ path: "images", model: "file" }],
      },
    ];
    const appointmentSummaryData = await AppointmentSummary.findOne({
      _id: appointmentSummaryId,
    }).populate(populate);

    const invoiceNumber = INVOICE_PREFIX + (await generateInvoiceNumber());
    let createdAt = moment().format("MMM D, YYYY");
    let dob = moment(appointmentSummaryData.patientId.dob).format(
      "MMM D, YYYY"
    );
    let appointmentNumber =
      appointmentSummaryData.appointmentId.APID.split("-")[1];
    let invoiceDetails = {
      logo: logoPath64,
      footerLogo: footerPath64,
      invoiceNumber: invoiceNumber,
      addressLine1:
        appointmentSummaryData.patientId.practiceAddressId.addressLine1,
      province:
        appointmentSummaryData.patientId.practiceAddressId.provinceId.name,
      country:
        appointmentSummaryData.patientId.practiceAddressId.countryId.name,
      city: appointmentSummaryData.patientId.practiceAddressId.cityId.name,
      postalCode:
        appointmentSummaryData.patientId.practiceAddressId.postalCodeId
          .postalCode,
      patientName: appointmentSummaryData.patientId.name,
      providerName: appointmentSummaryData.providerId.name,
      providerPhone: appointmentSummaryData.providerId.phone,
      patientId: appointmentSummaryData.patientId.uniqueId,
      dateIssued: createdAt,
      patientPhone: COUNTRYCODE + appointmentSummaryData.patientId.phone,
      patientEmail: appointmentSummaryData.patientId.email,
      dob: dob,
      appointmentNumber: appointmentNumber,
      treatment: appointmentSummaryData.treatment,
      treatmentInstruction: appointmentSummaryData.treatmentIds,
    };

    let html;
    html = await ejs.renderFile(
      path.join(__dirname, "../views/pdf/treatment-invoice.ejs"),
      {
        data: invoiceDetails,
      }
    );

    let invoiceData = await Invoice.create({
      uri: `/invoice/${appointmentSummaryData.orderId._id}/public_invoice/${invoiceNumber}.pdf`,
      invoiceNumber: invoiceNumber,
      orderId: appointmentSummaryData.orderId._id,
      transactionId: appointmentSummaryData.orderId.transactionId._id,
      appointmentId: appointmentSummaryData.appointmentId._id,
      patientId: appointmentSummaryData.patientId._id,
      providerId: appointmentSummaryData.providerId._id,
      totalAmount: totalAmount,
    });
    if (invoiceData) {
      await AppointmentSummary.findOneAndUpdate(
        { _id: appointmentSummaryId },
        { treatmentInvoice: invoiceData.uri }
      );
      await Transaction.findOneAndUpdate(
        { _id: appointmentSummaryData.orderId.transactionId._id },
        { invoice: invoiceData.uri }
      );
    }

    const pdf = await createPdf(
      html,
      invoiceNumber,
      appointmentSummaryData.orderId._id
    );

    const attachment = [
      {
        filename: `${invoiceNumber}.pdf`,
        path: path.join(
          __dirname +
            `/../public/invoice/${appointmentSummaryData.orderId._id}/public_invoice/${invoiceNumber}.pdf`
        ),
        content: fs.readFileSync(
          path.join(
            __dirname +
              `/../public/invoice/${appointmentSummaryData.orderId._id}/public_invoice/${invoiceNumber}.pdf`
          )
        ),
        contentType: "application/pdf",
      },
    ];
    await sendEmailPdf(
      // process.env.TESTING_EMAIL,
      appointmentSummaryData.patientId.email,
      EMAIL_SUBJECT.APPOINTMENT_INVOICE,
      NOTIFICATION_MESSAGE.APPOINTMENT_INVOICE(),
      attachment
    );
    return true;
  } catch (error) {
    console.error(error);
    throw new Error(error);
  }
};

const sendPharmacyInvoice = async (appointmentSummaryId, totalAmount) => {
  try {
    // let appUrl = process.env.CLIENT_URL;
    const populate = [
      "providerId",
      "appointmentId",
      "pharmacyId",
      {
        path: "patientId",
        populate: [
          {
            path: "practiceAddressId",
            populate: [
              { path: "countryId", select: "name code", model: "country" },
              {
                path: "provinceId",
                select: "name code countryId",
                model: "province",
              },
              { path: "cityId", select: "name code provinceId", model: "city" },
              {
                path: "postalCodeId",
                select: "postalCode cityId",
                model: "postalCode",
              },
            ],
          },
        ],
      },
      {
        path: "orderId",
        populate: [
          {
            path: "transactionId",
          },
        ],
      },
      {
        path: "treatment.treatmentId",
        populate: [{ path: "images", model: "file" }],
      },
    ];
    const appointmentSummaryData = await AppointmentSummary.findOne({
      _id: appointmentSummaryId,
    }).populate(populate);

    const invoiceNumber = INVOICE_PREFIX + (await generateInvoiceNumber());
    let createdAt = moment().format("MMM D, YYYY");
    let dob = moment(appointmentSummaryData.patientId.dob).format(
      "MMM D, YYYY"
    );
    let appointmentNumber =
      appointmentSummaryData.appointmentId.APID.split("-")[1];
    let invoiceDetails = {
      logo: logoPath64,
      footerLogo: footerPath64,
      invoiceNumber: invoiceNumber,
      addressLine1:
        appointmentSummaryData.patientId.practiceAddressId.addressLine1,
      province:
        appointmentSummaryData.patientId.practiceAddressId.provinceId.name,
      country:
        appointmentSummaryData.patientId.practiceAddressId.countryId.name,
      city: appointmentSummaryData.patientId.practiceAddressId.cityId.name,
      postalCode:
        appointmentSummaryData.patientId.practiceAddressId.postalCodeId
          .postalCode,
      patientName: appointmentSummaryData.patientId.name,
      providerName: appointmentSummaryData.providerId.name,
      providerPhone: appointmentSummaryData.providerId.phone,
      patientId: appointmentSummaryData.patientId.uniqueId,
      dateIssued: createdAt,
      patientPhone: COUNTRYCODE + appointmentSummaryData.patientId.phone,
      patientEmail: appointmentSummaryData.patientId.email,
      dob: dob,
      appointmentNumber: appointmentNumber,
      treatment: appointmentSummaryData.treatment,
      treatmentInstruction: appointmentSummaryData.treatmentIds,
    };

    let html;
    html = await ejs.renderFile(
      path.join(__dirname, "../views/pdf/e-script.ejs"),
      {
        data: invoiceDetails,
      }
    );

    // let invoiceData = await Invoice.create({
    //   uri: `/public/invoice/${appointmentSummaryData.orderId._id}/public_invoice/${invoiceNumber}.pdf`,
    //   invoiceNumber: invoiceNumber,
    //   orderId: appointmentSummaryData.orderId._id,
    //   transactionId: appointmentSummaryData.orderId.transactionId._id,
    //   appointmentId: appointmentSummaryData.appointmentId._id,
    //   patientId: appointmentSummaryData.patientId._id,
    //   providerId: appointmentSummaryData.providerId._id,
    //   totalAmount: totalAmount,
    // });
    // if (invoiceData) {
    //   await AppointmentSummary.findOneAndUpdate(
    //     { _id: appointmentSummaryId },
    //     { treatmentInvoice: invoiceData.id }
    //   );
    // }

    const pdf = await createPdf(
      html,
      invoiceNumber,
      appointmentSummaryData.orderId._id
    );

    const attachment = [
      {
        filename: `${invoiceNumber}.pdf`,
        path: path.join(
          __dirname +
            `/../public/invoice/${appointmentSummaryData.orderId._id}/public_invoice/${invoiceNumber}.pdf`
        ),
        content: fs.readFileSync(
          path.join(
            __dirname +
              `/../public/invoice/${appointmentSummaryData.orderId._id}/public_invoice/${invoiceNumber}.pdf`
          )
        ),
        contentType: "application/pdf",
      },
    ];
    await sendEmailPdf(
      // process.env.TESTING_EMAIL,
      appointmentSummaryData.pharmacyId.emails[0].email,
      EMAIL_SUBJECT.APPOINTMENT_INVOICE,
      NOTIFICATION_MESSAGE.APPOINTMENT_INVOICE(),
      attachment
    );
    return true;
  } catch (error) {
    console.error(error);
    throw new Error(error);
  }
};

const transactionLog = async (data, chargeType, physicianAmount) => {
  let {
    patientId,
    providerId,
    orderId,
    transactionSuccess,
    errorData,
    taxAmount,
    failedTransactionId,
    transactionFees,
    transactionCard,
    orderCost,
    subTotal,
    penalty,
    paymentTransactionId,
  } = data;
  // console.log(physicianAmount);
  let patient = await User.findOne({ _id: patientId }).select([
    "name",
    "email",
    "phone",
    "_id",
  ]);
  let provider = await User.findOne({ _id: providerId }).select([
    "name",
    "email",
    "phone",
    "_id",
  ]);

  try {
    let masterData = await Master.findOne({ code: PAYMENT_STATUS.PENDING });
    let status = masterData._id;
    let transactionObj = {
      transactionBy: patientId,
      penalty: penalty,
      subTotal: subTotal,
      orderId: orderId,
      taxAmount: taxAmount,
      provider: provider,
      patient: patient,
      patientId: patientId,
      providerId: providerId,
      // patientName: `${patient.firstName} ${patient.lastName}`,
      // providerName: `${provider.firstName} ${provider.lastName}`,
      amount: orderCost ? orderCost : 0,
      fees: transactionFees,
      type: TRANSACTION_LOG.TRANSACTION_TYPE.CREDIT,
      chargeType: chargeType ? chargeType : null,
      physicianAmount: physicianAmount,
    };
    if (transactionSuccess) {
      let masterData = await Master.findOne({ code: PAYMENT_STATUS.SUCCESS });
      status = masterData._id;
      transactionObj = Object.assign(transactionObj, {
        status: status,
        fees: transactionFees,
        paymentTransactionId: paymentTransactionId ? paymentTransactionId : "",
        remark: "payment successfull",
        card: transactionCard,
      });
    } else {
      let masterData = await Master.findOne({
        code: PAYMENT_STATUS.PAYMENT_FAILED,
      });
      status = masterData._id;
      transactionObj = Object.assign(transactionObj, {
        status: status,
        remark: "payment failed",
        paymentTransactionId: failedTransactionId ? failedTransactionId : "",
        card: transactionCard,
      });
    }

    let transactionLog = await Transaction.create(transactionObj);

    await Order.updateOne(
      { _id: orderId },
      {
        status: status,
        transactionId: transactionLog._id,
        $push: {
          statusHistory: { date: new Date(), status: PAYMENT_STATUS.SUCCESS },
        },
      }
    );
    return {
      flag: transactionSuccess,
      status: status,
      transactionId: transactionLog.paymentTransactionId,
      transactionNumber: transactionLog.transactionNumber,
      physicianName: transactionLog.physicianName,
      date: transactionLog.createdAt,
      amount: transactionLog.amount,
    };
  } catch (error) {
    console.error("payment error --- ", error);
    throw new Error(error);
  }
};

const addFreeTransactionLog = async (data, chargeType) => {
  let { patientId, providerId, _id, total } = data;
  let patient = await User.findOne({ _id: patientId }).select([
    "name",
    "email",
    "phone",
    "_id",
  ]);
  let provider = await User.findOne({ _id: providerId }).select([
    "name",
    "email",
    "phone",
    "_id",
  ]);
  try {
    let masterData = await Master.findOne({ code: PAYMENT_STATUS.SUCCESS });
    let status = masterData._id;
    let transactionObj = {
      // parentName: `${patient.firstName} ${patient.lastName}`,
      // consultingProviderName: `${provider.firstName} ${provider.lastName}`,
      amount: total,
      paymentTransactionId: null,
      orderId: _id,
      status: status,
      fees: total,
      remark: "payment successfull",
      card: null,
      statusTrack: null,
      provider: provider,
      patient: patient,
      patientId: patientId,
      providerId: providerId,
      type: TRANSACTION_LOG.TRANSACTION_TYPE.COD,
      chargeType: chargeType ? chargeType : null,
    };
    /** Store Transaction Log for customer debit**/
    // let transactionLog = await Transaction.findOneAndUpdate(
    //   { orderId: _id },
    //   transactionObj
    // );
    let transactionLog = await Transaction.create(transactionObj);

    await Order.updateOne(
      { _id: _id },
      {
        status: status,
        transactionId: transactionLog._id,
        $push: {
          statusHistory: { date: new Date(), status: PAYMENT_STATUS.SUCCESS },
        },
      }
    );
    return {
      flag: true,
      status: status,
      data: {},
      transactionId: null,
      // consultingProviderName: `${provider.firstName} ${provider.lastName}`,
      date: new Date(),
      amount: total,
    };
  } catch (error) {
    console.error("payment error --- ", error);
    throw new Error(error);
  }
};
module.exports = {
  createPayment: createPayment,
  treatmentPayment: treatmentPayment,
};
