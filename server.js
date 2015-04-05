var express = require("express");
var http = require("http");
var app = express();
var server = http.Server(app);
var io = require('socket.io')(server);

app.use(express.static("static"));
app.use("/lib", express.static("lib"));

app.get('/', function(req, res){
    res.sendFile("index.html");
});

server.listen(5000, function(){
    console.log("Server started on port 5000");
});

io.sockets.on("connection",function(socket){
    socket.on("move", function(data){
        socket.broadcast.emit("draw",data);
    });
});
