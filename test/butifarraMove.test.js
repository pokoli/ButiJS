var Move = require('../src/butifarraMove'),
	Player = require('../src/player'),	
	should = require ('should');

var player1 = Player.create('John');
player1.team=1;
var player2 = Player.create('Mark');
player2.team=1;
var player3 = Player.create('Steve');
player3.team=2;
var player4 = Player.create('Bill');
player3.team=2;

var move = Move.create();

module.exports = {
    "Butifarra Move is an array of moves" : function() {
        move.should.have.property('moves');
        move.moves.should.be.instanceof(Array);
    },
    "A player can add its roll to the Move " : function() {
        move.should.respondTo('addRoll');
    }
}   
