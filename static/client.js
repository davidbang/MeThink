var drawing = false;
var mouse = {
    x: 0,
    y: 0
};

var socket = io();

var canvas = $("#canvas");
var ctx = canvas[0].getContext("2d");

var drawLine = function(x1, y1, x2, y2){
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
};

canvas.on("mousedown", function(e){
    drawing = true;
    mouse.x = e.pageX; //account for canvas padding later
    mouse.y = e.pageY;
});
            
canvas.on("mouseup mouseleave", function(){
    drawing = false;
});

var lastEmit = $.now();

canvas.on("mousemove", function(e){
    if (drawing && $.now() - lastEmit > 30){
        socket.emit("move", {
            oldX: mouse.x,
            oldY: mouse.y,
            x: e.pageX,
            y: e.pageY
        });
        lastEmit = $.now();
        drawLine(mouse.x, mouse.y, e.pageX, e.pageY);
        mouse.x = e.pageX;
        mouse.y = e.pageY;
    };
});

socket.on("draw", function(data){
    drawLine(data.oldX, data.oldY, data.x, data.y);
});
