var Move = require('../src/butifarraMove'),
	Player = require('../src/player'),
	Card = require('../src/card'),		
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

module.exports = {
    "Butifarra Move is an array of rolls" : function() {
        move.should.have.property('rolls');
        move.rolls.should.be.instanceof(Array);
    },
    "A player can add its roll to the Move " : function() {
        move.should.respondTo('addRoll');
    },
    "The first Roll of a move could be any card" : function(){
        var CavallEspases = Card.create(11,'Espases');
        player1.cards=[CavallEspases];
        should.doesNotThrow(function(){
            move.addRoll(player1,CavallEspases);
        },Error,"Invalid movement");
        move.rolls.length.should.eql(1);
        move.rolls[0].card.should.eql(CavallEspases);
        move.rolls[0].player.should.eql(player1);   
    },
    "A player can't roll twice in the same move " : function(){
        should.throws(function(){
            player1.cards=[Card.create(11,'Espases')];
            move.addRoll(player1,Card.create(11,'Espases'));
        },Error,"Invalid movement");
    },
    "A card can't be rolled twice in the same move " : function(){
        should.throws(function(){
            player2.cards=[Card.create(11,'Espases')];
            move.addRoll(player2,Card.create(11,'Espases'));
        },Error,"Invalid movement");
    },
    "The next rolls should be from the same suit or thriumph (if doesn't have thriumph)" : function(){
        var ReiEspases = Card.create(12,'Espases');
        player3.cards=[Card.create(11,'Oros'),Card.create(11,'Bastos'),ReiEspases,Card.create(2,'Copes')];
        should.throws(function(){
            move.addRoll(player3,Card.create(11,'Oros'));
        },Error,"Invalid movement"); 
        should.throws(function(){
            move.addRoll(player3,Card.create(11,'Bastos'));
        },Error,"Invalid movement"); 
        should.doesNotThrow(function(){
            move.addRoll(player3,ReiEspases);
        },Error,"Invalid movement");
        move.rolls.length.should.eql(2);
        move.rolls[1].card.should.eql(ReiEspases);
        move.rolls[1].player.should.eql(player3);
        ReiCopes = Card.create(12,'Copes');
        player2.cards=[ReiCopes];
        should.doesNotThrow(function(){
            move.addRoll(player2,ReiCopes);
        },Error,"Invalid movement");
        move.rolls.length.should.eql(3);
        move.rolls[2].card.should.eql(ReiCopes);
        move.rolls[2].player.should.eql(player2);
    },
    "The next roll must be higher than the higest roll from the other team (when possible)" : function(){
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
        move = setUp();
        should.throws(function(){
            move.addRoll(player3,player3.cards[1]);
        },Error,"Invalid movement");
        should.throws(function(){
            move.addRoll(player3,player3.cards[2]);
        },Error,"Invalid movement");
        should.throws(function(){
            move.addRoll(player3,player3.cards[3]);
        },Error,"Invalid movement");
        should.doesNotThrow(function(){
            move.addRoll(player3,player3.cards[4]);
        },Error,"Invalid movement");
        move = setUp();
        should.doesNotThrow(function(){
            move.addRoll(player3,player3.cards[5]);
        },Error,"Invalid movement");
        move = setUp();
        should.doesNotThrow(function(){
            move.addRoll(player3,player3.cards[6]);
        },Error,"Invalid movement");
    },
    "We must be able to know the value of the move and the team that wons" : function(){
        move.should.respondTo('getValue');
        move.should.respondTo('getWinner');
        var move0 = Move.create('Copes');
        player1.cards=[Card.create(2,'Espases')];
        player2.cards=[Card.create(3,'Espases')];
        player3.cards=[Card.create(4,'Espases')];
        player4.cards=[Card.create(5,'Espases')];
        move0.addRoll(player1,player1.cards[0]);
        move0.addRoll(player2,player2.cards[0]);
        move0.addRoll(player3,player3.cards[0]);
        move0.addRoll(player4,player4.cards[0]);
        move0.getWinner().should.eql(player4);
        move0.getValue().should.eql(1);
        var move1 = Move.create('Copes');
        player1.cards=[Card.create(11,'Espases')];
        player2.cards=[Card.create(12,'Espases')];
        player3.cards=[Card.create(1,'Espases')];
        player4.cards=[Card.create(9,'Espases')];
        move1.addRoll(player1,player1.cards[0]);
        move1.addRoll(player2,player2.cards[0]);
        move1.addRoll(player3,player3.cards[0]);
        move1.addRoll(player4,player4.cards[0]);
        move1.getWinner().should.eql(player4);
        move1.getValue().should.eql(15);
        var move2 = Move.create('Copes');
        player1.cards=[Card.create(2,'Espases')];
        player2.cards=[Card.create(11,'Espases')];
        player3.cards=[Card.create(8,'Espases')];
        player4.cards=[Card.create(5,'Espases')];
        move2.addRoll(player1,player1.cards[0]);
        move2.addRoll(player2,player2.cards[0]);
        move2.addRoll(player3,player3.cards[0]);
        move2.addRoll(player4,player4.cards[0]);
        move2.getWinner().should.eql(player2);
        move2.getValue().should.eql(3);
    },
    "A player can only play a card that he/she has in the stack" : function(){
        move0=Move.create('Copes');
        should.throws(function(){
            move.addRoll(player1,Card.create(2,'Espases'));
        },Error,"Invalid movement");
    },
    "After the player has played a card it gets removed for him/her stack" : function(){
        move0=Move.create('Copes');
        player1.cards=[Card.create(2,'Espases')];
        should.doesNotThrow(function(){
            move0.addRoll(player1,player1.cards[0]);
        },Error,"Invalid movement");
        player1.cards.length.should.eql(0);
    }
    
}   
