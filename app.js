var express = require('express');
var ejs = require('ejs');
var path = require('path');
var bodyParser = require('body-parser');
var favicon = require('serve-favicon');
var handlerError = require('./filters/handler-error');
var mongodb = require('./config/mongo')();

var app = express();

//设置静态资源根目录
app.use(express.static(path.join(__dirname,'public')));
//favicon
app.use(favicon(path.join(__dirname,'favicon.png')));

//设置模板引擎
app.engine('html',ejs.renderFile);
app.set('views',path.join(__dirname,'views'));
app.set('view engine','html');

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())


//路由
var router = require('./routers/')(app);

app.use(handlerError);


module.exports = app;