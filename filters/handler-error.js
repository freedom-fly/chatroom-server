module.exports = function(err,req,res,next){
    console.error(err);
    res.render('error',{
        error:err
    });
}