var socket = io.connect('http://localhost:8000');
  
socket.on('welcome', function (data) {
	var name = prompt(data.msg);
  	socket.emit('login',{'name' : name}, function(data){
  		alert('Hello '+ data.name);		
  	});
});  


socket.on('message', function(data){
	var text;
	if(data.player)
		text = ''+data.player.name+': ';
	text+=data.msg;
	$('#messages').append('<li>' + text + '</li>');
});

/*Called onLoad of the html. Loads all the data needed:
	1. Refresh games-list
*/
function doLoad()
{
	refreshGames();
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
			$('#game-list').append('No games found');
			return;
		}
		for(var game in data)
		{
			$('#game-list').append('<li>'+game+'</li>');
		}	
	});
	
}

function createGame(){
	socket.emit('create-game', null,refreshGames());

}

  
