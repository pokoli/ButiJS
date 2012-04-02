var client = require('socket.io-client');

/*
    Generic code for all the bots.
*/

module.exports.Bot = function(){
    var socket;
    var connected;
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
            socket.emit('login',{'name' : 'Bot'+new Date().getTime()});
        });
        socket.on('connected',function(){
            connected=true;
        });
        
    }
    
    this.join = function(game){
        if(!connected)
        {
            this.connect();
        }
        socket.emit('join-game',game);
    }
    
    this.disconnect = function(){
        socket.disconnect();
    }
}


