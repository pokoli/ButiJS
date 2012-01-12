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

function refreshGames(){
	socket.emit('list-games',null,function(data){
		$('#game-list').children().remove();
		$('#game-list').append('<thead><tr><th>Name</th><th>State</th><th>Players</th><th>Watchers</th></thead>')
		if(!data || data==[] || data.length ==0)
		{
			return;
		}
		for(var i in data)
		{
			$('#game-list').append('<tr onClick="selectGame(this)"><td>'+data[i].name+'</td><td>'+data[i].state+'</td><td>'+data[i].players.length+'</td><td>'+data[i].watchers.length+'</td></tr>');
		}	
	});
	
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

function createGame(){
	socket.emit('create-game', {name: 'Test game'},refreshGames());
	//Refresh game list after creating the new game.
	refreshGames();
}

  
