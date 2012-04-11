var client = require('socket.io-client'), 
    Move = require('../butifarraMove'),
    Card = require('../card');

/*
    Generic code for all the bots.
*/

var Bot = function(){
    var socket;
    var _connected;
    var _cards;
    var _thriumph;
    var _delegated;
    var _move=[];
    var _playedCards = [];
    var _name;
    var _teams;
    var _team;

    this.connected = function() { return _connected; };
    this.name = function(){ return _name;};
    this.cards = function(){ return _cards;};
    this.thriumph = function(){ return _thriumph;};
    this.delegated = function(){ return _delegated;};
    this.move = function(){ return _move;};
    this.playedCards = function(){ return _playedCards;};
    this.teams = function(){ return _teams; };
    this.team = function(){ return _team; };

    var that = this;
    /*
        Connect to a ButiJS server:
        Accepts a parameter for specifing server options: 
            - Host: Host running the butiJS server
            - Port: Port where the butiJS server is listening.
            - Game: Id of the game to join after connecting
    */
    this.connect = function(opts,callback){
        opts = opts || {}
        var host = opts.host || 'localhost';
        var port = opts.port || 8000;
        var gameid = opts.game;
        socket = client.connect('http://'+host, {'port' : port,'force new connection': true});
        socket.on('welcome',function(){
            _name = 'Bot'+new Date().getTime().toString().substring(6,250);
            socket.emit('login',{'name' : _name}, function(){
                if(gameid)
                {
                    socket.emit('join-game',gameid,callback);
                    return;
                }
                if(callback) callback();
            });
            _connected=true;
        });

        socket.on('start',function(data){ 
            _teams = data.teams
            for(var i=1;i<3;i++)
            {
                for(var j=0;j<_teams[i].length;j++)
                {
                    if(_teams[i][j].name===_name)
                    {
                        _team=i;
                        break;
                    }
                }
            }
        });
        socket.on('cards',function(data){_cards = data;});
        socket.on('notify-thriumph', function (data){
            _delegated=false;
            _thriumph = data;
            if(data.indexOf('(') >= 0)
            {
                _thriumph = data.substring(0,data.indexOf('(')-1);
                _delegated=true;
            }
        });
        socket.on('select-thriumph', function (choises){
            process.nextTick(function(){
                socket.emit('chosen-thriumph',that.selectThriumph(choises));
            });
        });
        socket.on('play-card',function(){
            console.log(_name+' have to play a card');
            function playCard(){
               var card = that.selectCard();
               socket.emit('new-roll',card,function(err){
                    console.log(err);
                    if(err)
                    {
                        process.nextTick(playCard);
                        return;
                    }
                    _cards.forEach(function(cardInStack,idx){
          			    if(cardInStack.suit === card.suit && cardInStack.number === card.number)
              			{
          					_cards.splice(idx,1);
              			}
      		        });
                    
                });
            }
            process.nextTick(playCard);
        });
        socket.on('contro',function(){
            process.nextTick(function(){
                socket.emit('do-contro',{ 'value' : that.contro() });
            });
        });

        socket.on('card-played',function(data){
            _playedCards.push(data.card);
            if(_move.length===4)
                _move=[];
            _move.push(data);
        });
        socket.on('end-move',function(data){
            _move = [];
        });
        //TODO:Save contros???????
        //socket.on('contro-done',function(data){
    }

    this.join = function(game){
        if(!_connected)
        {
            return false;
        }
        socket.emit('join-game',game);
        return true;
    }

    this.disconnect = function(){
        socket.disconnect();
    }
}

/*
    Selects a thriumph from available choises.
    Could be overriden by extending classes.
*/
Bot.prototype.selectThriumph = function(choises){
    //Dummy version return first choise.
    return choises[0];
}

/*
    Selects if the bot have to make a contro.
    Could be overriden by extending classes.
*/
Bot.prototype.contro = function(){
    //Dummy version return always false
    return false;
}

/*
    Selects a card to play
    Could be overriden by extending classes.
*/
Bot.prototype.selectCard = function(err){
    var move = this.move();
    var cards = this.cards();
    var thriumph = this.thriumph();
    if(move.length > 0)
    {
        var higher=Move.getHigherCard(move,thriumph);
        var suitCard;
        var thriumphCard;
        var initCard = Card.create(move[0].card.number,move[0].card.suit);
        for(var i=0;i<cards.length;i++)
        {
            var card = Card.create(cards[i].number,cards[i].suit);
            if(card.suit===initCard.suit)
            {
                if(card.isHigher(higher))
                {
                    return cards[i];
                }
                suitCard=card;
            }
            if(card.suit===thriumph)
                thriumphCard=card;
        }
        //If no higher card we have to play a card from the suit
        if(suitCard)
        {
            return suitCard;
        }
        else if (thriumphCard)
        {
            return thriumphCard;
        }
        else
        {
            return cards[0]; //Any card is well played
        }
    }
    else
    {
        return cards[0];
    }
}

module.exports.Bot = Bot;


