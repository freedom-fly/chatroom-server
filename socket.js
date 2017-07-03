module.exports = function (server) {
    var io = require('socket.io')(server);
    //socket连接
    io.on("connection", function (socket) {
        console.log("一个新连接");
        socket.on("disconnect", function () {
            
        });
    });

return io;
}