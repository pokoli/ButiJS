var Game = require(__dirname+'/game')
  , i18n = require('i18n');

var Player = function(name,email,socket) {

	this.name=name;
	this.email=email;
	var _socket=socket;
	
	this.notify = function (type,data,fn){
	    if(_socket)
	    {
	        if(fn && data)
	        {
    	        _socket.emit(type,data,fn);
    	    }
	        else if(data)
	        {
    	        _socket.emit(type,data);
    	    }
    	    else
    	    {
    	        _socket.emit(type);
    	    }
	        
	    }
	}
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
};

Player.prototype.join = function(game){
	if(typeof(game) !== 'object') { throw new Error(i18n.__('Game must be an object'));}
	game.addPlayer(this);
};

module.exports.create = function(name,email,socket) {
	return new Player(name,email,socket);
};



