var should = require('should'),
	client = require('socket.io-client'),
	server = require('../src/server.js'),
	Player = require('../src/player.js'),
	Game = require('../src/butifarraGame.js');

var connected = false;
//var connectedB = false;
	
var socket = client.connect('http://localhost', {port : 8000});
//var socketB = client.connect('http://localhost', {port : 8000});

function finish(done) {
	console.log('Finish');
	connected.should.be.true;
//	connectedB.should.be.true;
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
//  TODO: Review it, strange things happens.	 
//	"Two (or more) connections could be established on the same time ": function(done){
//		socketB.on('connect', function (err) {
//			connectedB=true;
//			should.isUndefined(err);
//			socketB.disconnect();
//           done();
//		});
//	},
	"We are recibing a welcome event after connecting" : function(done){
		socket.on('welcome', function (data){
			connected.should.be.true;
			data.msg.should.eql('Welcome, who you are?');
			done();
		});
	},
	"When we send a name event the server stores our name and acknowledgets it" : function (done){
		socket.emit('login',{'name' : 'Luiggi'}, function(data){
			data.name.should.eql('Luiggi');
			done();
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
			data.shift().name.should.eql('Luiggi');
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
		socket.on('message',function(data){
			data.player.name.should.eql('Luiggi');
			data.msg.should.eql(msg);
			done();
		});
		socket.emit('send',msg);
	
	},
	"A player should be able to join a game" : function(done){
	    socket.emit('join-game',1,function(err,data){
	        should.ifError(err);
	        data.players.length.should.eql(2);
	        done();
	    });
	},
	"The server must respond to rounds events. If no current game with an error": function(done){
	    socket.emit('made-thriumph',25,function(err){
	        err.should.eql('No current game running');
	        done();
	    
	    });
	},
	"When a player disconnects the server removes it's reference " : function(done){
		//Todo;
		finish(done);
	}
};




