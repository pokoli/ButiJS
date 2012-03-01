var Game = process.env.COVERAGE ? require('../src-cov/butifarraGame') : require('../src/butifarraGame'),
    Card = process.env.COVERAGE ? require('../src-cov/card') : require('../src/card'),
    Round = process.env.COVERAGE ? require('../src-cov/butifarraRound') : require('../src/butifarraRound'),
    Player = process.env.COVERAGE ? require('../src-cov/player') : require('../src/player'),
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
    game.test=true;
    game.start();
    return game.playedRounds[0];
}

var round = setUp();


module.exports = {
    "Butifarra Round consits of and of array moves, and a thriumpher " : function(done) {
        round.should.have.property('moves');
        round.moves.should.be.instanceof(Array);
        round.should.have.property('thriumpher');
        done();
    },
    "We should know if the thriumpher has delegated the thriump" : function(done){
        round.should.have.property('delegated');
        round.delegated.should.eql(false);
        done();
    },
    "We should know the winned cards of each team" : function(done){
        round.should.have.property('winnedCards');
        round.winnedCards[1].should.be.instanceof(Array);
        round.winnedCards[1].should.eql([]);
        round.winnedCards[2].should.be.instanceof(Array);
        round.winnedCards[2].should.eql([]);
        done();
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
    "A player should be able to make thriumph only once in a round " : function(done){
        var ends=2;
        function end()
        {
            ends--;
            if(ends===0) done();
        }
        
        round.should.respondTo('makeThriumph');
        round.makeThriumph('Copes',function(err){
            should.ifError(err);
            end();
        });
        round.delegated.should.eql(false);
        round.thriumph.should.eql('Copes');
        round.makeThriumph('Copes',function(err){
            err.should.eql("Make thriumph is allowed once per round");
            end();
        });
    },
    "If the thriumphs is delegated, the other player is allowed to make thriumph. " : function(done){
        var ends=3;
        function end()
        {
            ends--;
            if(ends===0) done();
        }
        round = setUp();
        round.should.respondTo('makeThriumph');
        round.makeThriumph('Delegar',function(err){
            should.ifError(err);
            end();
        });
        round.makeThriumph('Botifarra',function(err){
            should.ifError(err);
            end();
        });
        round.delegated.should.eql(true);
        round.thriumph.should.eql('Botifarra');
        round.makeThriumph('Copes',function(err){
            err.should.eql("Make thriumph is allowed once per round");
            end();
        });
    }, 
    "When a player makes thriumph an chosen-thriumph event is fired" : function(done){
        round = setUp();
        round.on('chosen-thriumph',function(data){
            data.should.be.eql('Copes');
            done();
        });
        round.emit('chosen-thriumph','Copes');
    },
    "After making thriumph a contro event event is fired, if anybody does contro the multiplier must be set to 2" : function(done){
        var contros=0;
        round = setUp();
        round.on('contro-done',function(data)
        {
            contros++;
            data.value.should.eql(2*contros);
            round.multiplier.should.eql(2*contros);
            data.player.name.should.eql('Mark');
            if(contros===2) done();
        });
        round.on('notify-contro',function(){
            round.emit('do-contro',{'value': true, 'player': {'name': 'Mark'}});
        });
        round.emit('chosen-thriumph','Bastos');
    },
    "We should kwow who have contred on the round" : function(done){
        var round0 = setUp();
        var contros=0;
        round0.on('contro-done',function(data)
        {
            contros++;
            data.value.should.eql(2*contros);
            round0.multiplier.should.eql(2*contros);
            round0.controPlayers.should.be.instanceof(Array);
            round0.controPlayers.length.should.eql(contros);
            for(var i=0;i<round0.controPlayers.length;i++)
                round0.controPlayers[i].name.should.eql('Mark');
            data.player.name.should.eql('Mark');
            if(contros===2) done();
        });
        round0.on('notify-contro',function(){
            round0.emit('do-contro',{'value': true, 'player': {'name': 'Mark'}});
        });
        round0.emit('chosen-thriumph','Bastos');
    },
    "After 4 rolls the move is endend and a new-round event is fired" : function(done){
        round = setUp();
        round.on('notify-contro',function(){
            round.emit('do-contro',{'value': false});
            round.emit('do-contro',{'value': false});
            round.emit('new-roll',Card.create(2,'Espases'), function(err){ if(err) console.log(err);});
            round.emit('new-roll',Card.create(3,'Espases'), function(err){ if(err) console.log(err);});
            round.emit('new-roll',Card.create(4,'Espases'), function(err){ if(err) console.log(err);});
            round.emit('new-roll',Card.create(5,'Espases'), function(err){ if(err) console.log(err);});
        });

        var events=2;
        function myDone(moveData){
            events.should.eql(0);
            moveData.rolls.length.should.eql(4);
            for(var i=0;i<moveData.length;i++)
            {   
                var roll = moveData.rolls[i];
                roll.card.suit.should.eql('Espases');
            }
            done();
        }
        round.on('end-move',function(roundData){
            events--;
            myDone(roundData);
        });
        bnewMove=false;
        round.on('new-move',function(){
            if(!bnewMove)
            {
                events--;
                bnewMove=true;
            }
        });
        round.emit('chosen-thriumph','Bastos');
    },
    "When the round is ended the played cards should be in the winning team's winned cards " : function(done){
        round = setUp();
        round.on('notify-contro',function(){
            round.emit('do-contro',{'value': false});
            round.emit('do-contro',{'value': false});
        });
        round.on('end-move',function(move){
            move.getValue().should.eql(1);
            var winner = move.getWinner();
            var winnedCards = []
            for(var i=0;i<move.rolls.length;i++)
            {
                var card=move.rolls[i].card;
                winnedCards.push(card);
            }
            winnedCards.length.should.eql(4);
            done();
        });
        
        round.emit('chosen-thriumph','Bastos');
        round.emit('new-roll',Card.create(2,'Espases'));
        round.emit('new-roll',Card.create(3,'Espases'));
        round.emit('new-roll',Card.create(4,'Espases'));
        round.emit('new-roll',Card.create(5,'Espases'));
    },
    "We should know the score of the round " : function(done){
        round.should.respondTo('getScores');
        var scores = round.getScores();
        scores[1].should.within(0,36);
        scores[2].should.within(0,36);
        done();
    },
    "Each round constits of 12 moves, when it's finished it fires an round-ended event'" : function(done){
        var round2 = setUp();
        round2.on('notify-contro',function(){
            round2.emit('do-contro',{'value': false});
            round2.emit('do-contro',{'value': false});
        });
        var numberOfRounds=0;
        function testErr(err)
        {
            should.ifError(err);
        }

        function doMove(){
            numberOfRounds++;
            round2.emit('new-roll',Card.create(2,'Espases'),testErr);
            round2.emit('new-roll',Card.create(3,'Espases'),testErr);
            round2.emit('new-roll',Card.create(4,'Espases'),testErr);
            round2.emit('new-roll',Card.create(5,'Espases'),testErr);
        }
        
        round2.on('round-ended',function(data){
            data.moves.should.be.instanceof(Array);
            data.moves.length.should.eql(12);
            numberOfRounds.should.eql(12);
            done();
        });
        round2.on('new-move',function(){
            doMove();
        });
        //Start the round 
        round2.emit('chosen-thriumph','Bastos');
    }

}   
