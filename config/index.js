var config = {};

if(process && process.env && process.env.NODE_ENV){
    config = require('./'+process.env.NODE_ENV+'/config');
}else{
    config = require('./development/config');
}

config.version='3.0.0';

module.exports = config;