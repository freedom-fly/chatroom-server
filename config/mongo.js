var mongoose = require('mongoose');
var config = require('./index');
mongoose.Promise = global.Promise;
module.exports=function(){
    var db = mongoose.connect(config.mongodb,{useMongoClient: true});
    return db;
}