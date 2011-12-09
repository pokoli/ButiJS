var Game = require('../src/butifarraGame'),
	Player = require('../src/player'),	
	Stack = require('../src/spanishCardStack'),
	should = require ('should');

var game = Game.create();
var player1 = Player.create('John');
var player2 = Player.create('Mark');
var player3 = Player.create('Steve');
var player4 = Player.create('Bill');

module.exports = {
    "Butifarra should responTo game's basic methods" : function () {
        game.should.respondTo('numberOfPlayers');
        game.should.respondTo('addPlayer');
        game.should.respondTo('start');
    },
    "Butifarra consits of teams, scores and a spanishCardStack" : function() {
        game.should.have.property('teams');
        game.should.have.property('score');
        game.should.have.property('stack');
        //game.stack.should.be.instanceof(Stack);
    },
    "A butifarraGame needs 4 players to start" : function() {
        game.min_players.should.eql(4);
        should.throws(function(){
            game.start();
        },Error,"Not enough playerss");
        player1.join(game);
        player2.join(game);
        player3.join(game);
        player4.join(game);
        should.doesNotThrow(function(){
            game.start();
        },Error,"Not enough players");        
    },
    "When the game is started round should be 1" : function() {
        game.round.should.eql(1);
    },
    "When the game is started all teams must have 2 players" : function() {
        game.teams[1].length.should.eql(2);
        game.teams[2].length.should.eql(2);
    },
    "When the game is started all the players should be in order (beetween the others team players)" : function() {
        var lastTeam=0;
        game.players.forEach(function(player){
            player.team.should.not.eql(lastTeam);
            lastTeam=player.team;
        });
    },
    
    "When the game is started all player must have 12 cards" : function() {
        game.players.forEach(function(player){
            player.cards.should.instanceof(Array);
            player.cards.length.should.eql(12);
            player.cards.forEach(function(card){
        		card.should.have.property('number');
		        card.should.have.property('suit');
            });
        });
    }
}   
