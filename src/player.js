var Game = require(__dirname+'/game');

var Player = function(name,email) {
	this.name=name;
	this.email=email;
};

Player.prototype.join = function(game){
	if(typeof(game) !== 'object') { throw new Error('Game must be an object');}
	game.addPlayer(this);
};

Player.prototype.notify = function(type,data,fn){
	socket.emit(type,data,fn);
};	


module.exports.create = function(name,email) {
	return new Player(name,email);
};



