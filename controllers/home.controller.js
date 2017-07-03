var express = require('express');
var router = express.Router();
var cookieParser = require('cookie-parser')();

// router.all('*',cookieParser,function(req,res,next){
//     if (req.cookies && req.cookies.staffId) {
//         next();
//     }else{
//         res.redirect('/account')
//     }

// })

router.get('/',function(req,res,next){
    res.render('home/index',{
        title:'Freedom-fly'
    });
});

module.exports = router;