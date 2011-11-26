var Card = require('../src/card'),
	should = require ('should');

module.exports = {
    " A card has number and a suit" : function() {
		var card = Card.create(1,'Espases');
		card.should.have.property('number');
		card.should.have.property('suit');
		card.number.should.eql(1);
		card.suit.should.eql('Espases');
	},
	" We must override toString" : function() {
		var card = Card.create(1,'Espases');
		card.should.respondTo('toString');
		card.toString().should.eql('[object Card <1-Espases>]');
	}
};
