const constants = require('./../config/constant/socket');
// ON NEW MESSAGE SENT (USER ID SHOULD PASS)
module.exports.notifySocketMessages = (wholeChatObject) => {
    let io = require('../app').io;
    io.in(constants.SOCKET_CHANNEL).emit('socketMessage', wholeChatObject);
}

module.exports.notifySocketRequest = (userId) => {
    let io = require('../app').io;
    io.in(constants.SOCKET_CHANNEL).emit('socketRequest', userId);
}


