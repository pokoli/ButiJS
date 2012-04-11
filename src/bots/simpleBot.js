var util = require('util'),
    Card = require('../card'),
    Move = require('../butifarraMove'),
    Bot = require('./bot').Bot;

var SimpleBot = function()
{
    Bot.call(this);
}

//Inherits from game
util.inherits(SimpleBot,Bot);

/*
    Returns a dict with the number of cards we have forEach Suit.
*/
function calculateSuits(cards)
{
    var pals = {};
    for(var i=0;i<cards.length;i++)
    {
        if(pals[cards[i].suit])
        {
            pals[cards[i].suit]+=1;        
        }
        else
            pals[cards[i].suit]=1;
    }
    return pals;
}

/*
    Returns a dict with the number of cards we have forEach number.
*/
function calculateNumbers(cards)
{
    var pals = {};
    for(var i=0;i<cards.length;i++)
    {
        if(pals[cards[i].number])
        {
            pals[cards[i].number]+=1;        
        }
        else
            pals[cards[i].number]=1;
    }
    return pals;
}

/*
    Calculates the weight of a card in the order of the player card
    Based on the following relations:
    Suit: Oros > Copes > Espases -> Bastos
    Number: 9 > 1 > 12 > 11 > 10 > ... > 2
*/
function cardWeight(card)
{
    var score=0;
    if(card.suit==='Oros')
        score+=300;
    else if(card.suit==='Copes')
        score+=200;
    else if(card.suit==='Espases')
        score+=100;
    if(card.number===9 || card.number===1)
        score+=13;
    score+=card.number;
    return score;
}

/*
    Calculates the weight of a card in the order of the player card
    Based on the following relations:
    Suit: Oros > Copes > Espases -> Bastos
    Number: 9 > 1 > 12 > 11 > 10 > ... > 2
*/
function cardWeightNotSuit(card)
{
    var score=0;
    if(card.number===9 || card.number===1)
        score+=13;
    score+=card.number;
    return score;
}

/*
    Sorts the cards based on the follwing order:
     - Per suit: Oros > Copes > Espases -> Bastos
     - Per Number: 9 > 1 > 12 > 11 > 10 > ... > 2
    If notTriumph is true the Suit is not taken into account.
*/
function sortCards(unsorted,notSuit)
{
    function cardSort(a,b)
    {
        return (cardWeight(a)-cardWeight(b))*-1
    }
    function cardSortNotSuit(a,b)
    {
        return (cardWeightNotSuit(a)-cardWeightNotSuit(b))*-1
    }
    if(!notSuit)
        return unsorted.sort(cardSort);
    else
        return unsorted.sort(cardSortNotSuit);
}

/*
    Calculates the minimum and maximum number of cards per suit. 
*/
function calculateMinMaxPerSuit(pals)
{
    var max = [];
    var min = [];
    for(var pal in pals)
    {
        if(max.length === 0)
        {
            max=[pal,pals[pal]];
        }
        else if( pals[pal] > max[1] )
        {
            max=[pal,pals[pal]];
        }
        
        if(min.length === 0)
        {
            min=[pal,pals[pal]];
        }
        else if( pals[pal] < min[1] )
        {
            min=[pal,pals[pal]];
        }
    }
    return {'max': max, 'min' : min};
}

/*
    Returns true if all the cards are in playedCards, false if not.
*/
function hasBeenPlayed(playedCards,cards)
{
    try{
        if(!cards.length)
            cards = [cards];
        for(var i=0;i<cards.length;i++)
            cards[i] = Card.create(cards[i].number,cards[i].suit);
        for(var i=0;i<playedCards.length;i++)
        {
            var card = Card.create(playedCards[i].number,playedCards[i].suit);
            var idx = -1;
            for(var j=0;j<cards.length;j++)
            {
                if(card.number===cards[j].number && card.suit===cards[j].suit)
                {
                    idx=j;
                    break;
                }
            }
            if(idx >= 0 )
            {
                cards.splice(idx,1);
            }
        }
        return cards.length===0;
    }
    catch(e){ console.log(e);return false }
}

/*
    Selects a thriumph from available choises.
*/
SimpleBot.prototype.selectThriumph = function(choises){
    var cards = this.cards();
    //If we have more than 22 points in the stack we make botifarra.
    if(Move.calculatePoints(cards) > 22)
        return 'Botifarra';
    var pals = calculateSuits(cards);
    var temp= calculateMinMaxPerSuit(pals);
    var max=temp.max, min=temp.min;
    var allPals = pals['Oros'] && pals['Copes'] && pals['Espases'] && pals['Bastos']; 
    if( (max[1] >= 5 && (!allPals || min[1] === 1) ) || choises.indexOf('Delegar') < 0)
    {
        return max[0];
    }
    else 
    {
        return 'Delegar';
    }
}

/*
    Select contro.
*/

Bot.prototype.contro = function(){
    var thriumph = this.thriumph();
    var delegated = this.delegated();
    //Trumfo directe no contrem mai.
    if(!delegated)
        return false;
    var pals = calculateSuits(this.cards());
    var numbers = calculateNumbers(this.cards());
    //Trumfo passat dos manilles i un as s'ha de contrar. 
    if(numbers[9] && numbers[9] >=2 && numbers[1] && numbers[1] >= 1)
        return true;
    if(pals[thriumph] && pals[thriumph] >=5)
        return true;
    //If we have more than 22 points in the stack we have to make a contro
    if(Move.calculatePoints(this.cards()) > 22)
        return true;
    return false;    
}

/*
    Selects a card to play
*/
Bot.prototype.selectCard = function(err){
    var playedCards = this.playedCards();
    var move = this.move();
    var cards = sortCards(this.cards());
    var thriumph = this.thriumph();
    var pals = calculateSuits(cards);
    var numbers = calculateNumbers(cards);
    var temp= calculateMinMaxPerSuit(pals);
    var max=temp.max, min=temp.min;
    if(move.length > 0)
    {
        var higher=Move.getHigherCard(move,thriumph);
        var higherCards = [];
        var suitCard = [];
        var thriumphCard = [];
        var initCard = Card.create(move[0].card.number,move[0].card.suit);
        for(var i=0;i<cards.length;i++)
        {
            var card = Card.create(cards[i].number,cards[i].suit);
            if(card.suit===initCard.suit)
            {
                if(card.isHigher(higher))
                {
                    higherCards.push(card);
                }
                suitCard.push(card);
            }
            if(card.suit===thriumph)
                thriumphCard.push(card);
        }
         var ourHand = false;
         if(Move.getWinner(move,thriumph).team === this.team())
         {
            ourHand=true;
         }

        if(higherCards.length > 0 )
        {
            //TODO: If we have higherCards, some time we have to play the higher.
            higherCards = sortCards(higherCards);
            var idx= ourHand ? 0 : higherCards.length -1;
            //If we are the last player we always play the lower card. (abarrotem)
            if(move.length===3)
                idx=higherCards.length -1;
            return higherCards[idx];
        }
        if(suitCard.length > 0 )
        {
            suitCard = sortCards(suitCard);
            var idx= ourHand ? 0 : suitCard.length -1;
            return suitCard[idx];
        }
        else if (thriumphCard.length > 0)
        {
            thriumphCard = sortCards(thriumphCard);
            var idx= ourHand ? 0 : thriumphCard.length -1;
            return thriumphCard[idx];
        }
        else
        {
            if(ourHand)
            {
                var tmp = sortCards(cards,true);
                //TODO: Test if its the higher tacking into account the played cards.
                for(var i=0;i<tmp.length;i++)
                {
                    //Never play a nine
                    if(tmp[i].number!==9)
                    {
                        return tmp[i];
                    }
                }
            }
            else
            {
                return sortCards(cards,true)[cards.length-1];
            }
        }
    }
    else
    {
        var playedPals = calculateSuits(playedCards);
        //Si tenim un semifallo jugarem aquell pal.
        if(min[1] ===1)
        {
            //If there are played cards thats not a correct semifallo.
            if(!playedPals[min[0]])
            {
                for(var i=0;i<cards.length;i++)
                {
                    if(cards[i].suit===min[0])
                    {
                        return cards[i];
                    }
                }
            }
        }
        //If the trhiumpher is from our team and we have thriumph
        if(this.thriumpherTeam() === this.team() && pals[thriumph])
        {
            //No thriumph played.
            //Or there are more players that have thriumph in her hand.
            var remaining = pals[thriumph]
            if(playedPals[thriumph])
                remaining += playedPals[thriumph];
            if(remaining < 12)
            {
                for(var i=0;i<cards.length;i++)
                {
                    if(cards[i].suit===thriumph)
                    {
                        return cards[i];
                    }
                }
            }
        }
        //Si tenim un as jugarem aquell pal
        if(numbers[1] && numbers[1] > 1 )
        {
            for(var i=0;i<cards.length;i++)
            {
                if(cards[i].number===1)
                {
                    //If the 9 has been played we play the one because there is no higher card.
                    if(hasBeenPlayed(playedCards,Card.create(9,cards[i].suit)))
                        return cards[i];
                    if(pals[cards[i].suit] > 1 && cards[i].suit!== thriumph)
                    {
                       var suitCards = [];
                       for(var j=0;j<cards.length;j++)
                       {
                            if(cards[j].suit == cards[i].suit && cards[j].number !== 1)
                            {
                                suitCards.push(cards[j]);
                            }
                       }
                       return sortCards(suitCards)[0]; //We play the higher before the AS 
                    }
                }   
            }
        }
        debugger;
        var j=1;
        var numbersArray=[];
        for(var i in numbers)
        {
            numbersArray.push(i);
        }
        //Play the highest cards that is not thriumph.
        while(j<cards.length)
        {
            var highest = numbersArray[numbersArray.length-j];
            for(var i=0;i<cards.length;i++)
            {
                //highest is a String so we avoid comparing type also (===)
                if(cards[i].number==highest  && cards[i].suit != thriumph)
                {
                    return cards[i];
                }   
            }
            j++;
        }
        return cards[0];
        
    }
}

module.exports.Bot = SimpleBot;
