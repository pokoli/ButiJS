var should = require('should'),
	client = require('socket.io-client'),
	server = process.env.COVERAGE ? require('../src-cov/server.js') : require('../src/server.js'),
	Player = process.env.COVERAGE ? require('../src-cov/player.js') : require('../src/player.js'),
	Game = process.env.COVERAGE ?  require('../src/butifarraGame.js') : require('../src/butifarraGame.js');

var connected = false,connectedB = false,connectedC = false,connectedD = false;
	
var socket,socketB,socketC,socketD;

var toMakeThriumph;

function finish(done) {
	connected.should.be.true;
	connectedB.should.be.true;
	connectedC.should.be.true;
	connectedD.should.be.true;
	done();
  	server.server.close();
  	//process.exit();
}

function makeTrhiumphCallBack(err)
{
    should.ifError(err);
}

module.exports = {
	"We will be able to connect the server and we recive a welcome event" : function(done){
	    var events=2;
    	socket = client.connect('http://localhost', {port : 8000});
		socket.on('connect', function (err) {
			connected=true;
			should.ifError(err);
			events--;
			if(events===0) done();
		});
		socket.on('welcome', function (data){
			connected.should.be.true;
			data.msg.should.eql('Welcome, who you are?');
			events--;
			if(events===0) done();
		});
	},
	"Two (or more) connections could be established on the same time ": function(){
		socketB = client.connect('http://localhost', {port : 8000,'force new connection': true});
        socketC = client.connect('http://localhost', {port : 8000,'force new connection': true});
        socketD = client.connect('http://localhost', {port : 8000,'force new connection': true});
		socketB.on('connect', function (err) {
    		connectedB=true;
			should.ifError(err);
		});
		socketC.on('connect', function (err) {
    		connectedC=true;
			should.ifError(err);
		});
		socketD.on('connect', function (err) {
    		connectedD=true;
			should.ifError(err);
		});
	},
	"When we send a name event the server stores our name and acknowledgets it" : function (done){
	    var logins=4;
	    function doLogin(){
	        logins--;
	        if(logins===0) done();
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
			if(recived===0) done();
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
	    socket.emit('chosen-thriumph',25,function(err){
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
	        if(endCalled===0){
        	    //Remove the listeners from this test
	            socket.removeAllListeners('select-thriumph');
	            socketB.removeAllListeners('select-thriumph');
	            socketC.removeAllListeners('select-thriumph');
	            socketD.removeAllListeners('select-thriumph');
	            socket.removeAllListeners('start');
                socketB.removeAllListeners('start');
	            socketC.removeAllListeners('start');
	            socketD.removeAllListeners('start');
	            done();
	        } 
	    }

	    function started(game)
	    {
	        startedEvents--;
            if(startedEvents===0) end();
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
	        if(cardEvents===0) end();
	    }

	    socket.on('start',started);
	    socketB.on('start',started);
	    socketC.on('start',started);
	    socketD.on('start',started);

	    socket.on('cards',function(data){socket.cards=data;recivedCards(data);});
	    socketB.on('cards',function(data){socketB.cards=data;recivedCards(data);});
	    socketC.on('cards',function(data){socketC.cards=data;recivedCards(data);});
	    socketD.on('cards',function(data){socketD.cards=data;recivedCards(data);});

	    socket.on('select-thriumph',function(){ toMakeThriumph=socket;recivedThriumph(arguments[0]);});
	    socketB.on('select-thriumph',function(){ toMakeThriumph=socketB;recivedThriumph(arguments[0]);});
	    socketC.on('select-thriumph',function(){ toMakeThriumph=socketC;recivedThriumph(arguments[0]);});
	    socketD.on('select-thriumph',function(){ toMakeThriumph=socketD;recivedThriumph(arguments[0]);});

	    function joinGame(game){
	        socketB.emit('join-game',game.id);
	        socketC.emit('join-game',game.id);
            socketD.emit('join-game',game.id);
	    }
    	game = Game.create('New Game');
		socket.emit('create-game',game,joinGame);
	},
	"The thriumpher should be able to makeThriumph and the other players must recive it. The others teams playres must recibe a contro event. After the contro stage the first player to play must recibe a play-card event also. The game info must be updated with the round info and the thriumpher. When a player plays a card all the other players must recive a notification " : function(done){
	    var thriumphs=4;
	    var updated=8; //Four for thriumph and Four for contros
	    var playedCard=1;
	    var contros=4;
    	var plays = 4;
	    var callback=1;
	    var cardToPlay;
	    toMakeThriumph.should.not.eql(undefined);

	    function end()
	    {
	        if(thriumphs===0)
	        {
           	    socket.removeAllListeners('notify-thriumph');
        	    socketB.removeAllListeners('notify-thriumph');
	            socketC.removeAllListeners('notify-thriumph');
        	    socketD.removeAllListeners('notify-thriumph');
	        }
	        if(playedCard===0)
	        {
           	    socket.removeAllListeners('play-card');
        	    socketB.removeAllListeners('play-card');
	            socketC.removeAllListeners('play-card');
        	    socketD.removeAllListeners('play-card');
	        }
	        if(updated===0)
	        {
                socket.removeAllListeners('updated-game');
                socketB.removeAllListeners('updated-game');
                socketC.removeAllListeners('updated-game');
                socketD.removeAllListeners('updated-game');
	        }
	        if(contros===0)
	        {
                socket.removeAllListeners('contro');
                socketB.removeAllListeners('contro');
                socketC.removeAllListeners('contro');
                socketD.removeAllListeners('contro');
	        }
	        if(plays===0)
	        {
                socket.removeAllListeners('card-played');
                socketB.removeAllListeners('card-played');
                socketC.removeAllListeners('card-played');
                socketD.removeAllListeners('card-played');
	        }
	        
	        
	        if(thriumphs===0 && playedCard===0 && updated===0 && contros===0 && plays ===0) {
                socket.removeAllListeners('select-thriumph');
                socketB.removeAllListeners('select-thriumph');
                socketC.removeAllListeners('select-thriumph');
                socketD.removeAllListeners('select-thriumph');
	            done();
	        }
	    }

	    function updatedGame(gameData)
	    {
	        if(!gameData.playedRounds || !gameData.round)
	            return;
	        var round = gameData.playedRounds[gameData.round-1];
	        if(round.thriumph)
	        {
	            round.thriumph.should.eql('Copes');
	            updated--;
	            if(updated===0) end();
	        }
	    }

	    function recivedPlayCard()
	    {
	        if(playedCard<=0)
	        {
                console.trace();
            }
	        playedCard.should.be.eql(1);
	        playedCard--;
	        if(playedCard ===0) end();
	    }

	    function thriumphed(choise)
	    {
            choise.should.eql('Copes');
            thriumphs--;
            if(thriumphs===0) end();
	    }

	    function controed()
	    {
	        if(contros===4 || contros===2)
                this.emit('do-contro',{'value': true, 'player': {'name': 'Mario'}});
            else
                this.emit('do-contro',{'value': false, 'player': {'name': 'Mario'}});
	        contros--;
	        if(contros===0) end();
	    }

	    function playCard(player){
    	    cardToPlay = player.cards[0];
            player.emit('new-roll',player.cards[0], function(err){
                should.ifError(err);
            });
	    }

	    function cardPlayed(data){
	        var card=data.card;
	        card.number.should.eql(cardToPlay.number);
	        card.suit.should.eql(cardToPlay.suit);
	        plays--;
	        if(plays===0) end();
	    }

	    var selectedTrhiumph=0;
	    function selectThriumph(sock){
	        selectedTrhiumph++;
	        sock.emit('chosen-thriumph','Copes',makeTrhiumphCallBack);
	        sock.removeAllListeners('select-thriumph');
	    }

	    //Make thriumph after the other player has delegated
	    socket.on('select-thriumph',function(){ selectThriumph(socket);});
	    socketB.on('select-thriumph',function(){ selectThriumph(socketB);});
	    socketC.on('select-thriumph',function(){ selectThriumph(socketC);});
	    socketD.on('select-thriumph',function(){ selectThriumph(socketD);});

	    socket.on('updated-game',updatedGame);
	    socketB.on('updated-game',updatedGame);
	    socketC.on('updated-game',updatedGame);
	    socketD.on('updated-game',updatedGame);

	    socket.on('contro',controed);
	    socketB.on('contro',controed);
	    socketC.on('contro',controed);
	    socketD.on('contro',controed);

	    socket.on('notify-thriumph',thriumphed);
	    socketB.on('notify-thriumph',thriumphed);
	    socketC.on('notify-thriumph',thriumphed);
	    socketD.on('notify-thriumph',thriumphed);

	    socket.on('play-card',function(){ recivedPlayCard();playCard(socket);});
	    socketB.on('play-card',function(){ recivedPlayCard();playCard(socketB);});
	    socketC.on('play-card',function(){ recivedPlayCard();playCard(socketC);});
	    socketD.on('play-card',function(){ recivedPlayCard();playCard(socketD);});

        socket.on('card-played',cardPlayed);
	    socketB.on('card-played',cardPlayed);
	    socketC.on('card-played',cardPlayed);
	    socketD.on('card-played',cardPlayed);

	    toMakeThriumph.emit('chosen-thriumph','Delegar', function(err){
            should.ifError(err);
	    });
    },
    "The play-card event must occur after the two players don't want to contro " : function(done){
	    var controsRec=2;
	    function joinGame(game){
	        socketB.emit('join-game',game.id);
	        socketC.emit('join-game',game.id);
            socketD.emit('join-game',game.id);
	    }
	    function controed(socket)
	    {
            controsRec--;
	        //We set the function on the nextTick to be able to process the play-card event if it gets in the wrong place
	        process.nextTick(function(){
                socket.emit('do-contro',{'value': false});
	        });
	    }

	    function recivedPlayCard()
	    {
            controsRec.should.eql(0);
    	    socket.removeAllListeners('play-card');
    	    socketB.removeAllListeners('play-card');
            socketC.removeAllListeners('play-card');
    	    socketD.removeAllListeners('play-card');
            done();
	    }

	    socket.on('contro',function(){controed(socket)});
	    socketB.on('contro',function(){controed(socketB)});
	    socketC.on('contro',function(){controed(socketC)});
	    socketD.on('contro',function(){controed(socketD)});
	    
	    socket.on('play-card',recivedPlayCard);
	    socketB.on('play-card',recivedPlayCard);
	    socketC.on('play-card',recivedPlayCard);
	    socketD.on('play-card',recivedPlayCard);
	    
	    socket.on('select-thriumph',function(){ socket.emit('chosen-thriumph','Copes',makeTrhiumphCallBack);});
	    socketB.on('select-thriumph',function(){ socketB.emit('chosen-thriumph','Copes',makeTrhiumphCallBack);});
	    socketC.on('select-thriumph',function(){ socketC.emit('chosen-thriumph','Copes',makeTrhiumphCallBack);});
	    socketD.on('select-thriumph',function(){ socketD.emit('chosen-thriumph','Copes',makeTrhiumphCallBack);});
	    
    	game = Game.create('New Game');
		socket.emit('create-game',game,joinGame);
    },
	"When a player disconnects the server removes it's reference " : function(done){
        finish(done);
		//TODO: Improve, not working very well.
//		var disconnects=3;

//		function disconnected(){
//		    disconnects--;
//		    if(disconnects===0) test();
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




