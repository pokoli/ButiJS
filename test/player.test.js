var Player = require('../src/player'),
	Game = require('../src/game'),
	should = require ('should');

module.exports = {
    " A player has name and email attributes" : function() {
		var player = Player.create('','');
		player.should.have.property('name');
		player.should.have.property('email');
		player.name.should.eql('');
		player.email.should.eql('');
	},
	" If we define a name and an email they should be stored" : function () {
		var player = Player.create('Pedro','test@gmail.com');
		player.name.should.eql('Pedro');
		player.email.should.eql('test@gmail.com');
	},
	"Players can join a game" : function () {
		var game = Game.create();
		var player = Player.create();
		player.should.respondTo('join');
		player.join(game);
	},
	"If a player joins a non Game object and error must be throw" : function(){
		should.throws(function() {
			var player = Player.create();
			player.join('fakeGame')},Error,'Game must be an object');
	}
	
};
