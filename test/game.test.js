var Game = require('../src/game'),
	Player = require('../src/player'),
	shodul = require ('should');

var game = Game.create();

module.exports = {
    "Game's initials number of players should be 0" : function() {
		game.should.have.property('players');
		game.players.should.be.instanceof(Array);
		game.numberOfPlayers().should.eql(0);
		game.numberOfPlayers().should.eql(game.players.length);
	},
	"A game should remeber each player that joins it" : function (){
		var playerA = Player.create();
		playerA.name='Player A';
		var playerB = Player.create();
		playerB.name='Player B';
		playerA.join(game);
		playerB.join(game);
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
	
};
