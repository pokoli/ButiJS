var Card = function(number,suit){
	this.number=number;
	this.suit=suit;

};

Card.prototype.toString = function()
{
	return "[object Card <" + this.number + "-"+this.suit+">]";
}

module.exports.create = function(number,suit) {
	return new Card(number,suit);
};
