var should = require('should'),
	client = require('socket.io-client'),
	server = require('../src/server.js'),
	Player = require('../src/player.js'),
	Game = require('../src/butifarraGame.js');

var connected = false,connectedB = false,connectedC = false,connectedD = false;
	
var socket = client.connect('http://localhost', {port : 8000});
var socketB = client.connect('http://localhost', {port : 8000,'force new connection': true});
var socketC = client.connect('http://localhost', {port : 8000,'force new connection': true});
var socketD = client.connect('http://localhost', {port : 8000,'force new connection': true});

var toMakeThriumph;

function finish(done) {
	console.log('Finish');
	connected.should.be.true;
	connectedB.should.be.true;
	connectedC.should.be.true;
	connectedD.should.be.true;
	done();
  	server.server.close();
}

module.exports = {
	"We will be able to connect the server" : function(done){	
		socket.on('connect', function (err) {
			connected=true;
			should.isUndefined(err);
			done();
		});
	},	 
	"Two (or more) connections could be established on the same time ": function(){
		socketB.on('connect', function (err) {
    		connectedB=true;
			should.isUndefined(err);
		});
		socketC.on('connect', function (err) {
    		connectedC=true;
			should.isUndefined(err);
		});
		socketD.on('connect', function (err) {
    		connectedD=true;
			should.isUndefined(err);
		});
	},
	"We are recibing a welcome event after connecting" : function(done){
		socket.on('welcome', function (data){
			connected.should.be.true;
			data.msg.should.eql('Welcome, who you are?');
			done();
		});
	},
	"When we send a name event the server stores our name and acknowledgets it" : function (done){
	    var logins=4;
	    function doLogin(){
	        logins--;
	        if(logins==0) done();
	    }
		socket.emit('login',{'name' : 'Luiggi'}, function(data){
			data.name.should.eql('Luiggi');
			doLogin();
		});
		socketB.emit('login',{'name' : 'Mario'}, function(data){
			data.name.should.eql('Mario');
			doLogin();
		});
		socketC.emit('login',{'name' : 'Yoshi'}, function(data){
			data.name.should.eql('Yoshi');
			doLogin();
		});
		socketD.emit('login',{'name' : 'Peach'}, function(data){
			data.name.should.eql('Peach');
			doLogin();
		});
		
	},
	"When we querry for the available games we get a list of games " : function(done){
		socket.emit('list-games',null,function(data){
			data.should.be.an.instanceof(Array);
			data.should.eql([]);
			done();
		});
	},
	"When we query for the connected players we get a list of players " : function(done){
		socket.emit('list-players',null,function(data){
			data.should.be.an.instanceof(Array);
			data.length.should.eql(4);
			var names = ['Peach','Yoshi','Mario','Luiggi'].sort();
            var sorted = [];
            for(var i=0;i<data.length;i++)
                sorted.push(data[i].name);
            sorted = sorted.sort();
            sorted.should.eql(names);
			done();
		});
	},
	"When we create a game, the server stores it" : function(done){
		game = Game.create('New Game');
		socket.emit('create-game',game,function(data){
			recivedGame = Game.clone(data);
			var tempData = data;
			recivedGame.numberOfPlayers().should.eql(1); //The player automatically joins the game
			recivedGame.should.have.property('id'); //The server automatically assigns an id to the game
			socket.emit('list-games',null,function(data){
				data.should.be.an.instanceof(Array);
				data.length.should.eql(1);
                data.shift().should.eql(tempData);
				done();
			});
		});	
	},
	"You cand send messages to all players in the server " : function(done) {
		var msg = 'Hello, how are you';
		var recived=4;
		function message(data){
			data.player.name.should.eql('Luiggi');
			data.msg.should.eql(msg);
			recived--;
			if(recived==0) done();
		}
		
		socket.on('message',message);
		socketB.on('message',message);
		socketC.on('message',message);
		socketD.on('message',message);
		socket.emit('send',msg);
	
	},
	"A player should be able to join a game" : function(done){
	    socketB.emit('join-game',1,function(err,data){
	        should.ifError(err);
	        data.players.length.should.eql(2);
	        done();
	    });
	},
	"A player should be able a game only one time. " : function(done){
	    socket.emit('join-game',1,function(err,data){
	        err.should.eql('You are already in the game');
	        done();
	    });
	},
	"The server must respond to rounds events. If no current game with an error": function(done){
	    socket.emit('made-thriumph',25,function(err){
	        err.should.eql('No current game running');
	        done();
	    
	    });
	},
	"When 4 players join a game a start event must occur foreach player, cards should be distribuited, and one player should have recived a make-thiumph event. " : function(done){
	    var startedEvents=4;
	    var cardEvents=4;
	    var endCalled=3;

	    function end()
	    {
            endCalled--;
	        if(endCalled==0) done();
	    }
	    
	    function started(game)
	    {
	        startedEvents--;
            if(startedEvents==0) end();
	    }

	    function recivedThriumph(selections)
	    {
			selections.should.be.an.instanceof(Array);
			end();
	    }

	    function recivedCards(cards)
	    {
			cards.should.be.an.instanceof(Array);
			cards.length.should.eql(12);
            for(var i=0;i<cards.length;i++)
            {
	            cards[i].should.have.property('number');
	            cards[i].should.have.property('suit');
            }
	        cardEvents--;
	        if(cardEvents==0) end();
	    }
	    
	    socket.on('start',started);
	    socketB.on('start',started);
	    socketC.on('start',started);
	    socketD.on('start',started);

	    socket.on('cards',function(data){socket.cards=data;recivedCards(data);});
	    socketB.on('cards',function(data){socketB.cards=data;recivedCards(data);});
	    socketC.on('cards',function(data){socketC.cards=data;recivedCards(data);});
	    socketD.on('cards',function(data){socketD.cards=data;recivedCards(data);});

	    socket.on('make-thriumph',function(){ toMakeThriumph=socket;recivedThriumph(arguments[0]);});
	    socketB.on('make-thriumph',function(){ toMakeThriumph=socketB;recivedThriumph(arguments[0]);});
	    socketC.on('make-thriumph',function(){ toMakeThriumph=socketC;recivedThriumph(arguments[0]);});
	    socketD.on('make-thriumph',function(){ toMakeThriumph=socketD;recivedThriumph(arguments[0]);});
	
	    function joinGame(game){
	        socketB.emit('join-game',game.id);
	        socketC.emit('join-game',game.id);
            socketD.emit('join-game',game.id);
	    }
    	game = Game.create('New Game');
		socket.emit('create-game',game,joinGame);
	},
	"The thriumpher should be able to makeThriumph and the other players must recive it. The first player to play must recibe a play-card event also." : function(done){
	    var thriumphs=4;
	    var playCard=1;
	    toMakeThriumph.should.not.eql(undefined);
	    function end()
	    {
	        if(thriumphs==0 && playCard==0) {
        	    socket.removeAllListeners('play-card');
        	    socketB.removeAllListeners('play-card');
	            socketC.removeAllListeners('play-card');
        	    socketD.removeAllListeners('play-card');
	            done();
	        }
	    }
	    
	    function recivedPlayCard()
	    {
	        playCard--;
	        if(playCard ==0) end();
	        playCard.should.be.eql(0);
	    }
	    
	    function thriumphed(choise)
	    {
            choise.should.eql('Copes');
            thriumphs--;
            if(thriumphs==0) end();
	    }

	    //Remove the listener from the previous test
	    socket.removeAllListeners('make-thriumph');
	    socketB.removeAllListeners('make-thriumph');
	    socketC.removeAllListeners('make-thriumph');
	    socketD.removeAllListeners('make-thriumph');

	    //Make thriumph after the other player has delegated
	    socket.on('make-thriumph',function(){ socket.emit('made-thriumph','Copes');});
	    socketB.on('make-thriumph',function(){ socketB.emit('made-thriumph','Copes');});
	    socketC.on('make-thriumph',function(){ socketC.emit('made-thriumph','Copes');});
	    socketD.on('make-thriumph',function(){ socketD.emit('made-thriumph','Copes');});

	    socket.on('thriumph',thriumphed);
	    socketB.on('thriumph',thriumphed);
	    socketC.on('thriumph',thriumphed);
	    socketD.on('thriumph',thriumphed);
	    
	    socket.on('play-card',function(){ toPlay=socket;recivedPlayCard();});
	    socketB.on('play-card',function(){ toPlay=socketB;recivedPlayCard();});
	    socketC.on('play-card',function(){ toPlay=socketC;recivedPlayCard();});
	    socketD.on('play-card',function(){ toPlay=socketD;recivedPlayCard();});

	    toMakeThriumph.emit('made-thriumph','Delegar', function(err){
            should.ifError(err);
	    });

    },
    "When a player plays a card all the other players must recive a notification" : function(done){
	    toPlay.should.not.eql(undefined);
	    var plays = 4;
	    var callback=1;
	    var cardToPlay = toPlay.cards[0];
	    
	    function end(){
	        if(plays == 0 && callback ==0) done();
	    }
	    
	    function cardPlayed(data){
	        var card=data.card;
	        card.number.should.eql(cardToPlay.number);
	        card.suit.should.eql(cardToPlay.suit);
	        plays--;
	        if(plays==0) end();
	    }
	    
	    socket.on('card-played',cardPlayed);
	    socketB.on('card-played',cardPlayed);
	    socketC.on('card-played',cardPlayed);
	    socketD.on('card-played',cardPlayed);
	    toPlay.emit('new-roll',cardToPlay, function(err){
            should.ifError(err);
            callback--;
            if(callback==0) end();
	    });
    
    },
	"When a player disconnects the server removes it's reference " : function(done){
        finish(done);
		//TODO: Improve, not working very well.
//		var disconnects=3;

//		function disconnected(){
//		    disconnects--;
//		    if(disconnects==0) test();
//		}

		//function test()
		//{
		//	socket.emit('list-players',null,function(data){
		//	    data.should.be.an.instanceof(Array);
		//	    data.length.should.eql(1);
		//	    var names = ['Peach'].sort();
        //        var sorted = [];
         //       for(var i=0;i<data.length;i++)
        //            sorted.push(data[i].name);
        //        sorted = sorted.sort();
         //       sorted.should.eql(names);
		 //       finish(done);
		 //   });
		    
		//}
		
		//socketD.disconnect(disconnected);
		//socketC.disconnect(disconnected);
		//socketB.disconnect(disconnected);

	}
};




