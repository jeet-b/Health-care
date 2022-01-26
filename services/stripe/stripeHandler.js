const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const db = require("../../config/db");
const TransactionLog = require(`../../model/transaction`)(db);
const Appointment = require(`../../model/appointment`)(db);
const Order = require(`../../model/order`)(db);
const User = require(`../../model/user`)(db);
const Master = require(`../../model/master`)(db);

const {
  TRANSACTION_LOG,
  PAYMENT_STATUS,
} = require("../../config/authConstant");

let Singleton = {
  async createInstance() {
    // console.log("2");
    // console.log("stk", STRIPE_SECRET_KEY);
    instance = await require("stripe")(STRIPE_SECRET_KEY);
    return instance;
  },

  async setNewInstance() {
    // console.log("3");
    instance = undefined;
    instance = await require("stripe")(STRIPE_SECRET_KEY);
  },
};

module.exports = {
  async getStripeObject() {
    try {
      // console.log("singleton");
      // console.log(Singleton);
      let stripe = await Singleton.createInstance();
      // console.log("stripe ---- ", stripe ? "yo" : "lol");

      return stripe;
    } catch (e) {
      throw new Error(e);
    }
  },

  async setStripeNewInstance() {
    console.log("1");
    try {
      await Singleton.setNewInstance();
    } catch (e) {
      throw new Error(e);
    }
  },

  async refundPatient(appointmentId) {
    try {
      let appointmentObj = await Appointment.findOne({
        _id: appointmentId,
      });
      let transactionObj = await TransactionLog.findOne({
        orderId: appointmentObj.orderId,
      });
      let chargeId = transactionObj.paymentTransactionId;
      let amount = transactionObj.amount;
      let obj = {
        charge: chargeId,
      };
      if (amount) {
        obj.amount = Math.round(amount * 100);
      }
      let stripeObj = await this.getStripeObject();

      let refundObj = await stripeObj.refunds.create(obj);
      if (refundObj) {
        /** Store Transaction Log **/
        let transactionLog = await TransactionLog.findOne({
          paymentTransactionId: chargeId,
        });
        transactionLog = transactionLog;
        let patient = await User.findOne({ _id: transactionLog.patientId }).select(['name', 'email', 'phone', '_id']);
        let provider = await User.findOne({ _id: transactionLog.providerId }).select(['name', 'email', 'phone', '_id']);
        let masterData = await Master.findOne({code: PAYMENT_STATUS.REFUNDED});
        await TransactionLog.create({
          // transactionBy: transactionObj.transactionBy,
          paymentTransactionId: chargeId,
          type: TRANSACTION_LOG.TRANSACTION_TYPE.DEBIT,
          // patientName: transactionLog.patientName,
          // providerName: transactionLog.providerName,
          provider: provider,
          patient: patient,
          providerId: transactionLog.providerId,
          patientId: transactionLog.patientId,
          chargeType: TRANSACTION_LOG.CHARGE_TYPE.REFUND,
          amount: refundObj.amount / 100,
          transactionTo: transactionLog.patientId, 
          orderId: transactionLog.orderId,
          status: masterData._id,
          remark: "Appointment cancelled, payment refunded.",
          card: transactionLog.card,
        });
      } else {
        console.log("error");
      }
      return refundObj;
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  },

  async getToken(cardDetails) {
    let instance = await require("stripe")(STRIPE_SECRET_KEY);
    return await instance.tokens.create({
      card: {
        number: cardDetails.cardNumber,
        exp_month: cardDetails.exp_month,
        exp_year: cardDetails.exp_year,
        cvc: cardDetails.cvc,
        name: cardDetails.name,
      },
    });
  },
};

// 2tDE3orjNEd6rYuy
// getToken().then(res => console.log("res", res)).catch(err => console.log("err", err))
// getBankToken().then(res => console.log("res", res)).catch(err => console.log("err", err))
