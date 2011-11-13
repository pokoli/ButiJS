var Game = function() {
	this.players = [];
	this.state = 'waiting';
};

module.exports.create = function() {
	return new Game();
};

module.exports.clone = function(game) {
	var _game = new Game();
	if(!game)
		return _game;
	if(game.players)
		_game.players=game.players;
	return _game;
};

Game.prototype.notifyAll = function(type,data,fn) {
	players.forEach(function(player){
		player.notify(type,data,fn);
	});
};

Game.prototype.addPlayer = function(player){
	this.players.push(player);
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







