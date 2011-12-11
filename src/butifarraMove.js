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

var ButifarraMove = function(thriumph) {
    _rolls=[]; //Private variable
    this.rolls = _rolls; //Expose it to the public;
    
    /*
        Validate the roll.
        The callback gets the error. 
    */
    function validateRoll(roll,rolls,callback)
    {
        if(rolls.length==0)
        {
            if(callback) callback();
            return;
        }
        //Maximum 4 rolls per movement (1 forEach player)   
        if(rolls.length==4)
        {
            if(callback) callback(new Error('Only 4 rolls allowed'));
            return;
        }     
        //The card must be higher than the other team higher.
        var otherTeam = roll.player.team== 1 ? 2 : 1;
        var higherCard; //Hols the other team higer's card in the Move.
        //A player can not roll twice in the same move.
        //A card can not be rolled twice in the same move.
        for(i in rolls){
            var move = rolls[i];
            if(move.player==roll.player)
            { 
                if(callback) callback(new Error('A player can roll only once'));
                return;
            }
            if(move.card.suit==roll.card.suit && move.card.number==roll.card.number ) 
            {
                if(callback) callback(new Error('A card can be rolled only once'));
                return;
            }
            if(move.player.team==otherTeam)
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
            for(i in roll.player.cards)
            {
                var card = roll.player.cards[i];
                //If the players has cards from the init suit, must roll it.
                if(card.suit==initSuit)
                {
                    if(callback) callback(new Error('Card must be from initial suit'));
                    return;
                }
                if(card.suit==thriumph)
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
                for(i in roll.player.cards)
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
        var roll = new ButifarraRoll(player,card);
        validateRoll(roll,this.rolls,function(err){
            if(err) throw new Error('Invalid Movement');
            _rolls.push(roll);
        });

    }
    
};

module.exports.create = function(thriumph) {
    return new ButifarraMove(thriumph);
};

