var http = require("http");
var express = require("express");
var swig = require("swig");
var path = require("path");
var app = express();
var server = http.Server(app);
var io = require('socket.io')(server);
var bodyParser = require('body-parser');
var session = require("express-session");
var db = require('./database.js');

app.engine("html", swig.renderFile);
app.engine("js", swig.renderFile);
app.set("view engine", "html");
app.set("views", path.join(__dirname,'/static'));
app.use(session({secret: "secret"}));
app.use(bodyParser.json()); 
app.use(bodyParser.urlencoded({
    extended: true
}));

var loginRequired = function(req, res, next){
    //if user logged in
    if (req.session.name){
        next();
    }else{
        res.redirect('/login');
    };
    //else redirect to login route
};

var noLoginRequired = function(req, res, next){
    if (req.session.name){
        res.redirect('/');
    }else{
        next();
    };
};

//routes here
app.get('/', loginRequired, function(req, res){
    res.render("index.html", {username: req.session.name});
});

app.get('/client.js', function(req,res){
    res.render("client.js", {username: req.session.name});
});

app.get('/login', noLoginRequired, function(req, res){
    res.render("login.html");
});

app.post('/login', noLoginRequired, function(req, res){
    var name = req.body.username;
    var password = req.body.password;
    //db function here to check
    db.validLogin(name, password, function(passed, msg){
        if (passed){
	        //set session to username
	        req.session.name = name;
	        //redirect to home page
            res.redirect('/');
	    }else{
            res.render("login.html");
	        console.log(msg);
	    };
    });
});

app.get('/register', noLoginRequired, function(req, res){
    res.render("register.html");
});

app.post('/register', function(req, res){
    var name = req.body.username;
    var password = req.body.password;
    var confirmPassword = req.body.passwordConfirm;
    db.register(name, password, confirmPassword, function(passed, msg){
        if (passed){
	        //set session to username
	        req.session.name = name;
	        //redirect to home page
            res.redirect('/');
	        console.log("Registered under Libman Enterprises!");
	    }else{
	        res.render("register.html");
	        console.log(msg);
	    };
    });
});

//routes end here

app.use(express.static(path.join(__dirname,"static")));

var clientsConnected = {};

server.listen(5000, function(){
    console.log("Server started on port 5000");
});

io.sockets.on("connection",function(socket){
    socket.on("move", function(data){
        socket.broadcast.emit("draw",data);
    });
    socket.on("disconnect", function(){
	    if (socket.id in clientsConnected){
	        var leaver = clientsConnected[socket.id];
	        delete(clientsConnected[socket.id]);
	        console.log(leaver + " disconnected");
	        io.emit("serverMessage", leaver + " has left.");
	    };
    });
    socket.on("entry", function(entry){
	    socket.broadcast.emit("entry", {
            msg: entry,
            user: clientsConnected[socket.id]
        });
    });
    socket.on("newUser", function(user){
        if (! (socket.id in clientsConnected)){
	        clientsConnected[socket.id] = user;
	        console.log(user + " connected");
	        socket.broadcast.emit("serverMessage", user + " has joined.");
        };
    });
});
