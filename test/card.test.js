var Card = require('../src/card'),
	should = require ('should');

var card = Card.create(8,'Espases');

module.exports = {
    " A card has number and a suit" : function() {
		card.should.have.property('number');
		card.should.have.property('suit');
		card.number.should.eql(8);
		card.suit.should.eql('Espases');
	},
	" We must override toString" : function() {
		card.should.respondTo('toString');
		card.toString().should.eql('[object Card <8-Espases>]');
	}, 
	" A card should be able to deterimine if another card is higher (only same suit)" : function()
	{
	    card.should.respondTo('isHigher');
	    card.isHigher(Card.create(2,'Espases')).should.eql(true);
	    card.isHigher(Card.create(3,'Espases')).should.eql(true);
	    card.isHigher(Card.create(4,'Espases')).should.eql(true);
	    card.isHigher(Card.create(5,'Espases')).should.eql(true);
	    card.isHigher(Card.create(6,'Espases')).should.eql(true);
	    card.isHigher(Card.create(7,'Espases')).should.eql(true);
	    card.isHigher(Card.create(8,'Espases')).should.eql(false);
	    card.isHigher(Card.create(10,'Espases')).should.eql(false);
	    card.isHigher(Card.create(11,'Espases')).should.eql(false);
        card.isHigher(Card.create(12,'Espases')).should.eql(false);
	    card.isHigher(Card.create(1,'Espases')).should.eql(false);
	    card.isHigher(Card.create(9,'Espases')).should.eql(false);
	    //Random test cases
        Card.create(2,'Espases').isHigher(Card.create(11,'Espases')).should.eql(false);    
        Card.create(11,'Espases').isHigher(Card.create(2,'Espases')).should.eql(true);
        Card.create(6,'Espases').isHigher(Card.create(12,'Espases')).should.eql(false);
        Card.create(12,'Espases').isHigher(Card.create(6,'Espases')).should.eql(true);
	},
	" Is not defined if a card is higher than another card of another suit " : function(){
        should.not.exist(card.isHigher(Card.create(1,'Copes')));
	}
};
