var Game = require(__dirname+'/game');

var Player = function() {
	this.name='';
	this.email='';
};

Player.prototype.join = function(game){
	if(typeof(game) !== 'object') { throw new Error('Game must be an object');}
	game.players.push(this);
};

Player.prototype.notify = function(type,data,fn){
	socket.emit(type,data,fn);
};	


module.exports.create = function() {
	return new Player();
};



