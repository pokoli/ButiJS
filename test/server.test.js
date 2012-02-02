var should = require('should'),
	client = require('socket.io-client'),
	server = require('../src/server.js'),
	Player = require('../src/player.js'),
	Game = require('../src/butifarraGame.js');

var connected = false,connectedB = false,connectedC = false,connectedD = false;
	
var socket = client.connect('http://localhost', {port : 8000});
var socketB = client.connect('http://localhost', {port : 8000,'force new connection': true});
var socketC = client.connect('http://localhost', {port : 8000,'force new connection': true});
var socketD = client.connect('http://localhost', {port : 8000,'force new connection': true});

function finish(done) {
	console.log('Finish');
	connected.should.be.true;
	connectedB.should.be.true;
	connectedC.should.be.true;
	connectedD.should.be.true;
	done();
  	server.server.close();
}

module.exports = {
	"We will be able to connect the server" : function(done){	
		socket.on('connect', function (err) {
			connected=true;
			should.isUndefined(err);
			done();
		});
	},	 
	"Two (or more) connections could be established on the same time ": function(){
		socketB.on('connect', function (err) {
    		connectedB=true;
			should.isUndefined(err);
		});
		socketC.on('connect', function (err) {
    		connectedC=true;
			should.isUndefined(err);
		});
		socketD.on('connect', function (err) {
    		connectedD=true;
			should.isUndefined(err);
		});
	},
	"We are recibing a welcome event after connecting" : function(done){
		socket.on('welcome', function (data){
			connected.should.be.true;
			data.msg.should.eql('Welcome, who you are?');
			done();
		});
	},
	"When we send a name event the server stores our name and acknowledgets it" : function (done){
	    var logins=4;
	    function doLogin(){
	        logins--;
	        if(logins==0) done();
	    }
		socket.emit('login',{'name' : 'Luiggi'}, function(data){
			data.name.should.eql('Luiggi');
			doLogin();
		});
		socketB.emit('login',{'name' : 'Mario'}, function(data){
			data.name.should.eql('Mario');
			doLogin();
		});
		socketC.emit('login',{'name' : 'Yoshi'}, function(data){
			data.name.should.eql('Yoshi');
			doLogin();
		});
		socketD.emit('login',{'name' : 'Peach'}, function(data){
			data.name.should.eql('Peach');
			doLogin();
		});
		
	},
	"When we querry for the available games we get a list of games " : function(done){
		socket.emit('list-games',null,function(data){
			data.should.be.an.instanceof(Array);
			data.should.eql([]);
			done();
		});
	},
	"When we query for the connected players we get a list of players " : function(done){
		socket.emit('list-players',null,function(data){
			data.should.be.an.instanceof(Array);
			data.length.should.eql(4);
			var names = ['Peach','Yoshi','Mario','Luiggi'].sort();
            var sorted = [];
            for(var i=0;i<data.length;i++)
                sorted.push(data[i].name);
            sorted = sorted.sort();
            sorted.should.eql(names);
			done();
		});
	},
	"When we create a game, the server stores it" : function(done){
		game = Game.create('New Game');
		socket.emit('create-game',game,function(data){
			recivedGame = Game.clone(data);
			var tempData = data;
			recivedGame.numberOfPlayers().should.eql(1); //The player automatically joins the game
			recivedGame.should.have.property('id'); //The server automatically assigns an id to the game
			socket.emit('list-games',null,function(data){
				data.should.be.an.instanceof(Array);
				data.length.should.eql(1);
                data.shift().should.eql(tempData);
				done();
			});
		});	
	},
	"You cand send messages to all players in the server " : function(done) {
		var msg = 'Hello, how are you';
		var recived=4;
		function message(data){
			data.player.name.should.eql('Luiggi');
			data.msg.should.eql(msg);
			recived--;
			if(recived==0) done();
		}
		
		socket.on('message',message);
		socketB.on('message',message);
		socketC.on('message',message);
		socketD.on('message',message);
		socket.emit('send',msg);
	
	},
	"A player should be able to join a game" : function(done){
	    socketB.emit('join-game',1,function(err,data){
	        should.ifError(err);
	        data.players.length.should.eql(2);
	        done();
	    });
	},
	"A player should be able a game only one time. " : function(done){
	    socket.emit('join-game',1,function(err,data){
	        err.should.eql('You are already in the game');
	        done();
	    });
	},
	"The server must respond to rounds events. If no current game with an error": function(done){
	    socket.emit('made-thriumph',25,function(err){
	        err.should.eql('No current game running');
	        done();
	    
	    });
	},
	"When 4 players join a game a start event must occur foreach player " : function(done){
	    var startedEvents=4;
	    
	    function started(game)
	    {
	        startedEvents--;
	        if(startedEvents==0) done();
	    }
	    
	    socket.on('start',started);
	    socketB.on('start',started);
	    socketC.on('start',started);
	    socketD.on('start',started);
	
	    function joinGame(game){
	        socketB.emit('join-game',game.id);
	        socketC.emit('join-game',game.id);
            socketD.emit('join-game',game.id);
	    }
    	game = Game.create('New Game');
		socket.emit('create-game',game,joinGame);
	},
	"When a player disconnects the server removes it's reference " : function(done){
		//Todo;
		finish(done);
	}
};




