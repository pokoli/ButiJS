var Game = require('../src/butifarraGame'), 
    Round = require('../src/butifarraRound'),
	Player = require('../src/player'),	
	should = require ('should');

function setUp(){
    var game = Game.create();
    var player1 = Player.create('John');
    var player2 = Player.create('Mark');
    var player3 = Player.create('Steve');
    var player4 = Player.create('Bill');
    player1.join(game);
    player2.join(game);
    player3.join(game);
    player4.join(game);
    game.start();
    return game.playedRounds[0];
}

var round = setUp();

module.exports = {
    "Butifarra Round consits of and of array moves, and a thriumpher " : function() {
        round.should.have.property('moves');
        round.moves.should.be.instanceof(Array);
        round.should.have.property('thriumpher');
    },
    "We should know if the thriumpher has delegated the thriump" : function(){
        round.should.have.property('delegated');
        round.delegated.should.eql(false);
    },
    "When the round is started each player has 12 cards " : function(){
        round.teams[1].forEach(function(player){
            player.should.have.property('cards');
            player.cards.should.be.instanceof(Array);
            player.cards.length.should.eql(12);
        });
        round.teams[2].forEach(function(player){
            player.should.have.property('cards');
            player.cards.should.be.instanceof(Array);
            player.cards.length.should.eql(12);
        })
    },
    "A player should be able to make thriumph only once in a round " : function(){
        round.should.respondTo('makeThriumph');
        should.doesNotThrow(function(){
            round.makeThriumph('Copes');
        },Error,"Make thriumph is allowed once per round");
        round.delegated.should.eql(false);
        should.throws(function(){
            round.makeThriumph('Copes');
        },Error,"Make thriumph is allowed once per round");
    },
    "If the thriumphs is delegated, the other player is allowed to make thriumph. " : function(){
        var round = setUp();
        round.should.respondTo('makeThriumph');
        should.doesNotThrow(function(){
            round.makeThriumph('Delega');
        },Error,"Make thriumph is allowed once per round");
        should.doesNotThrow(function(){
            round.makeThriumph('Botifarra');
        },Error,"Make thriumph is allowed once per round");
        round.delegated.should.eql(true);
        should.throws(function(){
            round.makeThriumph('Copes');
        },Error,"Make thriumph is allowed once per round");
    }
}   
