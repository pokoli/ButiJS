/*
    Holds the information of each roll.
    A roll consits of a card and a player.   
*/
var ButifarraRoll = function(player,card) {
    this.player=player;
    this.card=card;    
};

/*
    Calculates the points of a set of 4 cards
*/
function calculatePoints(cards){
    var points = 0;
    for(var i=0;i<cards.length;i++)
    {
        var card = cards[i];
        if(card.number===10) points++;
        if(card.number===11) points=points+2;
        if(card.number===12) points=points+3;
        if(card.number===1) points=points+4;
        if(card.number===9) points=points+5;
    }
    //Four cards are valued 1 point.
    return ++points;
}

/*  
    Holds the information of each Move. 
    A move consists of roll for each player. (Total 4 cards, one per player)
    It also checks if the move is correct.  
*/

var ButifarraMove = function(thriumph) {
    _rolls=[]; //Private variable
    this.rolls = _rolls; //Expose it to the public;
    
    /*
        Validate the roll.
        The callback gets the error. 
    */
    function validateRoll(roll,rolls,callback)
    {
        if(rolls.length===0)
        {
            if(callback) callback();
            return;
        }
        //Maximum 4 rolls per movement (1 forEach player)   
        if(rolls.length===4)
        {
            if(callback) callback(new Error('Only 4 rolls allowed'));
            return;
        }     
        //The card must be higher than the other team higher.
        var otherTeam = roll.player.team=== 1 ? 2 : 1;
        var higherCard; //Hols the other team higer's card in the Move.
        //A player can not roll twice in the same move.
        //A card can not be rolled twice in the same move.
        for(var i=0;i<rolls.length;i++){
            var move = rolls[i];
            if(move.player.isEqual(roll.player))
            { 
                if(callback) callback(new Error('A player can roll only once'));
                return;
            }
            if(move.card.suit===roll.card.suit && move.card.number===roll.card.number ) 
            {
                if(callback) callback(new Error('A card can be rolled only once'));
                return;
            }
            if(move.player.team===otherTeam)
            {
                if(!higherCard || move.card.isHigher(higherCard))
                    higherCard=move.card;
            }
        }

        //The move must be from the same suit,
        var initSuit = rolls[0].card.suit;
        if(roll.card.suit!=initSuit)
        {
            var hasTriumph=false;
            //Loop players cards to know if they have valid rolls or not.
            for(var i=0;i<roll.player.cards.length;i++)
            {
                var card = roll.player.cards[i];
                //If the players has cards from the init suit, must roll it.
                if(card.suit===initSuit)
                {
                    if(callback) callback(new Error('Card must be from initial suit'));
                    return;
                }
                if(card.suit===thriumph)
                    hasTriumph=true;
            }
            if(hasTriumph && roll.card.suit!=thriumph)
            {
                if(callback) callback(new Error('Card must be from thriumph suit'));
                return;
            }
        }
        //If there is an openent's higher card. 
        if(higherCard)
        {   
            if(!roll.card.isHigher(higherCard))
            {
                //Search if the player has an higher card.
                for(var i=0;i<roll.player.cards.length;i++)
                {
                    var card = roll.player.cards[i];
                    if(card.isHigher(higherCard))
                    {
                        if(callback) callback(new Error('Card must be higher than others team'));
                        return;
                    }
                }    
            }
        }
        if(callback) callback();
    }
        
    /*
        Adds the roll for one player to the current move.
    */
    this.addRoll = function(player,card){
        //Validate that the player has the card in the stack.
        var doesntHaveCard=true;
        for(var i=0;i<player.cards.length;i++)
        {
            if(player.cards[i].number ===card.number && 
                player.cards[i].suit ===card.suit)
            {
                doesntHaveCard=false;
                break;
            }
        }
        if(doesntHaveCard && !this.test) //If this.test is defined we are in a test case that needs this to be deactivated
            throw new Error("You can not play a card you don't have in the stack");
        var roll = new ButifarraRoll(player,card);
        validateRoll(roll,this.rolls,function(err){
            if(err) throw err;
            _rolls.push(roll);
            var idx = player.cards.indexOf(card); // Find the index
            if(idx!=-1) player.cards.splice(idx, 1);
        });

    }
    

    
    /*
        Returns the value of the current hand. 
    */
    this.getValue = function(){
        if(this.rolls.length!=4) return 0;
        var cards = [];
        for(var i=0;i<this.rolls.length;i++)
        {
            var card = this.rolls[i].card;
            cards.push(card);
        }
        return calculatePoints(cards);
    }
    
    /*
        Returns the team that wins the hand.
    */
    this.getWinner = function(){

        var higherCard,winner;
        for(var i=0;i<this.rolls.length;i++)
        {
            var player = this.rolls[i].player;
            var card = this.rolls[i].card;

            if(!higherCard)
            {
                higherCard=card;
                winner=player;
            }
            if(card.suit === thriumph && higherCard.suit!=thriumph)
            {
                higherCard=card;
                winner=player;
            }
            if(higherCard.suit===card.suit && card.isHigher(higherCard))
            {
                higherCard=card;
                winner=player;
            }
        }
        return winner;
    }
    
};

module.exports.create = function(thriumph) {
    return new ButifarraMove(thriumph);
};

module.exports.calculatePoints = calculatePoints;

