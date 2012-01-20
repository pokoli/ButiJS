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

var Game = function(name) {
    this.name=name;
	this.players = [];
	this.watchers = [];
	this.state = 'waiting';
	this.min_players = 0;
	
	this.on('notifyAll',notifyAll); 
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

Game.prototype.start = function(){
    if(this.numberOfPlayers() < this.min_players) throw new Error('Not enough players');
    this.state='running';
    this.notifyAll('start',this);
}

