var Card = require('./card');

var SpanishCardStack = function(){

	var cards;
	var _suits = ['Oros','Copes','Espases','Bastos'];
	this.suits=_suits;
    var _numbers = [1,2,3,4,5,6,7,8,9,10,11,12];
    this.numbers=_numbers;
    
	
	this.reset = function(){
		cards=new Array();
		_suits.forEach(function(suit){
			_numbers.forEach(function(i){
				cards.push(Card.create(i,suit));	
			});
		});
	};
	
	this.reset();
		
	this.size = cards.length;
	
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
	
	/* This method shuffles the card array implementing the Knuth Fisher Yates algorithm
		Author: Jonas Raoni Soares Silva
		From: http://jsfromhell.com/array/shuffle [rev. #1]
	*/
	 function fischer_yates_shuffle(v){
		for(var j, x, i = v.length; i; j = parseInt(Math.random() * i), x = v[--i], v[i] = v[j], v[j] = x);
		return v;
	};
	/*
		This is the public function to shuflle the card Stack.
		It shuffles it 12 times to get a better shuffled Stack.
		It pretends to emulate the normal behavior of the game, when the player
		shuflles the card stack a random number of times.
	*/
	this.shuffle = function(ntimes){
		this.reset();
		ntimes = ntimes || 12;
		for(i=0;i<ntimes;i++)
			//_shuffle();
			fischer_yates_shuffle(cards);	
	}
	
	this._toString = function(){
		var string =  '[object SpanishCardStack <';
		cards.forEach(function(card){
			string+=card.toString()+',';
		});
		string += '>';
		return string;
	}
	
	this.next = function(num){
		if(!num || num <=1)
			return cards.shift();
		temp = new Array();
		for(i=0;i<num && cards.length >0;i++)
			temp.push(cards.shift());
		return temp;	
	}
	
	this.left = function(){
		return cards.length;
	}

};

SpanishCardStack.prototype.toString = function()
{
	return this._toString();
}

module.exports.create = function() {
	return new SpanishCardStack();
};
