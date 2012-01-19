var express = require('express') 
  , socketio = require('socket.io')
  , fs = require('fs')
  , url = require('url')
  , sanitize = require('validator').sanitize
  , Game = require('./butifarraGame')
  , Player = require('./player');
  
var app = express.createServer();

//Static files configuration
var pub = __dirname + '/public/'; 


app.configure(function(){
    app.use(express.bodyParser());
    //The static content is exposed in the /public/ directory
    app.use('/public/',express.static(pub));
    app.use(express.methodOverride());
    app.use(app.router);
    app.use(express.errorHandler());
    app.set('view engine', 'jade');
    app.set('view options', { layout: false});
});

app.configure('development',function(){
	app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
    app.set('view options', { pretty: true , layout: false});
});

app.get('/', function(req,res){
    res.render('index');
});

app.listen(8000);
var io = socketio.listen(app);


//Variable for hosting the current games and players on the server
var _games = [];
//The _players is a dict, with the id of the player, and the player object.
var _players = {};

/*
This function is used to generate an unique ID foreach game.
The unique ID is associated with a game when created. 
*/
var gameCounter=0;
function generateGameID(){
    gameCounter++;
    return gameCounter;
}

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
  		game.id=generateGameID();
  		_games.push(game);
  		if(fn) fn(game);
  	});
  	
  	socket.on('join-game', function(data, fn){
  	    //1. Find the game.
  	    var game;
  	    for(var i in _games)
  	    {
  	        if(_games[i].id == data)
  	        {
  	            game=i;
  	            break;
  	        }
  	    }
  	    if(!game)
  	    {
  	        if(fn) fn(new Error('Game '+data+' does not exist'));
  	        return;
  	    }
  	    try{
            _games[i].addPlayer(getCurrentPlayer());
            if(fn) fn(false,_games[i]);
        }
        catch(err)
        {
            if(fn) fn(err);
        }

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
  	    
  	    if(player)
  	    {
      		_games.forEach(function(game,idx){
      			if(game.hasPlayer(player))
      			{
      				game.removePlayer(player);
      				if(game.numberOfPlayers()==0)
      					_games.splice(idx,1);
      			}
      		})
      		socket.broadcast.emit('message',player.name + ' left the server');
      	}
      	
  		if(_playerid)
  		{
      		delete _players[_playerid];
      		delete _playerid;
  		}
  	});
});


//We export the socket
module.exports = io;




