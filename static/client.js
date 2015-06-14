var drawing = false;
var yourTurn = false;
var mouse = {
    x: 0,
    y: 0
};
var startGame = false;
var RealPlayerList = ["{{username}}"];

var time = 90;
var interval = null;

var resetTimer = function() {
    if (interval != null || time <= 0) {
	clearInterval (interval);
	interval = null;
    };
    time = 90;
    
    function countdown() {
	time = time - 1;
	var seconds = time;
        seconds = seconds < 10 ? "0" + seconds : seconds;

        document.getElementById("timer").innerHTML = "Timer: " + seconds;
    };

    countdown();
    interval = setInterval(countdown, 1000);
};

var socket = io("127.0.0.1:5000/games");
var username = "{{username}}";
socket.emit("newUser", username, "{{gameName}}");

var canvas = $("#canvas");
var ctx = canvas[0].getContext("2d");

ctx.beginPath();
ctx.moveTo(400,0);
ctx.lineTo(400,600);
ctx.stroke();
ctx.beginPath();

var drawLine = function(x1, y1, x2, y2){
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
};

var chatScroll = document.getElementById ("chatbody");
chatScroll.scrollTop = chatScroll.scrollHeight;

canvas.on("mousedown", function(e){
    drawing = true;
    mouse.x = e.pageX - canvas.offset().left;
    mouse.y = e.pageY - canvas.offset().top;
});
            
canvas.on("mouseup mouseleave", function(){
    drawing = false;
});

var lastEmit = $.now();

canvas.on("mousemove", function(e){
    if (drawing && yourTurn && $.now() - lastEmit > 10){
        var newX = e.pageX - canvas.offset().left;
        var newY = e.pageY - canvas.offset().top;
        socket.emit("move", {
            oldX: mouse.x,
            oldY: mouse.y,
            x: newX,
            y: newY
        });
        lastEmit = $.now();
        drawLine(mouse.x, mouse.y, newX, newY);
        mouse.x = newX;
        mouse.y = newY;
    };
});

var clearCanvas = function () {
    ctx.clearRect (0, 0, canvas.width(), canvas.height());
    ctx.beginPath();
    ctx.moveTo(400,0);
    ctx.lineTo(400,600);
    ctx.stroke();
    ctx.beginPath();
};

var clearButton = $("#clearCanv");
var startButton = $("#startGame");

startButton.click(function(e) {
    if (RealPlayerList.length > 1 && !startGame){
	startGame = true;
	startButton.hide();
	socket.emit("startGame");
    };
});


clearButton.click(function(e){
    console.log ("Canvas Cleared");
    if (yourTurn && $.now() - lastEmit > 10){
	e.preventDefault();
	clearCanvas();
	socket.emit("requestClear");
    };
});

var chat = $("#innerchat");
var msgInput = $("#message");
var chatButton = $("#chatbutton");
var playerList = $("#names");

var appendToChat = function(text){
    chat.append("<tr><td>" + text + "</td></tr>");
    chatScroll.scrollTop = chatScroll.scrollHeight;
};

var appendEntryToChat = function(data){
    var text = "<b>" + data["user"] + "</b>" + ": " + data["msg"];
    appendToChat(text);
    chatScroll.scrollTop = chatScroll.scrollHeight;
};

var appendGameMsgToChat = function(data){
    appendToChat("<b style='color:red'>" + data + "</b>");
    chatScroll.scrollTop = chatScroll.scrollHeight;
};

var processMsg = function(){
    var msg = msgInput.val();
    msgInput.val("");
    appendToChat("<b>" + username + "</b>: " + msg);
    socket.emit("entry", msg);
    msgInput.focus();
};

var updatePlayerList = function(scores){
    RealPlayerList = Object.keys(scores);
    if (RealPlayerList.length > 1 && ! startGame){
	startButton.show();
    };
    playerList.html("");
    for (var player in scores){
	playerList.append("<tr><td>" + player + ": </td><td>" + scores[player] + "</td></tr>");
    };
};

msgInput.keydown(function(e){
    if (e.keyCode == 13){
        e.preventDefault();
        processMsg();
    };
});

chatButton.click(function(e){
    e.preventDefault();
    processMsg();
});

socket.emit("chatQuery");

socket.on("draw", function(data){
    drawLine(data.oldX, data.oldY, data.x, data.y);
});

socket.on("entry", function(data){
    appendEntryToChat(data);
});

socket.on("serverMessage", function(msg){
    appendToChat("<i>" + msg + "</i>");
});

socket.on("gameMessage", function(data){
    appendGameMsgToChat(data);
});

socket.on("gameUpdate", function(data){
    updatePlayerList(data["scores"]);
    yourTurn = data["players"][data["turn"]] == "{{username}}";
});

socket.on("clearCanvas", clearCanvas);

socket.on("nextTurn", resetTimer);

socket.on("startedGame", function(){
    startGame = true;
    appendGameMsgToChat("The game has started!");
});

socket.on("winners", function(winnerList){
    var winners = ' ';
    for (i in winnerList) {
	winners = winners + ' '  + winnerList[i];
    };
    $("#myModal").modal('show');
    document.getElementById("winnerann").innerHTML = "Winner(s):" + winners;;
    socket.disconnect();
});
