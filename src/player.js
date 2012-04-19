var Game = require(__dirname+'/game')
  , i18n = require('i18n')
  , mongoose = require('mongoose')
  , butiSchema = require('./dbSchema');


var Player = mongoose.model('player',butiSchema.Player);

	
Player.prototype.notify = function (type,data,fn){
    if(this._socket)
    {
        if(fn && data)
        {
	        this._socket.emit(type,data,fn);
	    }
        else if(data)
        {
	        this._socket.emit(type,data);
	    }
	    else
	    {
	        this._socket.emit(type);
	    }
        
    }
}

Player.prototype.isEqual = function(otherPlayer){
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

Player.prototype.join = function(game){
	if(typeof(game) !== 'object') { throw new Error(i18n.__('Game must be an object'));}
	game.addPlayer(this);
};

module.exports.create = function(name,email,socket) {
	var player = new Player();
	player.name=name;
	player.email=email;
	player._socket=socket;
	return player;
};

module.exports.Model = Player



