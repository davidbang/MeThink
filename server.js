var http = require("http");
var express = require("express");
var swig = require("swig");
var path = require("path");
var app = express();
var server = http.Server(app);
var io = require('socket.io')(server);
var db = require('database.js');

app.engine("html", swig.renderFile);
app.set("view engine", "html");
app.set("views", path.join(__dirname,'/static'));

//routes here
app.get('/', function(req, res){
    res.render("index.html");
});

app.get('/login', function(req, res){
    res.render("login.html");
});

app.post('/login', function(req, res){
    var name = req.body.name;
    var password = req.body.password;
    //db function here to check
    if (db.validLogin(name, password)[0]){
	//set session to username
	//redirect to home page
    };
    res.render("login.html", {name:name});
});

//routes end here

app.use(express.static(path.join(__dirname,"static")));

server.listen(5000, function(){
    console.log("Server started on port 5000");
});

io.sockets.on("connection",function(socket){
    socket.on("move", function(data){
        socket.broadcast.emit("draw",data);
    });
});
