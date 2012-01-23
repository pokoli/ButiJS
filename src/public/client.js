var socket = io.connect('http://localhost:8000');
  
socket.on('welcome', function (data) {
  	$('#login-dialog').dialog('open');
});  


socket.on('message', function(data){
	var text;
	if(typeof(data)=='string')
	{
		//That's a server message
		$('#messages').append('<li>' + data + '</li>');
	}
	else
	{
		if(data.player)
			text = ''+data.player.name+': ';
		text+=data.msg;
		$('#messages').append('<li>' + text + '</li>');
	}
});

socket.on('start', function(gameData){
    addNewGame(gameData);
});

/*Called onLoad of the html. Loads all the data needed:
	1. Refresh games-list (every 5 seconds)
	2. Refresh player-list (every 5 seconds)
*/
function doLoad()
{
	setInterval("refreshGames()",5000);
	setInterval("refreshPlayers()",5000);
}

function send() {
	var msg = $('#msg').val();
	socket.emit('send',msg);
	$('#msg').val('');
}

var games=[];
var selected;

function refreshGames(){
	socket.emit('list-games',null,function(data){
		$('#game-list').children().remove();
		$('#game-list').append('<thead><tr><th>Name</th><th>State</th><th>Players</th><th>Watchers</th></thead>')
		if(!data || data==[] || data.length ==0)
		{
		    games=[];
			return;
		}
		games=data;
		for(var i in games)
		{
			$('#game-list').append('<tr onClick="selectGame('+i+')"><td>'+data[i].name+'</td><td>'+data[i].state+'</td><td>'+data[i].players.length+'</td><td>'+data[i].watchers.length+'</td></tr>');
		}
		//Refresh the game data if it has changed.
		if(selected || selected == 0)
	       showGameDetails(games[selected]);
	});
}

function selectGame(i)
{
    selected=i;
    showGameDetails(games[i]);
}

function showGameDetails(gameData)
{
    $('#game-details').children().remove();
    $('#game-details').append('<table>');
    $('#game-details').append('<tr><th>Name</th><td>'+gameData.name+'</td><tr>');
    $('#game-details').append('<tr><th>State</th><td>'+gameData.state+'</td><tr>');
    $('#game-details').append('<tr><th colspan="2">Players</th>');
    for(var i in gameData.players)
    {
        $('#game-details').append('<tr><td colspan="2">'+gameData.players[i].name+'</td><tr>');
    }
    if(gameData.watchers.length > 0)
    {
        $('#game-details').append('<tr><th colspan="2">Wathcers</th>');
        for(var i in gameData.watchers)
        {
            $('#game-details').append('<tr><td colspan="2">'+gameData.watchers[i]+'</td><tr>');
        }
    }
    $('#game-details').append('</table>');
}

function refreshPlayers(){
	socket.emit('list-players',null,function(data){
		$('#player-list').children().remove();
		if(!data || data==[] || data.length ==0)
		{
			$('#player-list').append('<li>No players on the server</li>');
			return;
		}
		for(var i in data)
		{
			$('#player-list').append('<li>'+data[i].name+'</li>');
		}	
	});
}

function createGame(gameData){    
	socket.emit('create-game',gameData,refreshGames);
}

function joinGame(){
    if(!selected && selected != 0)
    {
        alert("You should select a game.");
        return;
    }
	socket.emit('join-game', games[selected].id,function(err,data){
	    if(err)
	    {
	        alert(err);
	    }
	    refreshGames();
	});
}

  
