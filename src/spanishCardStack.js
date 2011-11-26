var Card = require('./card');

var SpanishCardStack = function(){

	var cards=new Array();
	['Oros','Copes','Espases','Bastos'].forEach(function(suit){
		for(i=1;i<=12;i++)
			cards.push(Card.create(i,suit));
	});
	
	this.size = function(){
		return cards.length;
	}
	
	/*This method shuffles the card array*/
	function _shuffle(){
		var temp = new Array();
		for(i=0;i<cards.length;i++)
		{
			var randomNumber = Math.floor(Math.random()*cards.length);
			temp.push(cards.splice(randomNumber,1));
		}
		cards = temp;
	}
	
	/*
		This is the public function to shuflle the card Stack.
		It shuffles it 12 times to get a better shuffled Stack.
		It pretends to emulate the normal behavior of the game, when the player
		shuflles the card stack a random number of times.
	*/
	this.shuffle = function(ntimes){
		ntimes = ntimes || 12;
		console.log(ntimes);
		for(i=0;i<ntimes;i++)
			_shuffle();
	}
	
	this._toString = function(){
		var string =  '[object SpanishCardStack <';
		cards.forEach(function(card){
			string+=card.toString()+',';
		});
		string += '>';
		return string;
	}

};

SpanishCardStack.prototype.toString = function()
{
	return this._toString();
}

module.exports.create = function() {
	return new SpanishCardStack();
};
