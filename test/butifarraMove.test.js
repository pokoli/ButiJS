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
    "Butifarra Move is an array of moves" : function() {
        move.should.have.property('moves');
        move.moves.should.be.instanceof(Array);
    },
    "A player can add its roll to the Move " : function() {
        move.should.respondTo('addRoll');
    },
    "The first Roll of a move could be any card" : function(){
        CavallEspases = Card.create(11,'Espases');
        should.doesNotThrow(function(){
            move.addRoll(player1,CavallEspases);
        },Error,"Invalid movement");
        move.moves.length.should.eql(1);
        move.moves[0].card.should.eql(CavallEspases);
        move.moves[0].player.should.eql(player1);   
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
    "The next moves should be from the same suit or thriumph (if doesn't have thriumph)" : function(){
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
        move.moves.length.should.eql(2);
        move.moves[1].card.should.eql(ReiEspases);
        move.moves[1].player.should.eql(player3);
        ReiCopes = Card.create(12,'Copes');
        should.doesNotThrow(function(){
            move.addRoll(player2,ReiCopes);
        },Error,"Invalid movement");
        move.moves.length.should.eql(3);
        move.moves[2].card.should.eql(ReiCopes);
        move.moves[2].player.should.eql(player2);
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
    }
}   
