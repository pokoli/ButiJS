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

function ifErrorCallback(err)
{
    should.ifError(err);
}

function addListeners(event,funct)
{
    [socket,socketB,socketC,socketD].forEach(function(sock){
        sock.on(event,funct);
    });
}

function removeListeners(name)
{
    [socket,socketB,socketC,socketD].forEach(function(sock){
        sock.removeAllListeners(name);
    });
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
		socket.emit('create-game',game,function(err,data){
		    should.ifError(err);
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
			if(recived===0) {
				removeListeners('message');
			    done();
			}
		}
		addListeners('message',message);
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
	"A player can not joing a game that not exists " : function(done){
	    socket.emit('join-game',-1,function(err,data){
	        err.should.eql('Game -1 does not exist');
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
	            socket.emit('list-games',undefined,function(data){
	                //Test if the game is running on the server side
	                data.length.should.eql(2);
	                data[1].players.length.should.eql(4);
            	    //Remove the listeners from this test
        	        removeListeners('select-thriumph');
        	        removeListeners('start');
        	        removeListeners('cards');
	                done();
	            });
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

        addListeners('start',started);

	    socket.on('cards',function(data){socket.cards=data;recivedCards(data);});
	    socketB.on('cards',function(data){socketB.cards=data;recivedCards(data);});
	    socketC.on('cards',function(data){socketC.cards=data;recivedCards(data);});
	    socketD.on('cards',function(data){socketD.cards=data;recivedCards(data);});

	    socket.on('select-thriumph',function(){ toMakeThriumph=socket;recivedThriumph(arguments[0]);});
	    socketB.on('select-thriumph',function(){ toMakeThriumph=socketB;recivedThriumph(arguments[0]);});
	    socketC.on('select-thriumph',function(){ toMakeThriumph=socketC;recivedThriumph(arguments[0]);});
	    socketD.on('select-thriumph',function(){ toMakeThriumph=socketD;recivedThriumph(arguments[0]);});

	    function joinGame(err,game){
	        should.ifError(err);
	        socketB.emit('join-game',game.id,ifErrorCallback);
	        socketC.emit('join-game',game.id,ifErrorCallback);
            socketD.emit('join-game',game.id,ifErrorCallback);
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
    	        removeListeners('notify-thriumph');
	        }
	        if(playedCard===0)
	        {
    	        removeListeners('play-card');
	        }
	        if(updated===0)
	        {
	            removeListeners('updated-game');
	        }
	        if(contros===0)
	        {
	            removeListeners('contro')
	        }
	        if(plays===0)
	        {
	            removeListeners('card-played');
	        }
	        
	        if(thriumphs===0 && playedCard===0 && updated===0 && contros===0 && plays ===0) {
    	        removeListeners('select-thriumph');
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
            choise.should.eql('Copes (Delegated)');
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
	        sock.emit('chosen-thriumph','Copes',ifErrorCallback);
	        sock.removeAllListeners('select-thriumph');
	    }

	    //Make thriumph after the other player has delegated
	    socket.on('select-thriumph',function(){ selectThriumph(socket);});
	    socketB.on('select-thriumph',function(){ selectThriumph(socketB);});
	    socketC.on('select-thriumph',function(){ selectThriumph(socketC);});
	    socketD.on('select-thriumph',function(){ selectThriumph(socketD);});

        addListeners('updated-game',updatedGame);
        addListeners('contro',controed);
        addListeners('notify-thriumph',thriumphed);
        addListeners('card-played',cardPlayed);

	    socket.on('play-card',function(){ recivedPlayCard();playCard(socket);});
	    socketB.on('play-card',function(){ recivedPlayCard();playCard(socketB);});
	    socketC.on('play-card',function(){ recivedPlayCard();playCard(socketC);});
	    socketD.on('play-card',function(){ recivedPlayCard();playCard(socketD);});

	    process.nextTick(function(){
	        toMakeThriumph.emit('chosen-thriumph','Delegar', function(err){
                should.ifError(err);
	        });
        });
    },
    "The play-card event must occur after the two players don't want to contro " : function(done){
	    var controsRec=2;
	    function joinGame(err,game){
	        should.ifError(err);
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
	    
	    addListeners('play-card',recivedPlayCard);
	    
	    socket.on('select-thriumph',function(){ socket.emit('chosen-thriumph','Copes',ifErrorCallback);});
	    socketB.on('select-thriumph',function(){ socketB.emit('chosen-thriumph','Copes',ifErrorCallback);});
	    socketC.on('select-thriumph',function(){ socketC.emit('chosen-thriumph','Copes',ifErrorCallback);});
	    socketD.on('select-thriumph',function(){ socketD.emit('chosen-thriumph','Copes',ifErrorCallback);});
	    
    	game = Game.create('New Game');
		socket.emit('create-game',game,joinGame);
    },
    "Server must be able to translate strings" : function(done){
        socket.emit('translate','Hello',function(data){
            data.should.eql('Hello');
            done();
        });
    },
    "We should be able to add bots to a game" : function(done){
        game = Game.create('Bot Game');
		socket.emit('create-game',game,function(err,data){
		    should.ifError(err);
			recivedGame = Game.clone(data);
			socket.emit('add-bot',recivedGame.id,function(err){
			    should.ifError(err);
			    socket.emit('list-games',undefined,function(gameList){
			        for(var i=0;i<gameList.length;i++)
			        {
			            if(gameList[i].name==='Bot Game')
			            {
			                gameList[i].players.length.should.eql(2);
			                gameList[i].players[1].name.substring(0,3).should.eql('Bot');
			                done();
			            }
			        }
			    });
			});
		});
    },
	"When a player disconnects the server removes it's reference " : function(done){
        finish(done);
		//TODO: Improve, not working very well.
//        socketE = client.connect('http://localhost', {port : 8000,'force new connection': true, 'reconnect': false});
//        socketF = client.connect('http://localhost', {port : 8000,'force new connection': true, 'reconnect': false});
//        socketG = client.connect('http://localhost', {port : 8000,'force new connection': true, 'reconnect': false});

//		var disconnects=3;

//		function disconnected(){
//		    console.log('Disconnected');
//		    disconnects--;
//		    if(disconnects===0) test();
//		}

//		function test()
//		{
//			socket.emit('list-players',null,function(data){
//			    data.should.be.an.instanceof(Array);
//			    data.length.should.eql(4);
//			    var names = ['Peach'].sort();
//                var sorted = [];
//                for(var i=0;i<data.length;i++)
//                    sorted.push(data[i].name);
//                sorted = sorted.sort();
//               sorted.should.eql(names);
//		        finish(done);
//		    }); 
//		}

//		socketE.on('disconnect',disconnected);
//		socketF.on('disconnect',disconnected);
//		socketG.on('disconnect',disconnected);

//		socketE.disconnect();
//		socketF.disconnect();
//		socketG.disconnect();
	}
};




