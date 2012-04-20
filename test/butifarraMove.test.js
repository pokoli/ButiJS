var Move = process.env.COVERAGE ? require('../src-cov/butifarraMove') : require('../src/butifarraMove'),
	Player = process.env.COVERAGE ? require('../src-cov/player') : require('../src/player'),
	Card = process.env.COVERAGE ? require('../src-cov/card') : require('../src/card'),
	should = require ('should');

var player1 = Player.create('John');
player1.team=1;
player1.cards=[];
var player2 = Player.create('Mark');
player2.team=1;
player2.cards=[];
var player3 = Player.create('Steve');
player3.team=2;
player3.cards=[];
var player4 = Player.create('Bill');
player4.team=2;
player4.cards=[];

var thriumph = 'Copes';
var move = Move.create('Copes');
var CavallEspases = Card.create(11,'Espases');
module.exports = {
    "Butifarra Move is an array of rolls" : function(done) {
        move.should.have.property('rolls');
        move.rolls.should.be.instanceof(Array);
        done();
    },
    "A player can add its roll to the Move " : function(done) {
        move.should.respondTo('addRoll');
        done();
    },
    "The first Roll of a move could be any card" : function(done){
        player1.cards=[CavallEspases];
        move.addRoll(player1,CavallEspases,function(err){
            should.ifError(err);
            move.rolls.length.should.eql(1);
            move.rolls[0].card.should.eql(CavallEspases);
            move.rolls[0].player.should.eql(player1);
            done();
        });
    },
    "A player can't roll twice in the same move " : function(done){
        player1.cards=[CavallEspases];
        move.addRoll(player1,CavallEspases,function(err){
            should.exist(err);
            err.should.eql(Error('A player can roll only once'));
            done();
        });
    },
    "A card can't be rolled twice in the same move " : function(done){
        player2.cards=[CavallEspases];
        move.addRoll(player2,CavallEspases,function(err){
            should.exist(err);
            err.should.eql(Error('A card can be rolled only once'));
            done();
        });
    },
    "The next rolls should be from the same suit or thriumph (if doesn't have thriumph)" : function(done){
        var dones=5;
        var ReiEspases = Card.create(12,'Espases');
        player3.cards=[Card.create(11,'Oros'),Card.create(11,'Bastos'),ReiEspases,Card.create(2,'Copes')];
        move.addRoll(player3,Card.create(11,'Oros'),function(err){
            should.exist(err);
            err.should.eql(Error('Card must be from initial suit'));
            dones--;
            if(dones===0) done();
        });
        move.addRoll(player3,Card.create(11,'Bastos'),function(err){
            should.exist(err);
            err.should.eql(Error('Card must be from initial suit'));
            dones--;
            if(dones===0) done();
        });
        move.addRoll(player3,undefined,function(err){
            should.exist(err);
            err.should.eql(Error('Card must be defined'));
            dones--;
            if(dones===0) done();
        });
        move.addRoll(player3,ReiEspases,function(err){
            should.ifError(err);
            move.rolls.length.should.eql(2);
            move.rolls[1].card.should.eql(ReiEspases);
            move.rolls[1].player.should.eql(player3);
            dones--;
            if(dones===0) done();
        });
        ReiCopes = Card.create(12,'Copes');
        player2.cards=[ReiCopes];
        move.addRoll(player2,ReiCopes,function(err){
            should.ifError(err);
            move.rolls.length.should.eql(3);
            move.rolls[2].card.should.eql(ReiCopes);
            move.rolls[2].player.should.eql(player2);
            dones--;
            if(dones===0) done();
        });
    },
    "The next roll must be higher than the higest roll from the other team (when possible)" : function(done){
        var dones=6;
        function setUp(){
            move = Move.create();
            player1.cards=[Card.create(5,'Espases')];
            move.addRoll(player1,player1.cards[0]);
            player3.cards = [
                Card.create(1,'Espases'),
                Card.create(2,'Espases'),
                Card.create(3,'Espases'),
                Card.create(4,'Espases'),
                Card.create(6,'Espases'),
                Card.create(7,'Espases'),
                Card.create(8,'Espases'),
            ];
            return move;
        }
        function testError(err){
            should.exist(err);
            err.should.eql(Error('Card must be higher than others team'));
            dones--;
            if(dones===0) done();
        }
        function testNotError(err){
            should.ifError(err);
            dones--;
            if(dones===0) done();
        }

        move = setUp();
        move.addRoll(player3,player3.cards[1],testError);
        move.addRoll(player3,player3.cards[2],testError);
        move.addRoll(player3,player3.cards[3],testError);
        move.addRoll(player3,player3.cards[4],testNotError);
        setUp().addRoll(player3,player3.cards[5],testNotError);
        setUp().addRoll(player3,player3.cards[6],testNotError);
    },
    "We must be able to know the value of the move and the team that wons" : function(done){
        var dones=36;
        function testNotError(err){
            should.ifError(err);
            dones--;
            if(dones===0) done();
        }
        move.should.respondTo('getValue');
        move.should.respondTo('getWinner');
        var move0 = Move.create('Copes');
        player1.cards=[Card.create(2,'Espases')];
        player2.cards=[Card.create(3,'Espases')];
        player3.cards=[Card.create(4,'Espases')];
        player4.cards=[Card.create(5,'Espases')];
        move0.addRoll(player1,player1.cards[0],testNotError);
        move0.addRoll(player2,player2.cards[0],testNotError);
        move0.addRoll(player3,player3.cards[0],testNotError);
        move0.addRoll(player4,player4.cards[0],testNotError);
        move0.getWinner().should.eql(player4);
        move0.getValue().should.eql(1);
        var move1 = Move.create('Copes');
        player1.cards=[Card.create(11,'Espases')];
        player2.cards=[Card.create(12,'Espases')];
        player3.cards=[Card.create(1,'Espases')];
        player4.cards=[Card.create(9,'Espases')];
        move1.addRoll(player1,player1.cards[0],testNotError);
        move1.addRoll(player2,player2.cards[0],testNotError);
        move1.addRoll(player3,player3.cards[0],testNotError);
        move1.addRoll(player4,player4.cards[0],testNotError);
        move1.getWinner().should.eql(player4);
        move1.getValue().should.eql(15);
        var move2 = Move.create('Copes');
        player1.cards=[Card.create(2,'Espases')];
        player2.cards=[Card.create(11,'Espases')];
        player3.cards=[Card.create(8,'Espases')];
        player4.cards=[Card.create(5,'Espases')];
        move2.addRoll(player1,player1.cards[0],testNotError);
        move2.addRoll(player2,player2.cards[0],testNotError);
        move2.addRoll(player3,player3.cards[0],testNotError);
        move2.addRoll(player4,player4.cards[0],testNotError);
        move2.getWinner().should.eql(player2);
        move2.getValue().should.eql(3);
        var move3 = Move.create('Copes');
        player1.cards=[Card.create(2,'Espases')];
        player2.cards=[Card.create(11,'Copes')];
        player3.cards=[Card.create(8,'Espases')];
        player4.cards=[Card.create(5,'Espases')];
        move3.addRoll(player1,player1.cards[0],testNotError);
        move3.addRoll(player2,player2.cards[0],testNotError);
        move3.addRoll(player3,player3.cards[0],testNotError);
        move3.addRoll(player4,player4.cards[0],testNotError);
        move3.getWinner().should.eql(player2);
        move3.getValue().should.eql(3);
        var move4 = Move.create('Copes');
        player1.cards=[Card.create(2,'Espases')];
        player2.cards=[Card.create(2,'Copes')];
        player3.cards=[Card.create(3,'Copes')];
        player4.cards=[Card.create(10,'Copes')];
        move4.addRoll(player1,player1.cards[0],testNotError);
        move4.addRoll(player2,player2.cards[0],testNotError);
        move4.addRoll(player3,player3.cards[0],testNotError);
        move4.addRoll(player4,player4.cards[0],testNotError);
        move4.getWinner().should.eql(player4);
        move4.getValue().should.eql(2);
        var move5 = Move.create('Bastos');
        player1.cards=[Card.create(2,'Bastos')];
        player2.cards=[Card.create(7,'Espases')];
        player3.cards=[Card.create(8,'Espases'),Card.create(5,'Espases')];
        player4.cards=[Card.create(6,'Espases')];
        move5.addRoll(player2,player2.cards[0],testNotError);
        move5.addRoll(player4,player4.cards[0],testNotError);
        move5.addRoll(player1,player1.cards[0],testNotError);
        move5.addRoll(player3,player3.cards[1],testNotError);
        move5.getWinner().should.eql(player1);
        move5.getValue().should.eql(1);
        var move6 = Move.create('Oros');
        player1.cards=[Card.create(8,'Oros'),Card.create(7,'Oros'),Card.create(6,'Oros'),Card.create(5,'Copes'),Card.create(4,'Copes')];
        player2.cards=[Card.create(10,'Oros')];
        player3.cards=[Card.create(12,'Oros')];
        player4.cards=[Card.create(11,'Bastos')];
        move6.addRoll(player4,player4.cards[0],testNotError);
        move6.addRoll(player2,player2.cards[0],testNotError);
        move6.addRoll(player3,player3.cards[0],testNotError);
        move6.addRoll(player1,player1.cards[3],testNotError);
        move6.getWinner().should.eql(player3);
        move6.getValue().should.eql(7);
        var move7 = Move.create('Copes');
        player1.cards=[Card.create(10,'Oros'),Card.create(4,'Oros'),Card.create(3,'Oros'),Card.create(12,'Copes')];
        player2.cards=[Card.create(1,'Oros')];
        player3.cards=[Card.create(3,'Copes')];
        player4.cards=[Card.create(2,'Oros')];
        move7.addRoll(player4,player4.cards[0],testNotError);
        move7.addRoll(player2,player2.cards[0],testNotError);
        move7.addRoll(player3,player3.cards[0],testNotError);
        move7.addRoll(player1,player1.cards[2],testNotError);
        move7.getWinner().should.eql(player3);
        move7.getValue().should.eql(5);
        var move8 = Move.create('Bastos');
        player1.cards=[Card.create(3,'Copes')];
        player2.cards=[Card.create(2,'Copes')];
        player3.cards=[Card.create(2,'Oros'),Card.create(2,'Espases'),Card.create(2,'Bastos')];
        player4.cards=[Card.create(12,'Copes')];
        move8.addRoll(player2,player2.cards[0],testNotError);
        move8.addRoll(player4,player4.cards[0],testNotError);
        move8.addRoll(player1,player1.cards[0],testNotError);
        move8.addRoll(player3,player3.cards[0],testNotError);
        move8.getWinner().should.eql(player4);
        move8.getValue().should.eql(4);
    },
    "A player can only play a card that he/she has in the stack" : function(done){
        var move0=Move.create('Copes');
        move0.addRoll(player1,Card.create(2,'Espases'),function(err){
            should.exist(err);
            err.should.eql(Error("You can not play a card you don't have in the stack"));
            done();
        });
    },
    "After the player has played a card it gets removed for him/her stack" : function(done){
        var move0=Move.create('Copes');
        player1.cards=[Card.create(2,'Espases')];
        move0.addRoll(player1,player1.cards[0],function(err){
            should.ifError(err);
            player1.cards.length.should.eql(0);
            done();
        });
    },
    "If player has thriumph and not the current suit cards, a thriumph card must be played" : function(done){
        var move0=Move.create('Copes');
        player1.cards=[Card.create(2,'Espases')];
        move0.addRoll(player1,player1.cards[0],function(err){
            should.ifError(err);
            player1.cards.length.should.eql(0);
        });
        player3.cards=[Card.create(2,'Bastos'),Card.create(2,'Copes')];
        move0.addRoll(player3,player3.cards[0],function(err){
            err.should.eql(new Error('Card must be from thriumph suit'));
        });
        move0.addRoll(player3,player3.cards[1],function(err){
            should.ifError(err);
            done();
        });
    },
    "If we must play a card from init suit, correct cards would be suggested." : function(done){
        var move0=Move.create('Copes');
        player1.cards=[Card.create(2,'Espases')];
        move0.addRoll(player1,player1.cards[0],function(err){
            should.ifError(err);
            player1.cards.length.should.eql(0);
        });
        player3.cards=[Card.create(2,'Bastos'),Card.create(3,'Espases')];
        move0.addRoll(player3,player3.cards[0],function(err,sugestions){
            err.should.eql(new Error('Card must be from thriumph suit'));
            sugestions.should.be.instanceof(Array);
            sugestions.length.should.eql(1);
            sugestions[0].should.eql(Card.create(3,'Espases'));
            done();
        });
    },
    "If we must play a thriumph card, correct cards would be suggested." : function(done){
        var move0=Move.create('Copes');
        player1.cards=[Card.create(2,'Espases')];
        move0.addRoll(player1,player1.cards[0],function(err){
            should.ifError(err);
            player1.cards.length.should.eql(0);
        });
        player3.cards=[Card.create(2,'Bastos'),Card.create(2,'Copes')];
        move0.addRoll(player3,player3.cards[0],function(err,sugestions){
            err.should.eql(new Error('Card must be from thriumph suit'));
            sugestions.should.be.instanceof(Array);
            sugestions.length.should.eql(1);
            sugestions[0].should.eql(Card.create(2,'Copes'));
            done();
        });
    },
    "If we must play a higher card, correct cards would be suggested." : function(done){
        var move0=Move.create('Copes');
        player1.cards=[Card.create(6,'Espases')];
        move0.addRoll(player1,player1.cards[0],function(err){
            should.ifError(err);
            player1.cards.length.should.eql(0);
        });
        player3.cards=[Card.create(4,'Espases'),Card.create(7,'Espases'),Card.create(8,'Espases'),Card.create(10,'Espases'),Card.create(11,'Espases')];
        move0.addRoll(player3,player3.cards[0],function(err,sugestions){
            err.should.eql(new Error('Card must be higher than others team'));
            sugestions.should.be.instanceof(Array);
            sugestions.length.should.eql(4);
            sugestions[0].should.eql(Card.create(7,'Espases'));
            sugestions[1].should.eql(Card.create(8,'Espases'));
            sugestions[2].should.eql(Card.create(10,'Espases'));
            sugestions[3].should.eql(Card.create(11,'Espases'));
            done();
        });
    },
    "If player hasn't thriumph nor current suit cards, any card can be played" : function(done){
        var move0=Move.create('Copes');
        player1.cards=[Card.create(2,'Espases')];
        move0.addRoll(player1,player1.cards[0],function(err){
            should.ifError(err);
            player1.cards.length.should.eql(0);
        });
        player3.cards=[Card.create(2,'Bastos'),Card.create(2,'Oros')];
        move0.addRoll(player3,player3.cards[1],function(err){
            should.ifError(err);
        });
        var move1=Move.create('Copes');
        player1.cards=[Card.create(2,'Copes')];
        move1.addRoll(player1,player1.cards[0],function(err){
            should.ifError(err);
            player1.cards.length.should.eql(0);
        });
        player3.cards=[Card.create(2,'Bastos'),Card.create(2,'Oros')];
        move1.addRoll(player3,player3.cards[1],function(err){
            should.ifError(err);
            done();
        });
    },
    "If our team mate is the Winner our card must not be higher than her." : function(done){
        player1.cards=[Card.create(8,'Espases')];
        player2.cards=[Card.create(12,'Espases'),Card.create(6,'Espases')];
        player3.cards=[Card.create(5,'Espases'),Card.create(7,'Espases')];
        player4.cards=[Card.create(2,'Espases'),Card.create(3,'Espases')];
        var move0=Move.create('Copes');
        move0.addRoll(player1,player1.cards[0],function(err){
            should.ifError(err);
        });
        move0.addRoll(player3,player3.cards[1],function(err){
            should.ifError(err);
        });
        move0.addRoll(player2,player2.cards[1],function(err){
            should.ifError(err);
        });
        move0.addRoll(player4,player4.cards[1],function(err){
            should.ifError(err);
            done();
        });
    },
    "A move is composed of a maximum of 4 rolls" : function(done){
        var dones=5;
        var move0=Move.create('Copes');
        player1.cards=[Card.create(2,'Espases')];
        move0.addRoll(player1,player1.cards[0],function(err){
            should.ifError(err);
            player1.cards.length.should.eql(0);
            dones--;
            if(dones===0) done();
        });
        player3.cards=[Card.create(3,'Espases')];
        move0.addRoll(player3,player3.cards[0],function(err){
            should.ifError(err);
            player3.cards.length.should.eql(0);
            dones--;
            if(dones===0) done();
        });
        player2.cards=[Card.create(4,'Espases')];
        move0.addRoll(player2,player2.cards[0],function(err){
            should.ifError(err);
            player2.cards.length.should.eql(0);
            dones--;
            if(dones===0) done();
        });
        player4.cards=[Card.create(5,'Espases')];
        move0.addRoll(player4,player4.cards[0],function(err){
            should.ifError(err);
            player4.cards.length.should.eql(0);
            dones--;
            if(dones===0) done();
        });
        var player5 = Player.create('Jimmy Jump');
        player5.cards=[Card.create(6,'Espases')];
        move0.addRoll(player5,player5.cards[0],function(err){
            err.should.eql(Error('Only 4 rolls allowed'));
            player4.cards.length.should.eql(0);
            dones--;
            if(dones===0) done();
        });
    }
    
}   
