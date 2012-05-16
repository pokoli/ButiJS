var client = require('socket.io-client'),
    util = require('util'), 
    event = require('events'),
    Move = require('../butifarraMove'),
    Player = require('../butifarraMove'),
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
    var _thriumpherTeam;

    this.getConnected = function() { return _connected; };
    this.getName = function(){ return _name;};
    this.getCards = function(){ return _cards || this.cards;};
    this.getThriumph = function(){ return _thriumph;};
    this.getDelegated = function(){ return _delegated;};
    this.getMove = function(){ return _move;};
    this.getPlayedCards = function(){ return _playedCards;};
    this.getTeams = function(){ return _teams; };
    this.getTeam = function(){ return _team; };
    this.getThriumpherTeam = function(){ return _thriumpherTeam; };

    var that = this;
    /*
        Assigns a current name to the bot. 
    */
    function assignName(){
        _name = 'Bot'+new Date().getTime().toString().substring(6,250);    
    }
    
    function assignEvents(socket,gameid,callback){
        socket.on('welcome',function(){
            asssignName();
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
            _teams = data.teams;
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
            if(data.round && data.playedRounds[data.round-1])
            {
                _thriumpherTeam = data.playedRounds[data.round-1].thriumpher.team
            }
        });
        socket.on('updated-game',function(data){
            if(data.round && data.playedRounds[data.round-1])
            {
                _thriumpherTeam = data.playedRounds[data.round-1].thriumpher.team
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
            function playCard(validCard){
               var card = validCard || that.selectCard();
               socket.emit('new-roll',card,function(err,suggestions){
                    if(err)
                    {
                        console.log('Invalid bot movement: '+err);
                        console.log('Suggestions: '+suggestions);
                        if(suggestions)
                        {
                            //If it's an invalid card play the first suggested cards
                            process.nextTick(function(){ playCard(suggestions[0]);});
                        }
                        else
                        {
                            process.nextTick(playCard);
                        }
                        return;
                    }
                    for(var idx=0;idx<_cards.length;idx++)
                    {
                        cardInStack=_cards[idx];
          			    if(cardInStack.suit === card.suit && cardInStack.number === card.number)
              			{
          					_cards.splice(idx,1);
              			}
                    }
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
        socket.on('round-ended',function(data){
            _playedCards=[];
        });
    }

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
        if(opts.url)
        {
            if(opts.url.indexOf(':')>-1)
            {
                opts.host=opts.url.substring(0,opts.url.indexOf(':'));
                opts.port=opts.url.substring(opts.url.indexOf(':')+1,opts.url.length);
            }
            else
                opts.host=opts.url;
        }
        var host = opts.host || 'localhost';
        var port = opts.port || process.env.PORT || 8000;
        socket = client.connect('http://'+host, {'port' : port,'force new connection': true});
        assignEvents(socket,opts.game,callback);
    }
    /*
        TODO: The following two functions are copied from Player, avoid copying and include it ;)
    */
    /*
        Used to notify the bot with events!!!
    */
	this.notify = function (type,data,fn){
	    if(socket)
	    {
	        if(fn && data)
	        {
    	        socket.emit(type,data,fn);
    	    }
	        else if(data)
	        {
    	        socket.emit(type,data);
    	    }
    	    else
    	    {
    	        socket.emit(type);
    	    }
	    }
	    else
	    {
	        if(fn && data)
	        {
    	        this.emit(type,data,fn);
    	    }
	        else if(data)
	        {
    	        this.emit(type,data);
    	    }
    	    else
    	    {
    	        this.emit(type);
    	    }
	    }
	}
	/*
	    Used to compare bots with players
	*/
	this.isEqual = function(otherPlayer){
	    var bret=false;
	    if(this.id && otherPlayer.id)
	        return this.id === otherPlayer.id
	    else
	    {
	        if(this.id || otherPlayer.id)
	            return false;
	        if(this.name && otherPlayer.name)
    	      bret = this.name === otherPlayer.name;
    	    else if(this.name || otherPlayer.name)
    	        return false;
	        if(bret && this.email && otherPlayer.email)
    	      bret = this.email === otherPlayer.email;
            else if(this.email || otherPlayer.email)
    	        return false;
	    }
	    return bret;
	}

    this.createPlayer = function(){
        assignEvents(this);
        assignName();
        this.name=_name;
        return this;
   };

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
//Inherits from EventEmitter so we can manage the events of the game.
util.inherits(Bot, event.EventEmitter);
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
    var move = this.getMove();
    var cards = this.getCards();
    var thriumph = this.getThriumph();
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


