/*
    Holds the information of each roll.
    A roll consits of a card and a player.   
*/
var ButifarraRoll = function(player,card) {
    this.player=player;
    this.card=card;    
};


/*  
    Holds the information of each Move. 
    A move consists of roll for each player. (Total 4 cards, one per player)
    It also checks if the move is correct.  
*/

var ButifarraMove = function() {
    this.moves = [];
    
    function validateRoll(roll)
    {
        if(this.moves==[])
            return true;
        //TODO: Implement all the logical stuff.
        
        return true;
    }
        
    /*
        Adds the movement for one player to the current move.
    */
    this.addRoll = function(player,card){
        if(this.moves.length==4)
            throw new Error('')
        roll = new ButifarraRoll(player,card);
        if(!validateRoll(roll))
            throw new Error('Invalid Movement');
        this.moves.push(roll);
    }
    
};

module.exports.create = function() {
    return new ButifarraMove();
};

