var drawing = false;
var yourTurn = false;
var mouse = {
    x: 0,
    y: 0
};

var socket = io();
var username = "{{username}}";
socket.emit("newUser", username);

var canvas = $("#canvas");
var ctx = canvas[0].getContext("2d");

var drawLine = function(x1, y1, x2, y2){
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
};

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

var chat = $("#innerchat");
var msgInput = $("#message");
var chatButton = $("#chatbutton");
var playerList = $("#names");

var appendToChat = function(text){
    chat.append("<tr><td>" + text + "</td></tr>");
};

var appendEntryToChat = function(data){
    var text = "<b>" + data["user"] + "</b>" + ": " + data["msg"];
    appendToChat(text);
};

var processMsg = function(){
    var msg = msgInput.val();
    msgInput.val("");
    appendToChat("<b>" + username + "</b>: " + msg);
    socket.emit("entry", msg);
    msgInput.focus();
};

var updatePlayerList = function(scores){
    playerList.html("");
    for (player in scores){
	playerList.append("<tr><td>" + player + "</td><td>" + scores[player] + "</td></tr>");
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

socket.on("gameUpdate", function(data){
    updatePlayerList(data["scores"]);
    yourTurn = data["players"][data["turn"]] == "{{username}}";
});
