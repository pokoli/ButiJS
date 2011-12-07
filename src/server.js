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

//Variable for hosting the current games and players on the server
var _games = [];
//The _players is a dict, with the id of the player, and the player object.
var _players = {};


/*
This function is used to generate an unique ID foreach player.
The unique ID is asociated to the socket of the player.]
*/
var uniqueCounter=0;
function generateUniqueID(){
    uniqueCounter++;
    return uniqueCounter;
}
/**
Gets a list of all the players (without the id)
*/
function getPlayers()
{
    var ret=[];
    for (var i in _players){
        ret.push(_players[i])
    }
    return ret;
}

io.sockets.on('connection', function (socket) {
    
    /*
    Used to get the curent player info
    */
    var _playerid;
    function getCurrentPlayer()
    {
        if(_playerid) return _players[_playerid];
        return null;
    }

	socket.emit('welcome', { msg : 'Welcome, who you are?'});
  
	socket.on('login', function(data, fn){
		var player = Player.create(data.name,'',this);
		_playerid = generateUniqueID();
		_players[_playerid]=player;
		if(fn) fn(player);
  		socket.broadcast.emit('message',player.name + ' joined the server');
  	});
  	
  	socket.on('list-games', function(data, fn){
  		if(fn) fn(_games);
  	});
  	
  	socket.on('list-players', function(data, fn){
  		if(fn) fn(getPlayers());
  	});
  	
  	socket.on('create-game', function(data, fn){
  		var game = Game.clone(data);
  		game.addPlayer(getCurrentPlayer());
  		_games.push(game);
  		if(fn) fn(data);
  	});
  	
  	socket.on('send', function(data){
  		var sendData = {};
  		sendData.player=getCurrentPlayer();
  		sendData.msg=sanitize(data).xss();
  		socket.emit('message',sendData);
  		socket.broadcast.emit('message',sendData);
  	});
  	
  	socket.on('disconnect', function(){
  	    var player = getCurrentPlayer();
  		_games.forEach(function(game,idx){
  			if(game.hasPlayer(player))
  			{
  				game.removePlayer(player);
  				if(game.numberOfPlayers()==0)
  					_games.splice(idx,1);
  			}
  		})

  		socket.broadcast.emit('message',player.name + ' left the server');
  		delete _players[_playerid];
  		delete _playerid=null;
  	});
});


//We export the socket
module.exports = io;




