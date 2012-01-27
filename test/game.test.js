var Game = require('../src/game'),
	Player = require('../src/player'),
	should = require ('should');

var game = Game.create('New game');
var newPlayer = Player.create('new Player');

module.exports = {
    "Game's initials number of players should be 0" : function() {
        game.should.have.property('name');
        game.name.should.eql('New game');
		game.should.have.property('players');
		game.players.should.be.instanceof(Array);
		game.numberOfPlayers().should.eql(0);
		game.numberOfPlayers().should.eql(game.players.length);
	},
	"We can add players to the game":function(){
		game.should.respondTo('addPlayer');
	},
	"We have to now if a player has joined the game " : function(done){
	    function Ok(){
	        game.removeAllListeners('updated');
	        done();
	    }
	    function test(data){
            data.hasPlayer(newPlayer).should.be.true;
            data.hasPlayer(Player.create('no player')).should.be.false;
            Ok();
	    }
		game.should.respondTo('hasPlayer');
		game.on('updated',test);
		game.addPlayer(newPlayer);
	},
	"We can remove players from a game" : function(){
		game.numberOfPlayers().should.eql(1);
		game.should.respondTo('removePlayer');
		game.removePlayer(newPlayer).should.be.true;
		game.numberOfPlayers().should.eql(0);
		game.hasPlayer(newPlayer).should.be.false;
	},
	"A game should remeber each player that joins it" : function (){
		var playerA = Player.create('Player A');
		var playerB = Player.create('Player B');
		game.addPlayer(playerA);
		game.addPlayer(playerB);
		game.numberOfPlayers().should.eql(2);
		var players = game.players;
		players.shift().should.eql(playerA);
		players.shift().should.eql(playerB);
	},
	"If we clone a game it should be the same" : function(){
		var clonedGame = Game.clone(game);
		clonedGame.should.eql(game);
	},
	"The game should have a state property, 'waiting'' by default" : function(){
		game.should.have.property('state');
		game.state.should.eql('waiting');
	},
	"The game should have a min_players property, 0' by default" : function(){
		game.should.have.property('min_players');
		game.min_players.should.eql(0);
	},
	"We cant start a game only if there are more than the min_players" : function(){
        game.should.respondTo('start');
        should.doesNotThrow(function(){
            game.start();
        },Error,"Not enough players");
        game.min_players=4;
        should.throws(function(){
            game.start();
        },Error,"Not enough playerss");
	},
	"After starting the have the stat property should be 'running'" : function(){
		game.should.have.property('state');
		game.state.should.eql('running');
	},
	"Other players can watch the game " : function(){
	    game.should.respondTo('addWatcher');
		var watcher = Player.create('Watcher A');
		game.addWatcher(watcher);
        game.numberOfWatchers().should.eql(1);
        game.numberOfPlayers().should.eql(0);
	}
	
};
