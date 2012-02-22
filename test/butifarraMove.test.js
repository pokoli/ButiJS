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
        var dones=12;
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
    },
    "A player can only play a card that he/she has in the stack" : function(done){
        move0=Move.create('Copes');
        move0.addRoll(player1,Card.create(2,'Espases'),function(err){
            should.exist(err);
            err.should.eql(Error("You can not play a card you don't have in the stack"));
            done();
        });
    },
    "After the player has played a card it gets removed for him/her stack" : function(done){
        move0=Move.create('Copes');
        player1.cards=[Card.create(2,'Espases')];
        move0.addRoll(player1,player1.cards[0],function(err){
            should.ifError(err);
            player1.cards.length.should.eql(0);
            done();
        });
    }
    
}   
