var socket = io("127.0.0.1:5000/lobby");
var username = "{{username}}";
socket.emit("newUser", username);

var createGameButton = $("#makeGame");

createGameButton.click(function(e) {
    socket.emit("createGame");
    //redirects to new game page, adds to table of games on lobby page
});

var lobbyTable = $("#lobbyTable");
socket.on("lobbyUpdate", function(games){
    lobbyTable.html("");
    for (var game in games.sort()){
	lobbyTable.append("<tr class='clickable' href=" + game +
			  "><td>" + game + "'s game'</td></tr>");
    };
});

$(".clickable").click(function(){
    window.open("/game/" + $(this).data("href"));
});
