const StripeHandler = require(`./stripeHandler`);
const db = require('../../config/db');
const User = require('../../model/user')(db);
const Master = require('../../model/master')(db);
const _ = require("lodash");
const {
	SETUP,
	PAYMENT_STATUS,
  } = require("../../config/authConstant");
  const { PAYMENT_ERRORS } = require("../../config/constant/payment");

module.exports = {
	/**
	 * Function used to create strip customer
	 * @param {*} userId
	 * @param {*} email
	 */
	async createCustomer(userId, email) {
		try {
			let stripeObj = await StripeHandler.getStripeObject();
			// console.log(stripeObj)
			let customer = await stripeObj.customers.create({ email: email });
			await User.updateOne({ _id: userId }, { stripeCustomerId: customer.id, cards: [] });
			// console.log("here", customer.id,{ _id: userId });
			return true;
		} catch (error) {
			console.error(error);
			throw new Error(error);
		}
	},

	async chargeCustomer(orderDetails, cardId) {
		const user = await User.findOne({ _id: orderDetails.patientId });
		let orderCost = orderDetails.total;
		let data = {
		  paymentType: "STRIPE",
		  orderId: orderDetails._id,
		  providerId: orderDetails.providerId,
		  patientId: orderDetails.patientId,
		  orderCost: orderCost,
		  cardId: cardId,
		  penalty: orderDetails.penalty,
		  taxAmount: orderDetails.taxAmount,
		  subTotal: orderDetails.subTotal,
		};
		try {
		  let stripeObj = await StripeHandler.getStripeObject();
		//   console.log("stripeObj", stripeObj)
		  let chargeObj = await stripeObj.charges.create({
			amount: Math.round(orderCost * 100),
			currency: SETUP.CURRENCY_CODE,
			customer: user.stripeCustomerId,
			card: cardId,
		  });
		  
		  if (chargeObj) {
			const transactionObj = await this.retrieveTransaction(
			  chargeObj.balance_transaction
			);
			
			let tax = 0;
			let taxData = _.find(transactionObj.fee_details, { type: "tax" });
			if (taxData && taxData.amount) {
			  tax = taxData.amount / 100;
			}
			let transactionFees = {
			  totalFee: transactionObj.fee / 100,
			  stripeFee:
				_.find(transactionObj.fee_details, { type: "stripe_fee" }).amount /
				100,
			  tax: tax,
			};
			let transactionCard = {
			  expMonth: chargeObj.source.exp_month,
			  expYear: chargeObj.source.exp_year,
			  last4: chargeObj.source.last4,
			  brand: chargeObj.source.brand,
			  id: chargeObj.source.id,
			};
			const masterData = await Master.findOne({code: PAYMENT_STATUS.SUCCESS});
			let paymentTransactionId = chargeObj.id;
			data.transactionObj = transactionObj;
			data.tax = tax;
			data.transactionFees = transactionFees;
			data.transactionCard = transactionCard;
			data.paymentTransactionId = paymentTransactionId;
			data.status = masterData._id;
			data.chargeObj = chargeObj;
			data.transactionSuccess = true;
			return data
		  }
		  return {}
		} catch (exception) {
			console.log("exception",exception);
			const masterData = await Master.findOne({code: PAYMENT_STATUS.PAYMENT_FAILED});
			data.transactionSuccess = false;
			data.failedTransactionId = exception.raw.charge;
			data.status = masterData._id;
			data.errorData = exception;
			data.errorData.errorMessage = PAYMENT_ERRORS.STRIPE[exception.raw.decline_code];
			if (!data.errorMessage || data.errorMessage == "") {
				data.errorMessage =
				"Transaction was declined by payment gateway due to unknown reason";
			}
		}
		return data;
	  },

	/**
   *
   * @param {*} transactionId
   */
  async retrieveTransaction(transactionId) {
    try {
      let stripeObj = await StripeHandler.getStripeObject();

      return await stripeObj.balanceTransactions.retrieve(transactionId);
    } catch (error) {
      console.error("Error -retrieveTransaction", error);
      throw new Error(error);
    }
  },
	/**
 * Function used to removes strip customer
 * @param {*} userId
 * @param {*} email
 */
	async removeCustomer(userId, customerId) {
		try {
			let stripeObj = await StripeHandler.getStripeObject();
			let customer = await stripeObj.customers.del(customerId);

			await User.findOneAndUpdate({ _id: userId }, { stripeCustomerId: null });

			return true;
		} catch (err) {
			console.log(err)
			return false
		}
	},

	/**
	 *
	 * @param {*} customerId
	 * @param {*} token
	 */
	async addCardToCustomer(customerId, token) {
		try {
			let stripeObj = await StripeHandler.getStripeObject();
			// let customerStripeId = customerId.stripeCustomerId;
			return await stripeObj.customers.createSource(customerId, {
				source: token,
			});
		} catch (err) {
			console.log(err);
			throw new Error(err.message);
		}
	},

	/**
	 * Function used to set customer default card
	 * @param {*} customerId
	 * @param {*} cardId
	 */
	async setDefaultCustomerCard(customerId, cardId) {
		try {
			let stripeObj = await StripeHandler.getStripeObject();

			return await stripeObj.customers.update(customerId, {
				default_source: cardId,
			});
		} catch (err) {
			console.error(err);
			throw new Error(err);
		}
	},

	/**
	 * Function used to get customer data
	 * @param {*} customerId
	 */
	async retrieveCustomer(customerId) {
		try {
			let stripeObj = await StripeHandler.getStripeObject();

			return await stripeObj.customers.retrieve(customerId);
		} catch (err) {
			console.log(err);
			throw new Error(err);
		}
	},

	/**
		 * Function used to get customer cards data
		 * @param {*} customerId
		 */
	async retrieveCustomerCards(customerId) {
		try {
			let stripeObj = await StripeHandler.getStripeObject();
			return await stripeObj.customers.listSources(
				customerId,
				{ object: 'card', limit: 5 }
			);
		} catch (err) {
			console.log(err);
			throw new Error(err);
		}
	},

	/**
	 * Function used to update card
	 * @param {*} customerId
	 * @param {*} cardId
	 * @param {*} cardDetails
	 */
	async updateCustomerCard(customerId, cardId, cardDetails) {
		try {
			let stripeObj = await StripeHandler.getStripeObject();

			return await stripeObj.customers.updateSource(customerId, cardId, {
				name: cardDetails.cardHolderName,
				exp_month: cardDetails.expMonth,
				exp_year: cardDetails.expYear
			});
		} catch (err) {
			console.log(err);
			throw new Error(err.message);
		}
	},

	/**
	 * Function used to remove card
	 * @param {*} customerId
	 * @param {*} cardId
	 */
	async removeCardFromCustomer(customerId, cardId) {
		try {
			let stripeObj = await StripeHandler.getStripeObject();
			return await stripeObj.customers.deleteSource(customerId, cardId);
		} catch (err) {
			console.log(err);
			throw new Error(err);
		}
	},


};
