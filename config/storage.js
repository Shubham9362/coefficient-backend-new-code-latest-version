var storage = {};
storage.secret= 'appsecret';  //for securing the data
var mongoose = require('mongoose');  //module for connecting mongoDB
//provide a sensible default for local development
// var url = 'mongodb://user:12345678@ds137720.mlab.com:37720/testdatabse'; // Mlab ip address
var url = 'mongodb://127.0.0.1:27017/coefficient';

//take advantage of openshift env vars when available:
// if(process.env.OPENSHIFT_MONGODB_DB_URL){
//     mongodb_connection_string = process.env.OPENSHIFT_MONGODB_DB_URL + 'tracking';
// }
mongoose.connect(url);

var MongoClient = require('mongodb').MongoClient;

storage.getMongooseDB = function() {
    return mongoose;
}

storage.getDB = function() {
    return new Promise(function(resolve, reject) {
        MongoClient.connect(url, function(err, connection) {
            if (!err) {
                console.log('db connected')
                resolve(connection);
            } else {
                reject(err);
            }
        });
    });
}

module.exports = storage;
