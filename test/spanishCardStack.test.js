var Stack = process.env.COVERAGE ? require('../src-cov/spanishCardStack') : require('../src/spanishCardStack'),
	Card = process.env.COVERAGE ? require('../src-cov/card') : require('../src/card'),
	should = require ('should');

var stack;

module.exports = {
    " An spanish card stack has 48 cards" : function() {
		stack = Stack.create();
		stack.size.should.eql(48);
	},
	" We should be able to shuffle the card stack" : function(){
		stack.should.respondTo('shuffle');
		var before = stack.toString();
		stack.shuffle();
		stack.toString().should.not.eql(before);
	},
	" We should override the toString function " : function(){
		stack.toString().should.not.eql('[object Object]');
	},
	" We should get one or more cards from the stack" : function() {
		stack.should.respondTo('next');
		var card = stack.next();
		card.should.have.property('number');
		card.should.have.property('suit');
		var next = stack.next(4);
		next.should.be.an.instanceof(Array);
		next.forEach(function(card){
			card.should.have.property('number');
			card.should.have.property('suit');
		});
	},
	" We should know the remainig cards from the stack" : function() {
		stack.should.respondTo('left');
		stack.left().should.eql(43);
		stack.next(10);
		stack.left().should.eql(33);
	},
	" We should be able to reset the stack " : function() { 
		stack.should.respondTo('reset');
		stack.reset();
		stack.left().should.eql(48);
	}
	

};
