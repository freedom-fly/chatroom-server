var express = require('express');
var bodyParser = require('body-parser');
var urlencodedParser = bodyParser.urlencoded({ extended: false });
var router = express.Router();
router.get('/', function (req, res, next) {
    res.render('account/index', {
        version: '3.0.0'
    });
});

router.post('/login', urlencodedParser, function (req, res, next) {
    var userName = req.body.userName;
    var password = req.body.password;
    if (userName && password) {
        res.cookie('staffId',userName);
        res.json({ state: true });
        return;
    }
    res.json({ state: false });
});

module.exports = router;