var express = require('express');
var router = express.Router();
var {JsonResult,CreateFromResult} = require('../viewmodels/JsonResult')

router.post('/login', function (req, res, next) {
    var staffId = req.body.staffId;
    var password = req.body.password;
    if (staffId && password) {
        res.cookie('staffId',staffId);
        res.json(new JsonResult(true,{staffId}));
        return;
    }
    res.json(new JsonResult(false,null,'无效的工号或密码'));
});

module.exports = router;