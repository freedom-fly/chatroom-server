var express = require('express');
var router = express.Router();

router.get('/list',function(req,res,next){
    res.render('index',{
        title:'orderList'
    });
});

module.exports = router;