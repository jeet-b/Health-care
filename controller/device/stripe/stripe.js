const message = require("../../../utils/messages");
const responseCode = require("../../../utils/responseCode");
const db = require("../../../config/db");
const userModel = require("../../../model/user")(db);
const StripeHandler = require(`../../../services/stripe/stripeHandler`);
const { MESSAGE } = require("../../../config/message");
const _ = require("lodash");

function makeStripeController({ StripePaymentService }) {
  const addCard = async ({ req }) => {
    try {
      let params = req.body;
      let userRef = req.user;
      if (!params.cardToken) {
        return message.failureResponse(
          { "Content-Type": "application/json" },
          responseCode.internalServerError,
          null,
          req.i18n.t("response_message.badRequest")
        );
      }
      let card = await StripePaymentService.addCardToCustomer(
        userRef.stripeCustomerId,
        params.cardToken
      );
      if (card) {
        let cardObj = {
          expMonth: card.exp_month,
          expYear: card.exp_year,
          last4: card.last4,
          first4: card.first4,
          brand: card.brand,
          fingerprint: card.fingerprint,
          cardHolderName: card.name,
          id: card.id,
          cardToken: card.cardToken,
        };
        if (userRef.cards && userRef.cards.length > 0) {
          let cardRef = _.find(userRef.cards, {
            fingerprint: cardObj.fingerprint,
          });
          if (cardRef && cardRef.id) {
            return message.successResponse(
              { "Content-Type": "application/json" },
              responseCode.success,
              null,
              req.i18n.t("stripe.card_exists")
            );
          }
        }
        if (!userRef.cards || _.size(userRef.cards) === 0) {
          cardObj.isPrimary = true;
          userRef.cards = [];
        } else {
          cardObj.isPrimary = false;
        }
        userRef.cards.push(cardObj);
        /** update user with card object **/
        const userData = await userModel.updateOne(
          { _id: userRef.id },
          { cards: userRef.cards }
        );
        return message.successResponse(
          { "Content-Type": "application/json" },
          responseCode.success,
          userData,
          req.i18n.t("stripe.create")
        );
      }
      return message.failureResponse(
        { "Content-Type": "application/json" },
        responseCode.internalServerError,
        null,
        req.i18n.t("response_message.server_error")
      );
    } catch (error) {
      console.error("Stripe card add => ", error);
      return message.failureResponse(
        { "Content-Type": "application/json" },
        responseCode.internalServerError,
        null,
        error.message
          ? error.message
          : req.i18n.t("response_message.server_error")
      );
    }
  };

  const getToken = async ({ req }) => {
    try {
      let params = req.body;
      if (!params || !params.cardDetails) {
        return message.failureResponse(
          { "Content-Type": "application/json" },
          responseCode.internalServerError,
          req.i18n.t("stripe.request_not_validate")
        );
      }
      let cardToken = await StripeHandler.getToken(params.cardDetails);
      if (cardToken !== "undefined") {
        return message.successResponse(
          { "Content-Type": "application/json" },
          responseCode.success,
          { cardId: cardToken.card.id, cardToken: cardToken.id },
          req.i18n.t("stripe.token_generated")
        );
      } else {
        return message.failureResponse(
          { "Content-Type": "application/json" },
          responseCode.internalServerError,
          req.i18n.t("response_message.server_error")
        );
      }
    } catch (err) {
      console.error("Card generate token => ", err);
      return message.failureResponse(
        { "Content-Type": "application/json" },
        responseCode.internalServerError,
        req.i18n.t("response_message.server_error")
      );
    }
  };
  /**
   * Function used to remove card from stripe
   * @param {*} req {cardId}
   * @param {*} res
   */
  const removeCard = async ({ req }) => {
    try {
      let params = req.body;
      let loggedInUser = req.user;
      if (!params || !params.cardId) {
        return message.failureResponse(
          { "Content-Type": "application/json" },
          responseCode.internalServerError,
          req.i18n.t("stripe.request_not_validate")
        );
      }
      let isPrimary = _.find(loggedInUser.cards, (card) => {
        return card.isPrimary && card.id === params.cardId;
      });
      if (isPrimary) {
        return message.failureResponse(
          { "Content-Type": "application/json" },
          responseCode.internalServerError,
          req.i18n.t("stripe.primary_card_remove_error")
        );
      }
      /** remove card as a source for payment in stripe **/
      await StripePaymentService.removeCardFromCustomer(
        loggedInUser.stripeCustomerId,
        params.cardId
      );
      // update record
      await new Promise((resolve, reject) => {
        userModel.updateOne(
          { _id: loggedInUser.id },
          { $pull: { cards: { id: params.cardId } } },
          (err, res) => {
            if (err) {
              return message.failureResponse(
                { "Content-Type": "application/json" },
                responseCode.internalServerError,
                req.i18n.t("response_message.server_error")
              );
            }
            resolve();
          }
        );
      });
      return message.successResponse(
        { "Content-Type": "application/json" },
        responseCode.success,
        {},
        req.i18n.t("stripe.delete")
      );
    } catch (err) {
      console.error("Stripe Card remove =>", err);
      return message.failureResponse(
        { "Content-Type": "application/json" },
        responseCode.internalServerError,
        res,
        err.Error || req.i18n.t("response_message.server_error")
      );
    }
  };

  /**
   * Function used to set default card
   * @param {*} req  {cardId}
   * @param {*} res
   */
  const setDefaultCard = async ({ req }) => {
    try {
      let params = req.body;
      if (!params || !params.cardId) {
        return message.failureResponse(
          { "Content-Type": "application/json" },
          responseCode.internalServerError,
          null,
          req.i18n.t("stripe.request_not_validate")
        );
      }
      let loggedInUser = req.user;
      let cardObj = await StripePaymentService.setDefaultCustomerCard(
        loggedInUser.stripeCustomerId,
        params.cardId
      );
      if (cardObj) {
        let newDetails = [];
        _.each(loggedInUser.cards, (card) => {
          card.isPrimary = card.id === params.cardId;
          newDetails.push(card);
        });
        await userModel.updateOne(
          { _id: loggedInUser.id },
          { cards: newDetails }
        );
        return message.successResponse(
          { "Content-Type": "application/json" },
          responseCode.success,
          {},
          req.i18n.t("stripe.default")
        );
      }
      return message.failureResponse(
        { "Content-Type": "application/json" },
        responseCode.internalServerError,
        null,
        req.i18n.t("response_message.server_error")
      );
    } catch (err) {
      console.error("Set deafult card :>> ", err);
      return message.failureResponse(
        { "Content-Type": "application/json" },
        responseCode.internalServerError,
        null,
        req.i18n.t("response_message.server_error")
      );
    }
  };

  return Object.freeze({
    getToken,
    addCard,
    removeCard,
    setDefaultCard,
  });
}

module.exports = makeStripeController;
