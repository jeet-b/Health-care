const db = require('../../../config/db');
const ratingReviewModel = require('../../../model/ratingReview')(db);
const {
  schemaKeys,updateSchemaKeys
} = require('../../../validation/ratingReviewValidation');
const insertRatingReviewValidator = require('../../../validation/genericValidator')(schemaKeys);
const updateRatingReviewValidator = require('../../../validation/genericValidator')(updateSchemaKeys);
const makeRatingReview = require('../../../entity/ratingReview')({
  insertRatingReviewValidator,
  updateRatingReviewValidator
});
const ratingReviewService = require('../../../services/mongoDbService')({
  model:ratingReviewModel,
  makeRatingReview
});
const makeRatingReviewController = require('./ratingReview');

const ratingReviewController = makeRatingReviewController({
  ratingReviewService,
  makeRatingReview
});
module.exports = ratingReviewController;
