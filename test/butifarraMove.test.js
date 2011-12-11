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
        CavallEspases = Card.create(11,'Espases');
        should.doesNotThrow(function(){
            move.addRoll(player1,CavallEspases);
        },Error,"Invalid movement");
        move.rolls.length.should.eql(1);
        move.rolls[0].card.should.eql(CavallEspases);
        move.rolls[0].player.should.eql(player1);   
    },
    "A player can't roll twice in the same move " : function(){
        should.throws(function(){
            move.addRoll(player1,Card.create(11,'Espases'));
        },Error,"Invalid movement");
    },
    "A card can't be rolled twice in the same move " : function(){
        should.throws(function(){
            move.addRoll(player2,Card.create(11,'Espases'));
        },Error,"Invalid movement");
    },
    "The next rolls should be from the same suit or thriumph (if doesn't have thriumph)" : function(){
        player3.cards=[Card.create(2,'Copes')];
        should.throws(function(){
            move.addRoll(player3,Card.create(11,'Oros'));
        },Error,"Invalid movement"); 
        should.throws(function(){
            move.addRoll(player3,Card.create(11,'Bastos'));
        },Error,"Invalid movement"); 
        ReiEspases = Card.create(12,'Espases');
        should.doesNotThrow(function(){
            move.addRoll(player3,ReiEspases);
        },Error,"Invalid movement");
        move.rolls.length.should.eql(2);
        move.rolls[1].card.should.eql(ReiEspases);
        move.rolls[1].player.should.eql(player3);
        ReiCopes = Card.create(12,'Copes');
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
            move.addRoll(player1,Card.create(5,'Espases'));
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
        move0.addRoll(player1,Card.create(2,'Espases'));
        move0.addRoll(player2,Card.create(3,'Espases'));
        move0.addRoll(player3,Card.create(4,'Espases'));
        move0.addRoll(player4,Card.create(5,'Espases'));
        move0.getWinner().should.eql(player4.team);
        move0.getValue().should.eql(1);
        var move1 = Move.create('Copes');
        move1.addRoll(player1,Card.create(11,'Espases'));
        move1.addRoll(player2,Card.create(12,'Espases'));
        move1.addRoll(player3,Card.create(1,'Espases'));
        move1.addRoll(player4,Card.create(9,'Espases'));
        move1.getWinner().should.eql(player4.team);
        move1.getValue().should.eql(15);
        //TODO: Review it
//        var move2 = Move.create('Copes');
//        console.log(2);
//        move2.addRoll(player1,Card.create(2,'Espases'));
//        console.log(11);
//        move2.addRoll(player2,Card.create(11,'Espases'));
//        console.log(8);
//        move2.addRoll(player3,Card.create(8,'Espases'));
//        console.log(5);
//        move2.addRoll(player4,Card.create(5,'Espases'));
//        move2.getWinner().should.eql(player2.team);
//        move2.getValue().should.eql(3);
        
    }
    //TODO: Write more test cases. Is very important that those functions work properly.
}   
