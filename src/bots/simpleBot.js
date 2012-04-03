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
    Sorts the cards based on the follwing order:
     - Per suit: Oros > Copes > Espases -> Bastos
     - Per Number: 9 > 1 > 12 > 11 > 10 > ... > 2
*/
function sortCards(unsorted)
{
    function cardSort(a,b)
    {
        return (cardWeight(a)-cardWeight(b))*-1
    }
    return unsorted.sort(cardSort);
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
    //Trumfo directe no contrem mai.
    if(thriumph && thriumph.indexOf('(') < 0)
        return false;
    thriumph = thriumph.substring(0,thriumph.indexOf('(')-1);
    var pals = calculateSuits(this.cards());
    var numbers = calculateNumbers(this.cards());
    //Trumfo passat dos manilles i un as s'ha de contrar. 
    if(numbers[9] && numbers[9] >=2 && numbers[1] && numbers[1] >= 1)
        return true;
    if(pals[thriumph] && pals[thriumph] >=5)
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
        //If we have more than one higher card -> Roll more than one. 
        if(higherCards.length > 0 )
        {
            higherCards = sortCards(higherCards);
            return higherCards[0];
        }
        /*
            TODO: Depending on the winner we have to choise diferent cards:
                - If the winner is from our team -> higher
                - If the winner is from other team -> lower.
         */
        if(suitCard.length > 0 )
        {
            suitCard = sortCards(suitCard);
            return suitCard[0];
        }
        else if (thriumphCard.length > 0)
        {
            thriumphCard = sortCards(thriumphCard);
            return thriumphCard[0];
        }
        else
        {
            return cards[cards.length-1]; //Any card is well played -> The last because all are ordered.
        }
    }
    else if (playedCards.length ===0)
    {
        //Si tenim un semifallo jugarem aquell pal.
        if(min[1] ===1)
        {
            for(var i=0;i<cards.length;i++)
            {
                if(cards[i].suit===min[0])
                {
                    return cards[i];
                }
            }
        }
        //TODO: Add more cases here.
        //TODO: Implement better generic case
        return cards[0];
    }
    else
    {
        //TODO: Implement better generic case
        return cards[0];
    }
}

module.exports.Bot = SimpleBot;
