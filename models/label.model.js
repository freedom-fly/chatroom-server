var mongoose = require('mongoose');
var labelSchema =new mongoose.Schema({
    LabelId:Number,
    LabelName:String,
    CreateDateTime:{type:Date,default:Date.now()},
    UpdateDateTime:{type:Date,default:Date.now()},
    LabelCategoryID:Number
});
module.exports = mongoose.model('Hosting_LabelMongo',labelSchema,'Hosting_LabelMongo');