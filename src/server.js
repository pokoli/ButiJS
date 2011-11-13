var app = require('http').createServer(handler)
  , io = require('socket.io').listen(app)
  , fs = require('fs')
  , url = require('url')
  , sanitize = require('validator').sanitize
  , Game = require('./game')
  , Player = require('./player');

app.listen(8000);

function handler (req, res) {
  var pathname = url.parse(req.url).pathname;
  console.log(pathname);
  var file = (pathname.match('^/public') ?  pathname : '/index.html') ;
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

	socket.emit('welcome', { msg : 'Welcome, who you are?'});
  
	socket.on('login', function(data, fn){
		var player = Player.create(data.name);
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
  		if(!data)
  			data = Game.create();
  		_player.join(data);
  		_games.push(data);
  		if(fn) fn(data);
  	});
  	
  	socket.on('send', function(data){
  		var sendData = {};
  		sendData.player=_player;
  		sendData.msg=sanitize(data).xss();
  		socket.emit('message',sendData);
  		socket.broadcast.emit('message',sendData);
  	});
  	
  	socket.on('disconnect', function(){
  		var idx = _players.indexOf(_player);
  		if(idx != -1) _players.splice(idx,1);
  	});
});


//We export the socket
module.exports = io;




