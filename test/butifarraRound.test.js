var Round = require('../src/butifarraRound'),
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

teams = eval({
    "1": [player1,player2],
    "2": [player3,player4]
})

round = Round.create(teams,player1,player2);

module.exports = {
    "Butifarra Round consits of and array moves " : function() {
        round.should.have.property('moves');
        round.moves.should.be.instanceof(Array);
    },
}   
