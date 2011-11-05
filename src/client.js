var socket = io.connect('http://localhost:8000');
  
socket.on('login', function (data) {
	var name = prompt(data.msg);
  	socket.emit('name',{'name' : name}, function(data){
  		alert('Hello '+ data.name);		
  	});
});  
  
