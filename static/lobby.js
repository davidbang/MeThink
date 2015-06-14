var socket = io("127.0.0.1:5000/lobby");
var username = "{{username}}";
socket.emit("newUser", username);

var createGameButton = $("#makeGame");

createGameButton.click(function(e) {
    socket.emit("createGame");
    //redirects to new game page, adds to table of games on lobby page
});

var lobbyTable = $("#lobbyTable");
socket.on("gameListUpdate", function(games){
    lobbyTable.html("");
    console.log(games);
    for (var i in games){
	var game = games[i];
	lobbyTable.append($("<tr>")
			  .append($("<td>")
				  .attr("href", game)
				  .text(game + "'s game")
				  .click(function(){
				      window.open("/game/" + $(this).attr("href"));
				  })));
    };
});

