var socket = io.connect('http://localhost:8000');
  
socket.on('welcome', function (data) {
  	$('#login-dialog').dialog('open');
});  


socket.on('message', function(data){
	var text;
	if(typeof(data)=='string')
	{
		addMessage(data);
	}
	else
	{
		if(data.player)
			text = ''+data.player.name+': ';
		text+=data.msg;
		addMessage(text);
	}
});

//Holds the player id.
var playerid;
//Holds info about the current game.
var currentGame;
//Holds the info of the current round.
var currentRound;
//True if is the player current turn. False if not. 
var yourTurn=false;
//Holds the current thriumph
var currentThriumph;

/*
    Fired when a game we are playing is started
*/
socket.on('start', function(gameData){
    currentGame=gameData;
    addNewGame(gameData);
    updateGameInfo(gameData);
});
/*
    Fired when the data of a game we are playing is updated
*/
socket.on('updated-game',function(gameData){
    if(!currentGame)
        return;   
    if(gameData.round!=currentGame.round);
    {
        currentRound=gameData.playedRounds[gameData.round-1];  
    }
    currentGame=gameData;
    updateGameInfo(gameData);
});

socket.on('cards', function(data){
   placeCards(sortCards(data));
});

socket.on('card-played',placePlayedCard);

socket.on('play-card',function(){
    yourTurn=true;
    writeMessage('Is your turn');
});

socket.on('make-thriumph', function(data){
    showThriumphDialog(data,makeThriumph);
});

socket.on('new-round',function(){
    currentThriumph=undefined;
});

socket.on('contro', function(){
    showControDialog(currentThriumph,doContro);
});

socket.on('thriumph', function (data){
    currentThriumph=data;
    writeMessage('Thriumph: '+data);
});
/*Called onLoad of the html. Loads all the data needed:
	1. Refresh games-list (every 5 seconds)
	2. Refresh player-list (every 5 seconds)
*/
function doLoad()
{
	setInterval("refreshGames()",5000);
	setInterval("refreshPlayers()",5000);
}

function sendMsg(msg) {
    socket.emit('send',msg);
}

var games=[];
var selected;

function savePlayerId(id)
{
    playerid=id;
}

function refreshGames(){
	socket.emit('list-games',null,drawGameData);
}


function refreshPlayers(){
	socket.emit('list-players',null,drawPlayersList);
}

function createGame(gameData){    
	socket.emit('create-game',gameData,refreshGames);
}

function makeThriumph(choise){
    socket.emit('made-thriumph',choise,function(err){
        if(err) writeMessage(err);
    });
}

function doContro(value){
    socket.emit('do-contro',value);
}

function playCard(card,callback)
{
    if(!yourTurn)
        writeMessage('Is not your turn');
    socket.emit('new-roll',card,function(err){
        if(err)
        {
            writeMessage(err);
            return;
        }
        yourTurn=false;
        callback && callback();
   });
}

function joinGame(){
    if(!selected && selected != 0)
    {
        alert("You should select a game.");
        return;
    }
	socket.emit('join-game', games[selected].id,function(err,data){
	    if(err)
	    {
	        alert(err);
	    }
	    refreshGames();
	});
}

/*
    Calculates the weight of a card in the order of the player card
    Based on the following relations:
    Suit: Oros > Copes > Espases -> Bastos
    Number: 9 > 1 > 12 > 11 > 10 > ... > 2
*/
function cardWeight(card)
{
    var score=0;
    if(card.suit=='Oros')
        score+=300;
    else if(card.suit=='Copes')
        score+=200;
    else if(card.suit=='Espases')
        score+=100;
    if(card.number==9 || card.number==1)
        score+=13;
    score+=card.number;
    return score;
}

/*
    Sorts the players based on the follwing order:
     - Per suit: Oros > Copes > Espases -> Bastos
     - Per Number: 9 > 1 > 12 > 11 > 10 > ... > 2
*/
function sortCards(unsorted)
{
    function cardSort(a,b)
    {
        return (cardWeight(a)-cardWeight(b))*-1
    }
    return unsorted.sort(cardSort);
}

