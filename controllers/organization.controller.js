var express = require('express');
var router = express.Router();
router.get('/company',function(req,res,next){
    res.render('index',{
        title:'company'
    });
});
router.get('/department',function(req,res,next){
    res.render('index',{
        title:'department'
    });
});

module.exports = router;