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

var games = {};

//routes here
app.get('/', loginRequired, function(req, res){
    //res.send("Lobby page placeholder. Go to /game/*, where * is the game host's name to get to the game screen."); //placeholder
    //res.end();
    res.render("lobby.html", {username: req.session.name});
});

app.get(/^\/game\/([a-zA-Z0-9]*)$/, loginRequired, function(req, res){
    var host = req.params[0];
    if (host in games){
	res.render("index.html", {username: req.session.name, gameName: host});
    }else{
	res.send("Game not found"); //Placeholder
    };
});

app.get(/game\/(.*)\/client.js/, function(req,res){
    console.log("Getting client: " + req.params[0]);
    res.render("client.js", {username: req.session.name, gameName: req.params[0]});
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
            res.render("login.html", {error: msg});
	    //console.log(msg);
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
	    //console.log(msg);
	};
    });
});

//routes end here

app.use(express.static(path.join(__dirname,"static")));

var clientsConnected = {};
var words = [
    ["jelly","fish"],
    ["peanut", "butter"],
    ["fish", "sticks"],
    ["water", "melon"],
    ["table", "cloth"]//read in from db later
];

var game = function(host){
    this.host = host;
    this.players = [];
    this.playerSockets = {};
    this.scores = {};
    this.whoseTurn = 0;
    this.started = false;
    this.winners = [];
    this.words = words;
    this.timer = 90;
    this.loop = 0;
}
game.prototype.nextTurn = function(){
    this.timer = 90;
    this.whoseTurn += 1;
    this.words.splice(0,1);
    if (this.whoseTurn >= this.players.length){
	this.loop += 1;
	if (this.loop == 2){
	    //End the game if 2 rotations of rounds have been played
	    var max = 0;
	    for (var player in this.scores){
		var score = this.scores[player];
		if (score > max){
		    max = score;
		    this.winners = [player];
		}else if (this.scores[player] == max){
		    this.winners.push(player);
		};
	    };
	    io.emit("winners", this.winners);
	};
        this.whoseTurn = 0;
    };
    this.playerSockets[this.players[this.whoseTurn]].emit("gameMessage", "Your word is " + this.words[0][0] + " " + this.words[0][1] + ".");
    io.emit("nextTurn");
    io.emit("clearCanvas");
};
game.prototype.addPlayer = function(socket){
    var player = socket.name;
    if (! this.started){
        this.players.push(player);
        this.scores[player] = 0;
	this.playerSockets[player] = socket;
    };
};
game.prototype.removePlayer = function(player){
    if (player == this.players[this.whoseTurn]){
	this.whoseTurn -= 1;
	this.nextTurn();
    };
    var index = this.players.indexOf(player);
    this.players.splice(index,1);
    delete(this.scores[player]);
    delete(this.playerSockets[player]);
};
game.prototype.scorePlayer = function(player){
    this.scores[player] += 1;
    this.nextTurn();
};
game.prototype.countDown = function(){
    this.timer -= 1;
    if (this.timer <= 0){
	this.timer = 90;
	io.emit("gameMessage", "Time has run out with noone guessing the words!");
	this.nextTurn();
	io.emit("gameUpdate", {
	    turn: this.whoseTurn,
	    players: this.players,
	    scores: this.scores
	});
    };
};


var createNewGame = function(user){
    if (! (user in games)){
	games[user] = new game(user);
    };
};

games[1] = new game();
games[2] = new game();

var checkChatEntry = function(entry, game){
    if (entry != ""){
	return entry.toLowerCase().replace(/ /g,'') == game.words[0][0] + game.words[0][1];
	//return true if it is .lowercase
	//account for trailing spaces and other anomalies
    };
};


server.listen(5000, function(){
    console.log("Server started on port 5000");
});

var lobbyUsers = [];
var lobbyNSP = io.of("/lobby");
lobbyNSP.on("conection", function(socket){
    socket.on("newUser", function(user){
        if (! socket.name){
	    console.log("user");
	    socket.name = user;
	    this.lobbyUsers.push(user);
	    lobbyNSP.emit("lobbyUpdate", {
		players: lobbyUsers
	    });
	    socket.broadcast.to(socket.game).emit("serverMessage", user + " has joined.");
	};
    });
    socket.on("disconnect", function(){
	if (socket.name){
	    var leaver = socket.name;
	    var index = this.lobbyUsers.indexOf(leaver);
	    this.lobbyUsers.splice(index,1);
	    lobbyNSP.emit("lobbyUpdate", {
		players: lobbyUsers
	    });
	    socket.broadcast.emit("serverMessage", leaver + " has left.");
	};
    });
    socket.on("entry", function(entry){
	var person = socket.name;
	if (entry != ""){
	    socket.broadcast.emit("entry", {
		msg: entry,
		user: person
            });
	};
    });
    socket.on("createGame", function(socket){
	if (socket.name){
	    createNewGame(socket.name);
	    console.log("NEW GAME");
	    var gameList = [];
	    for (var g in games){
		gameList.push(g);
	    };
	    lobbyNSP.emit("gameListUpdate", gameList);
	};
    });
});

var gameNSP = io.of("/games");
gameNSP.on("connection", function(socket){
    socket.on("newUser", function(user, gameName){
        if (! socket.name && gameName != ""){
	    socket.name = user;
	    socket.game = gameName;
	    console.log(socket.game);
	    socket.join(socket.game);
	    var playerGame = games[socket.game];
	    playerGame.addPlayer(socket);
	    gameNSP.to(socket.game).emit("gameUpdate", {
		turn: playerGame.whoseTurn,
		players: playerGame.players,
		scores: playerGame.scores
	    });
	    console.log(user + " connected");
	    socket.broadcast.to(socket.game).emit("serverMessage", user + " has joined.");
        };
    });
    socket.on("disconnect", function(){
	if (socket.name && socket.game){
	    var leaver = socket.name;
	    var playerGame = games[socket.game];
	    playerGame.removePlayer(leaver);
	    gameNSP.to(socket.game).emit("gameUpdate", {
		turn: playerGame.whoseTurn,
		players: playerGame.players,
		scores: playerGame.scores
	    });
	    console.log(leaver + " disconnected");
	    gameNSP.to(socket.game).emit("serverMessage", leaver + " has left.");
	};
    });
    socket.on("move", function(data){
	var person = socket.name;
	var playerGame = games[socket.game];
	if (person == playerGame.players[playerGame.whoseTurn]){
	    //only player whose turn it is to draw can draw
            socket.broadcast.to(socket.game).emit("draw", data);
	};
    });
    socket.on("entry", function(entry){
	var person = socket.name;
	var playerGame = games[socket.game];
	if (person != playerGame.players[playerGame.whoseTurn] && checkChatEntry(entry, playerGame)){
	    gameNSP.to(socket.game).emit("gameMessage", person + " has guessed the word, which was '" + playerGame.words[0][0] + playerGame.words[0][1] + "'.");
	    playerGame.scorePlayer(person);
	    gameNSP.to(socket.game).emit("gameUpdate", {
		turn: playerGame.whoseTurn,
		players: playerGame.players,
		scores: playerGame.scores
	    });
	};
	if (entry != ""){
	    socket.broadcast.to(socket.game).emit("entry", {
		msg: entry,
		user: person
            });
	};
    });
    socket.on("requestClear", function(){
	var player = socket.name;
	var playerGame = games[socket.game];
	if (player == playerGame.players[playerGame.whoseTurn]){
	    socket.broadcast.to(socket.game).emit("clearCanvas");
	    gameNSP.to(socket.game).emit("gameMessage", player + " has cleared the canvas.");
	};
    });
});


var updateGameTimers = function(){
    for (var g in games){
	if (games[g].started){
	    games[g].countDown();
	};
    };
};

setInterval(updateGameTimers, 1000);
