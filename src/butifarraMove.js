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
    this.rolls = []; //Expose it to the public;
    
    /*
        Returns the team that wins the hand.
    */
    function getWinner(rolls){
        var higherCard,winner;
        for(var i=0;i<rolls.length;i++)
        {
            var player = rolls[i].player;
            var card = rolls[i].card;

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

    this.getWinner = function(){
        return getWinner(this.rolls);
    }

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
        var higherCardTeam;
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
            /*
                Searching for the ohters Team higherCard. There scenarios are possible:
                    1. No higherCard is defined, so any otherTeam's card is the higherCard
                    2. The card is from the same suit, we must check if the card's number is higher.
                    3. The card if from diferent suit and its a trhiumph card. So it's the highest card  
            */
            if(!higherCard || //1.
                 move.card.suit === higherCard.suit && move.card.isHigher(higherCard) || //2.
                ( move.card.suit !== higherCard.suit && move.card.suit===thriumph && higherCard.suit) //3. 
              )
            {
                higherCard=move.card;
                higherCardTeam=move.player.team;
            }
        }

        //The move must be from the same suit,
        var initSuit = rolls[0].card.suit;
        if(roll.card.suit!=initSuit)
        {
            var hasTriumph=false;
            var higherThriumph;
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
                {
                    hasTriumph=true;
                    if(!higherThriumph)
                        higherThriumph=card;
                    else if(card.isHigher(higherThriumph))
                        higherThriumph=card;
                }
            }
            if(hasTriumph && higherCardTeam!==roll.player.team && roll.card.suit!=thriumph &&
                (higherCard.suit!== thriumph || higherCard.isHigher(higherThriumph)===false))
            {
                if(callback) callback(new Error('Card must be from thriumph suit'));
                return;
            }
        }
        //If there is an openent's higher card. 
        if(higherCard && getWinner(rolls).team!==roll.player.team)
        {   
            if(roll.card.suit===higherCard.suit && !roll.card.isHigher(higherCard))
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
    this.addRoll = function(player,card,callback){
        if(!card || !card.number || !card.suit)
        {
            callback && callback(Error('Card must be defined'));
            return
        }
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
        {
            callback(Error("You can not play a card you don't have in the stack"));
            return;
        }
        var roll = new ButifarraRoll(player,card);
        var that = this;
        validateRoll(roll,this.rolls,function(err){
            if(err) 
            {
                callback && callback(err);
                return;
            }
            that.rolls.push(roll);
            var idx = player.cards.indexOf(card); // Find the index
            if(idx!=-1) player.cards.splice(idx, 1);
            callback && callback();
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
};

module.exports.create = function(thriumph) {
    return new ButifarraMove(thriumph);
};

module.exports.calculatePoints = calculatePoints;

