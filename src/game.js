var util = require('util'),
    event = require('events');

function notifyAll(type,data,fn) {
    this.players.forEach(function(player){
        player.notify(type,data,fn);
    });
    this.watchers.forEach(function(player){
        player.notify(type,data,fn);
    });
}; 

var Game = function() {
	this.players = [];
	this.watchers = [];
	this.state = 'waiting';
	this.min_players = 0;
	
	this.on('notifyAll',notifyAll); 
};

//Inherits from EventEmitter so we can manage the events of the game.
util.inherits(Game, event.EventEmitter);

module.exports.create = function() {
	return new Game();
};

module.exports.clone = function(game) {
	var _game = new Game();
	if(!game)
		return _game;
	if(game.players)
		_game.players=game.players;
	if(game._events)
	    _game._events=game._events;	
	return _game;
};

module.exports.Game = Game;

Game.prototype.notifyAll = notifyAll;

Game.prototype.addPlayer = function(player){
	this.players.push(player);
}

Game.prototype.addWatcher = function(watcher){
	this.watchers.push(watcher);
}

Game.prototype.hasPlayer = function(player){
	var idx = this.players.indexOf(player);
	if(idx != -1) 
		return true;
	return false;
}

Game.prototype.removePlayer = function(player){
	var idx = this.players.indexOf(player);
	if(idx != -1) 
	{
		this.players.splice(idx,1);
		return true;
	}
	return false;
}

Game.prototype.numberOfPlayers = function(){
	return this.players.length;
}

Game.prototype.numberOfWatchers = function(){
	return this.watchers.length;
}

/*
This function only does the common things for a game. 
The game inits must be done in a doStart function 
*/
Game.prototype.start = function(){
    if(this.players.length < this.min_players) throw new Error('Not enough players');
    this.state='running';
    this.notifyAll('start',this);
}







