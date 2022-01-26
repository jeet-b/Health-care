const userActivity = require('./../services/userActivity');

const sendResponse = function (response, result) {
  userActivity(response.req, result).then((results) => {
    // console.log(result.statusCode);
    return response.set(result.headers).status(result.statusCode).send(result.data);
  }).catch((err) => {
    console.log(err.message);
    return response.set(result.headers).status(result.statusCode).send(result.data);
  });
};
module.exports = sendResponse;