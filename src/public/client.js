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

function send() {
	var msg = $('#msg').val();
	socket.emit('send',msg);
	$('#msg').val('');
}

  
