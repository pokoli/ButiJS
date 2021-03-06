var util = require('util'),
    i18n = require('i18n'),
    event = require('events');

function notifyAll(type,data,fn) {
    if(this.players)
    {
        this.players.forEach(function(player){
            player.notify(type,data,fn);
        });
    }
    if(this.watchers)
    {
        this.watchers.forEach(function(player){
            player.notify(type,data,fn);
        });
    }
}; 

var Game = function(name) {
    this.name=name;
	this.players = [];
	this.watchers = [];
	this.state = i18n.__('waiting');
	this.min_players = 0;
	
	this.on('notifyAll',notifyAll); 
	/*
	    When the game data is updated notify all the players
	*/
	this.on('updated',function(game){
	    game.notifyAll('updated-game',game)
    });
};

//Inherits from EventEmitter so we can manage the events of the game.
util.inherits(Game, event.EventEmitter);


module.exports.create = function(name) {
	return new Game(name);
};

module.exports.clone = function(game,type) {
	if(!game)
		return new Game();
	var _game;
	if(type)
	{
	    _game = new type(game.name);
	}
	else
	{
	    _game = new Game(game.name);
    }
	if(game.id)
	    _game.id=game.id;
	if(game.players)
		_game.players=game.players;
	if(game._events)
	    _game._events=game._events;
	if(game.watchers)
	    _game.watchers=game.watchers;
	if(game.state)
	    _game.state=game.state;
	if(game.min_players)
	    _game.min_players=game.min_players;
	return _game;
};

module.exports.Game = Game;

Game.prototype.notifyAll = notifyAll;

Game.prototype.addPlayer = function(player,fn){
	this.players.push(player);
	this.emit('updated',this);
	fn && fn();
}

Game.prototype.addWatcher = function(watcher,fn){
	this.watchers.push(watcher);
	this.emit('updated',this);
	fn && fn();
}

Game.prototype.hasPlayer = function(otherPlayer){
    for(var i=0;i<this.players.length;i++)
    {
        if(this.players[i].isEqual(otherPlayer))
            return true;
    }
	return false;
}

Game.prototype.hasWatcher = function(otherPlayer){
    for(var i=0;i<this.watchers.length;i++)
    {
        if(this.watchers[i].isEqual(otherPlayer))
            return true;
    }
	return false;
}

Game.prototype.removePlayer = function(otherPlayer){
    for(var i=0;i<this.players.length;i++)
    {
        if(this.players[i].isEqual(otherPlayer))
        {
            this.players.splice(i,1);
		    this.emit('updated',this);
		    return true;
        }
    }
	return false;
}

Game.prototype.numberOfPlayers = function(){
	return this.players.length;
}

Game.prototype.numberOfWatchers = function(){
	return this.watchers.length;
}

Game.prototype.start = function(){
    if(this.numberOfPlayers() < this.min_players) throw new Error(i18n.__('Not enough players'));
    this.state=i18n.__('running');
    this.emit('updated',this);
}

