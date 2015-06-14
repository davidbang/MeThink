var createGameButton = $("#makeGame");

createGameButton.click(function(e) {
    socket.emit("makeGame");
    //redirects to new game page, adds to table of games on lobby page
});
