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

app.get('/game', function(req,res){
    res.render('game');
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

io.sockets.on('connection', function (socket) {
    
    /*
    Used to get the curent player/player info
    */
    var _playerid;
    var _currentGameId;
    
    function getCurrentPlayer()
    {
        if(_playerid) return _players[_playerid];
        return;
    }

    function getCurrentGame()
    {
        if(!_currentGameId)
            return;
        for(i in _games)
        {
            if(_games[i].id ==  _currentGameId)
                return _games[i];
        }
        return;
    }
    
    /*
        Process an event on the current game. 
    */
    function processGameEvent(event,data,callback)
    {
        var game = getCurrentGame();
        if(game && game.state=='running')
            game.emit(event,data,callback);
        else
          callback && callback('No current game running');
    }

	socket.emit('welcome', { msg : 'Welcome, who you are?'});
  
	socket.on('login', function(data, fn){
		var player = Player.create(data.name,'',socket);
		_playerid = generateUniqueID();
		_players[_playerid]=player;
		player.id=_playerid;
		if(fn) fn(player);
  		socket.broadcast.emit('message',player.name + ' joined the server');
  	});
  	/*
  	    data: Holds the filter to apply
  	*/
  	socket.on('list-games', function(data, fn){
  	    var returnData=[];
  	    for(i in _games)
  	    {
  	        var game = Game.clone(_games[i]);
  	        if(game.players && game.players.length > 0 && game.players[0].cards 
  	            && game.players[0].cards.length > 0 )
  	        {
      	        for(j in game.players)
      	        {
      	            game.players[j].cards =[]
      	        }
      	    }
      	    returnData.push(game);
  	    }
  		if(fn) fn(returnData);
  	});
  	
  	socket.on('list-players', function(data, fn){
        var ret=[];
        for (var i in _players){
            ret.push({
                    'name' : _players[i].name,
                    'id' : _players[i].id,
                    });
        }
  		if(fn) fn(ret);
  	});
  	
  	
  	socket.on('create-game', function(data, fn){
        var game = Game.clone(data);
        //Every time the game recives a new evenet listener it's exposed to 
        //the server whe expose their events to the socket
        game.on('newListener',function(event,listener){
            socket.on(event,listener);
        });
  		game.addPlayer(getCurrentPlayer());
  		game.id=generateGameID();
  		_currentGameId=game.id;
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
  	        var current = getCurrentPlayer();
  	        if(_games[i].hasPlayer(current))
  	        {
      	        if(fn) fn('You are already in the game');
      	        return;
  	        }
            _games[i].addPlayer(current);
      		_currentGameId=_games[i].id;
            if(_games[i].numberOfPlayers()==4)
            {
                _games[i].state='running';
                _games[i].start();
            }
            if(fn) fn(false,_games[i]);
        }
        catch(err)
        {
            if(fn) fn(err.message);
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
  	
  	/*
  	 Game specific functions
  	*/
  	socket.on('new-roll',function(data,callback){ debugger; processGameEvent('new-roll',data,callback)});
  	socket.on('made-thriumph',function(data,callback){ processGameEvent('made-thriumph',data,callback)});
    socket.on('do-contro',function(data,callback){ 
            var player = getCurrentPlayer();
            data.player = player.name;
            processGameEvent('do-contro',data,callback)
    });

});


//We export the socket
module.exports = io;




