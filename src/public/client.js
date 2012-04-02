var socket = io.connect('http://localhost:8000');


//Stores all the translations
var translated={};
/*
    Load Translation from server side
*/
function trans(text){
    socket.emit('translate',text,function(translatedText){
        translated[text] = translatedText;
    });
}
/*
    Load All the localized Strings.
*/
(function loadLocalization(strings){
    for(var i=0;i<strings.length;i++)
        translated[strings[i]] = trans(strings[i]);
})(['Hello','Thriumph: ','Is not your turn',"You should select a game.","Login","Cancel","Create",
"Not yet implemented",'Name','State','Players','Watchers','No players on the server','Round','Team','Score',
'Round Info','(Delegated)','Thriumpher','Contro','Contro players','Do you want to make a contro?','Accept',
'Select Thriumph','Select','Is your turn','Yes','No','Player ',' has Contred',' has Recontred','Add bot']);

function getValue(text,translate){
    if(translated[text])
        return translated[text];
    else if(translate){
        trans(text);
        return;
    }
    else return;
}

function __(text){
    return getValue(text);
}
  
socket.on('welcome', function (data) {
  	$('#login-dialog').dialog('open');
});  


socket.on('message', function(data){
	var text;
	if(typeof(data)==='string')
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
//Holds the player team.
var playerTeam;
//Holds info about the current game.
var currentGame;
//Holds the info of the current round.
var currentRound;
//0 if is not the player turn. Any number avobe if it is.
var yourTurn=0;
//Holds the current thriumph
var currentThriumph;
//Hold if is waiting for a server response. 
var currentAction;
//Hold the history of contros done.
var controInfo=[];

/*
    Fired when a game we are playing is started
*/
socket.on('start', function(gameData){
    for(var i=0;i<gameData.players.length;i++)
    {
        if(gameData.players[i].id===playerid)
        {
            playerTeam=gameData.players[i].team 
            break;
        }
    }
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

function onPlayCard(){
    yourTurn++;
    writeMessage(__('Is your turn'));
}
socket.on('play-card',onPlayCard);

socket.on('select-thriumph', function(data){
    if(data && data.length>0)
    {
        showThriumphDialog(data,makeThriumph);
    }
});

socket.on('contro', function(){
    var additionalText= __('Thriumph: ')+currentThriumph;
    if(controInfo.length>0)
    {
        var i = controInfo.length-1;
        additionalText += '<br>'+__('Player ')+controInfo[i].player.name;
        additionalText += (controInfo[i].value===2) ? __(' has Contred') : __(' has Recontred');
    }
    showControDialog(currentThriumph,additionalText,doContro);
});

socket.on('contro-done',function(data){
    controInfo.push(data);
    showControDone(data);
});

socket.on('end-move',function(){
    enableClearPlayedCards();
});

socket.on('notify-thriumph', function (data){
    currentThriumph=data;
    writeMessage(__('Thriumph: ')+data);
});

socket.on('round-ended',function(data){
    currentThriumph=undefined;
    controInfo=[];
    var mult = data['multiplier'];
    //If is botifarra the score must be multiplied by two.
    if(data['botifarra'])
        mult = mult * 2;
    updateRoundScores(data['round-score'],mult);
    writeMessageDialog('Round Ended.<br> Team 1 :'+data['round-score'][1]+' - Team 2 :'+data['round-score'][2]);
});

socket.on('game-ended',function(data){
    writeMessage('Game Ended. Team '+data['winnerTeam']+' has winned');
    //TODO: On the GUI show all the game details and get an option to the player for clossing the game.
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
    socket.emit('chosen-thriumph',choise,function(err){
        if(err) writeMessage(err);
    });
}

function doContro(value){
    socket.emit('do-contro',{ 'value' : value});
}

function playCard(card,callback)
{
    if(yourTurn===0)
    {
        writeMessage(__('Is not your turn'));
        return;
    }
    if(currentAction)
        return;
    currentAction=true;
    socket.emit('new-roll',card,function(err){
        currentAction=false;
        if(err)
        {
            writeMessage(err);
            callback && callback(err);
            return;
        }
        yourTurn--;
        callback && callback();
   });
}

function joinGame(){
    if(!selected && selected != 0)
    {
        alert(__("You should select a game."));
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

function addBot(){
    if(!selected && selected != 0)
    {
        alert(__("You should select a game."));
        return;
    }
	socket.emit('add-bot', games[selected].id,function(err){
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
    if(card.suit==='Oros')
        score+=300;
    else if(card.suit==='Copes')
        score+=200;
    else if(card.suit==='Espases')
        score+=100;
    if(card.number===9 || card.number===1)
        score+=13;
    score+=card.number;
    return score;
}

/*
    Sorts the cards based on the follwing order:
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

