var Game = require(__dirname+'/game');

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
};

Player.prototype.join = function(game){
	if(typeof(game) !== 'object') { throw new Error('Game must be an object');}
	game.addPlayer(this);
};

module.exports.create = function(name,email,socket) {
	return new Player(name,email,socket);
};



