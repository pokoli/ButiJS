var app = require('http').createServer(handler)
  , io = require('socket.io').listen(app)
  , fs = require('fs')
  , url = require('url')
  , Player = require('./player');

app.listen(8000);

function handler (req, res) {
  var pathname = url.parse(req.url).pathname;
  var file = (pathname == '/client.js' ?  '/client.js' : '/index.html') ;
  fs.readFile(__dirname +  file,
  function (err, data) {
    if (err) {
      res.writeHead(500);
      return res.end('Error loading '+file);
    }

    res.writeHead(200);
    res.end(data);
  });
}

//Variable for hosting the current games on the server
var _games = [];
var _players = [];

io.sockets.on('connection', function (socket) {
	var _player;

	socket.emit('login', { msg : 'Welcome, who you are?'});
  
	socket.on('name', function(data, fn){
		player = Player.create();
		player.name=data.name;
		_player=player;
		_players.push(player);
		if(fn) fn(player);
  	});
  	
  	socket.on('list-games', function(data, fn){
  		if(fn) fn(_games);
  	});
  	
  	socket.on('list-players', function(data, fn){
  		if(fn) fn(_players);
  	});
  	
  	socket.on('create-game', function(data, fn){
  		_player.join(data);
  		_games.push(data);
  		if(fn) fn(data);
  	});
  	
  	socket.on('disconnect', function(){
  		var idx = _players.indexOf(_player);
  		if(idx != -1) _players.splice(idx,1);
  	});
});


//We export the socket
module.exports = io;




