var Game = require('../src/butifarraGame'), 
    Card = require('../src/card'),     
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
        round.thriumph.should.eql('Copes');
        should.throws(function(){
            round.makeThriumph('Copes');
        },Error,"Make thriumph is allowed once per round");
    },
    "If the thriumphs is delegated, the other player is allowed to make thriumph. " : function(){
        round = setUp();
        round.should.respondTo('makeThriumph');
        should.doesNotThrow(function(){
            round.makeThriumph('Delega');
        },Error,"Make thriumph is allowed once per round");
        should.doesNotThrow(function(){
            round.makeThriumph('Botifarra');
        },Error,"Make thriumph is allowed once per round");
        round.delegated.should.eql(true);
        round.thriumph.should.eql('Botifarra');
        should.throws(function(){
            round.makeThriumph('Copes');
        },Error,"Make thriumph is allowed once per round");
    }, 
    "When a player makes thriumph an made-thriumph event is fired" : function(done){
        round = setUp();
        round.on('made-thriumph',function(data){
            data.should.be.eql('Copes');
            done();
        });
        round.emit('made-thriumph','Copes');
    },
    "After making thriumph a startRound event is fired" : function(done){
        round = setUp();
        round.on('new-move',function(){
            done();
        });
        round.emit('made-thriumph','Bastos');
    },
    "After 4 rolls the move is endend and a new-round event is fired" : function(done){
        var events=2;
        function myDone(){
            round.moves.should.be.instanceof(Array);
            round.moves.length.should.eql(1);
            round.moves[0].rolls.length.should.eql(4);
            for(i in round.moves[0].rolls)
            {   
                var roll = round.moves[0].rolls[i];
                roll.card.suit.should.eql('Espases');
            }
            done();
        }
        round.on('end-move',function(){
            events--;
            if(events==0) myDone();
        });
        round.on('new-move',function(){
            events--;
            if(events==0) myDone();
        });
    
        round.emit('new-roll',Card.create(2,'Espases'));
        round.emit('new-roll',Card.create(3,'Espases'));
        round.emit('new-roll',Card.create(4,'Espases'));
        round.emit('new-roll',Card.create(5,'Espases'));     
    },
    "Each round constits of 12 moves, when it's finished it fires an round-ended event'" : function(done){
        var round2 = setUp();
        
        function doMove(){
            round2.emit('new-roll',Card.create(2,'Espases'));
            round2.emit('new-roll',Card.create(3,'Espases'));
            round2.emit('new-roll',Card.create(4,'Espases'));
            round2.emit('new-roll',Card.create(5,'Espases'));  
        }
        
        round2.on('round-ended',function(data){
            data.moves.should.be.instanceof(Array);
            data.moves.length.should.eql(12);
            done();
        });
        round2.on('new-move',function(){
            doMove();
        });
        //Start the round 
        round2.emit('made-thriumph','Bastos');
    
    }

}   
