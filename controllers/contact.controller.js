var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var LabelMongo = require('../models/label.model');

router.get('/labels',function(req,res,next){
    // var labelEntity = new LabelMongo({
    //     LabelId:11,
    //     LabelName:'222',
    //     LabelCategoryID:21
    // });
    // labelEntity.save(function(err){
    //     if (err) {
            
    //     }
    // });
    var labelEntitys = LabelMongo.find().exec(function(err,labels){
        res.json(labels);
    });
});

module.exports=router;