const mongoose = require('mongoose');
const dbConfigure = process.env.DB_USERNAME && process.env.DB_PASSWORD ? `${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@` : '';
const dConnection = `${process.env.DB_CONNECTION}://${dbConfigure}${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_DATABASE}`;

mongoose.connect(dConnection, {
  useNewUrlParser: true,
  useUnifiedTopology: true ,
  useFindAndModify:false,
  useCreateIndex:true
});
var db = mongoose.connection;

db.once('open', () => {
  console.log('Connection Successful');
});

db.on('error', () => {
  console.log('Error in mongodb connection');
});

module.exports = mongoose;