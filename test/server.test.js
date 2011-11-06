var should = require('should'),
	client = require('socket.io-client'),
	server = require('../src/server.js'),
	Player = require('../src/player.js'),
	Game = require('../src/game.js');


var connected = false;
//var connectedB = false;

	
var socket = client.connect('http://localhost', {port : 8000});
//Hem de fer aixo perque es reconnecti de forma automatica
socket.on('error', function(data){
	if(!connected) socket.socket.reconnect();
});


//var socketB = client.connect('http://localhost', {port : 8000});
//socketB.on('error', function(data){
//	if(!connectedB) socketB.socket.reconnect();
//});


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
//			done();
//		});
//	},
	"We are recibing a login event after connecting" : function(done){
		socket.on('login', function (data){
			connected.should.be.true;
			data.msg.should.eql('Welcome, who you are?');
			done();
		});
	},
	"When we send a name event the server stores our name and acknowledgets it" : function (done){
		socket.emit('name',{'name' : 'Luiggi'}, function(data){
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
	"When we querry for the connected players we get a list of players " : function(done){
		socket.emit('list-players',null,function(data){
			data.should.be.an.instanceof(Array);
			data.shift().name.should.eql('Luiggi');
			done();
		});
	},
	"When we create a game, the server stores it" : function(done){
		game = Game.create();
		socket.emit('create-game',game,function(data){
			recivedGame = Game.clone(data);
			recivedGame.numberOfPlayers().should.eql(1); //The player automatically joins the game
			socket.emit('list-games',null,function(data){
				data.should.be.an.instanceof(Array);
				data.length.should.eql(1);
				data.shift().should.eql(recivedGame);
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
	"The server must be able to notify a player in a Game" : function(done){
		//Todo:
		done();
	},
	"The server must be able to notify ALL player in a Game" : function(done){
		//Todo:
		done();
	},
	"When a player disconnects the server removes it's reference " : function(done){
		//Todo;
		finish(done);
	}
};




