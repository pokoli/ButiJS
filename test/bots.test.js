/*
    Not working!!! Breaks the other tests because there are two servers running.
var client = require('socket.io-client'),
    server = process.env.COVERAGE ? require('../src-cov/server.js') : require('../src/server.js'),
    bots = process.env.COVERAGE ? require('../src-cov/bots/bot.js') : require('../src/bots/bot.js');


module.exports = {
    "We should be able to add bots to the server" : function(done){
        var bot = new bots.Bot();
        bot.connect();
    }   
}
*/
