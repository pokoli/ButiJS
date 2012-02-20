var Card = function(number,suit){
	this.number=number;
	this.suit=suit;

};

Card.prototype.isHigher = function(otherCard)
{
    if(otherCard.suit!=this.suit)
        return;
        
    var value = this.number;
    var otherValue = otherCard.number;    
    //1 and 9 ar higher than the other numbers, so make its
    if(this.number === 1 || this.number === 9)    
        value = value*100;
    if(otherCard.number === 1 || otherCard.number === 9)    
        otherValue = otherValue*100; 
        
    return value > otherValue;   
}

Card.prototype.toString = function()
{
	return "[object Card <" + this.number + "-"+this.suit+">]";
}

module.exports.create = function(number,suit) {
	return new Card(number,suit);
};
