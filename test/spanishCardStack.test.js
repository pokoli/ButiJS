var Stack = require('../src/spanishCardStack'),
	should = require ('should');

module.exports = {
    " An spanish card stack has 48 cards" : function() {
		var stack = Stack.create();
		stack.size().should.eql(48);
	},
	" We should be able to shuffle the card stack" : function(){
		var stack = Stack.create();
		stack.should.respondTo('shuffle');
		var before = stack.toString();
		stack.shuffle();
		stack.toString().should.not.eql(before);
	},
	" We should override the toString function " : function(){
		var stack = Stack.create();
		stack.toString().should.not.eql('[object Object]');
	}

};
