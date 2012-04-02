var client = require('socket.io-client');

/*
    Generic code for all the bots.
*/

var Bot = function(){
    var socket;
    var connected;
    var _cards;
    var _thriumph;
    var _move=[];
    var _playedCards = [];
    var _name;

    this.name = function(){ return _name;};
    this.cards = function(){ return _cards;};
    this.thriumph = function(){ return _thriumph;};
    this.move = function(){ return _move;};
    this.playedCards = function(){ return _playedCards;};

    var that = this;
    /*
        Connect to a ButiJS server:
        Accepts a parameter for specifing server options: 
            - Host: Host running the butiJS server
            - Port: Port where the butiJS server is listening.
    */
    this.connect = function(opts){
        opts = opts || {}
        var host = opts.host || 'localhost';
        var port = opts.port || 8000;
        socket = client.connect('http://'+host, {'port' : port,'force new connection': true});
        socket.on('welcome',function(){
            _name = 'Bot'+new Date().getTime().toString().substring(6,250);
            socket.emit('login',{'name' : _name});
            connected=true;
        });

        socket.on('cards',function(data){_cards = data;});
        socket.on('notify-thriumph', function (data){_thriumph = data;});
        socket.on('select-thriumph', function (choises){
            socket.emit('chosen-thriumph',that.selectThriumph(choises));
        });
        socket.on('play-card',function(){
            socket.emit('new-roll',that.selectCard());
        });
        socket.on('contro',function(){
            socket.emit('new-roll',that.contro());
        });

        //TODO:Save played cards
        //socket.on('card-played');
        //TODO:Save contros???????
        //socket.on('contro-done',function(data){
    }

    this.join = function(game){
        if(!connected)
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
Bot.prototype.selectCard = function(){
    //Dummy version return first choise.
    return this.cards()[0];
}

module.exports.Bot = Bot;


