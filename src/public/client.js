var socket = io.connect('http://localhost:8000');
  
socket.on('welcome', function (data) {
	var name = prompt(data.msg);
  	socket.emit('login',{'name' : name});
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
		if(!data || data==[] || data.length ==0)
		{
			$('#game-list').append('<li>No games found</li>');
			return;
		}
		for(var i in data)
		{
			$('#game-list').append('<li>'+data[i]+'</li>');
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
	socket.emit('create-game', null,refreshGames());

}

  
