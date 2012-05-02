var express = require('express') 
  , socketio = require('socket.io')
  , fs = require('fs')
  , url = require('url')
  , sanitize = require('validator').sanitize
  , i18n = require('i18n')
  , Game = require('./butifarraGame')
  , Player = require('./player')
  , Bot = require('./bots/simpleBot').Bot;
var app = express.createServer();

//Static files configuration
var pub = __dirname + '/public/'; 


i18n.configure({
    locales:['ca', 'es', 'en'],
    register: global
});

app.configure(function(){
    app.use(express.bodyParser());
    //Load i18n machinery.
    app.use(i18n.init);
    // register helpers for use in templates
    app.helpers({
      __i: i18n.__,
      __n: i18n.__n
    });

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

var serverURL;
app.get('/', function(req,res){
    serverURL = req.header('host');
    res.render('index',{'serverUrl': req.header('host')});
});

app.get('/game', function(req,res){
    res.render('game');
});
var port = process.env.PORT || 8000;
app.listen(port);
var io = socketio.listen(app, {log:false});

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
    }

    function getCurrentGame()
    {
        if(!_currentGameId)
            return;
        for(var i=0;i<_games.length;i++)
        {
            if(_games[i].id ===  _currentGameId)
                return _games[i];
        }
    }
    
    /*
        Process an event on the current game. 
    */
    function processGameEvent(event,data,callback)
    {
        var game = getCurrentGame();
        if(game) //Removed for translation errors&& game.state==='running')
            game.emit(event,data,callback);
        else
          callback && callback(i18n.__('No current game running'));
    }

	socket.emit('welcome', { msg : i18n.__('Welcome, who you are?')});
  
	socket.on('login', function(data, fn){
		var player = Player.create(data.name,'',socket);
		_playerid = generateUniqueID();
		_players[_playerid]=player;
		player.id=_playerid;
		if(fn) fn(player);
  		socket.broadcast.emit('message',i18n.__('%s joined the server',player.name));
  	});
  	/*
  	    data: Holds the filter to apply
  	*/
  	socket.on('list-games', function(data, fn){
  	    var returnData=[];
  	    for(var i=0;i<_games.length;i++)
  	    {
  	        var game = Game.clone(_games[i]);
  	        if(game.players && game.players.length > 0 && game.players[0].cards 
  	            && game.players[0].cards.length > 0 )
  	        {
      	        for(var j=0;j<game.players.length;j++)
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
        for (var id in _players){
            ret.push({
                    'name' : _players[id].name,
                    'id' : _players[id].id,
                    });
        }
  		if(fn) fn(ret);
  	});
  	
  	
  	socket.on('create-game', function(data, fn){
        var game = Game.clone(data);
  		game.addPlayer(getCurrentPlayer(),function(err){
  		    if(err)
  		    {
  		        fn && fn(err);
  		        return;
  		    }
      		game.id=generateGameID();
      		_currentGameId=game.id;
      		_games.push(game);
      		if(fn) fn(false,game);
  		});
  	});
  	
  	socket.on('join-game', function(data, fn){
  	    //1. Find the game.
  	    var game;
  	    for(var i=0;i<_games.length;i++)
  	    {
  	        if(_games[i].id === data)
  	        {
  	            game=_games[i];
  	            break;
  	        }
  	    }
  	    if(!game)
  	    {
  	        if(fn) fn(__('Game %s does not exist',data));
  	        return;
  	    }

        var current = getCurrentPlayer();
        if(_games[i].hasPlayer(current))
        {
  	        if(fn) fn(__('You are already in the game'));
  	        return;
        }

        _games[i].addPlayer(current,function(err){
            if(err){
                fn && fn(err);
                return;
            }
      		_currentGameId=_games[i].id;
            if(_games[i].numberOfPlayers()===4)
            {
                _games[i].start();
            }
            if(fn) fn(false,_games[i]);
        });

  	});
  	
  	socket.on('watch-game', function(data, fn){
  	    //1. Find the game.
  	    var game;
  	    for(var i=0;i<_games.length;i++)
  	    {
  	        if(_games[i].id === data)
  	        {
  	            game=_games[i];
  	            break;
  	        }
  	    }
  	    if(!game)
  	    {
  	        if(fn) fn(__('Game %s does not exist',data));
  	        return;
  	    }

        var current = getCurrentPlayer();
        if(_games[i].hasPlayer(current))
        {
  	        if(fn) fn(__('You are already in the game'));
  	        return;
        }
        if(_games[i].hasWatcher(current))
        {
  	        if(fn) fn(__('You are already watching the game'));
  	        return;
        }
        _games[i].addWatcher(current,function(err){
            if(err){
                fn && fn(err);
                return;
            }
            if(fn) fn(false,_games[i]);
        });

  	});

  	socket.on('add-bot', function(data, fn){
  	    //1. Find the game.
  	    var game;
  	    for(var i=0;i<_games.length;i++)
  	    {
  	        if(_games[i].id === data)
  	        {
  	            game=_games[i];
  	            break;
  	        }
  	    }
  	    if(!game)
  	    {
  	        if(fn) fn(__('Game %s does not exist',data));
  	        return;_name
  	    }
        var bot = new Bot();
        bot.createPlayer();
        bot.id=generateUniqueID();
        _games[i].addPlayer(bot,function(err){
            if(err){
                fn && fn(err);
                return;
            }
      		_currentGameId=_games[i].id;
            if(_games[i].numberOfPlayers()===4)
            {
                _games[i].start();
            }
            if(fn) fn(false,_games[i]);
        });
        //Pass the bot events to the game.
        bot.on('new-roll',function(data,callback){ processGameEvent('new-roll',data,callback)});
  	    bot.on('chosen-thriumph',function(data,callback){ processGameEvent('chosen-thriumph',data,callback)});
        bot.on('do-contro',function(data,callback){ 
            data.player = bot;
            processGameEvent('do-contro',data,callback);
        });
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
      				if(game.numberOfPlayers()===0)
      					_games.splice(idx,1);
      			}
      		})
      		socket.broadcast.emit('message',__(' %s left the server',player.name));
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
  	socket.on('new-roll',function(data,callback){ processGameEvent('new-roll',data,callback)});
  	socket.on('chosen-thriumph',function(data,callback){ processGameEvent('chosen-thriumph',data,callback)});
    socket.on('do-contro',function(data,callback){ 
            data.player = getCurrentPlayer();
            processGameEvent('do-contro',data,callback);
    });

    //Translation specific function
    socket.on('translate',function(text,callback){
        callback(__(text));
    });
});


//We export the socket
module.exports = io;




