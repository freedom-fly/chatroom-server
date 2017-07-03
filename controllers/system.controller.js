var express = require('express');
var router = express.Router();
var {JsonResult,CreateFromResult} = require('../viewmodels/JsonResult')
var config = require('../config')

/**
 * 获得系统版本号
 */
router.get('/version',function(req,res,next){
   res.json(new JsonResult(true,config.version));
});

module.exports=router;