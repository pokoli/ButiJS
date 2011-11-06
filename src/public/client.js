var socket = io.connect('http://localhost:8000');
  
socket.on('login', function (data) {
	var name = prompt(data.msg);
  	socket.emit('name',{'name' : name}, function(data){
  		alert('Hello '+ data.name);		
  	});
});  


socket.on('message', function(data){
	var text;
	if(data.player)
		text = '<'+data.player+'> ';
	text+=data.msg
	$('#messages').prepend($('<li>' + text + '</li>'));
});

function send() {
  var message = $('#message').val();
  socket.emit('send message', message);
  $('#message').val('');
}
  
