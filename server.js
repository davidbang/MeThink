var express = require("express");
var http = require("http");
var app = express();
var server = http.Server(app);
var io = require('socket.io')(server);

app.use(express.static("static"));
app.use("/lib", express.static("lib"));
app.use(express.bodyParser());

app.get('/', function(req, res){
    res.sendFile("index.html");
});

app.get('/login', function(req, res){
    res.render("login.html");
});

app.post('/login', function(req, res){
    var name = req.body.name;
    var password = req.body.password;
    //db function here to check
    if validLogin(name, password){
	//set session to username
	//redirect to home page
    };
    res.render("login.html", {name:name});
});

server.listen(5000, function(){
    console.log("Server started on port 5000");
});

io.sockets.on("connection",function(socket){
    socket.on("move", function(data){
        socket.broadcast.emit("draw",data);
    });
});
