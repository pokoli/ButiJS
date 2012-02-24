var util = require('util');

var Game = require('./game'),
    Round = require('./butifarraRound'),
    Stack = require('./spanishCardStack');    
    
/*
    Put the players in the correct other to the game flow. 
    @returns and array of players.
*/
function orderPlayers(players,teams,firstPlayer)
{
    //If firstplayer not especified would be the first on the array;
    firstPlayer = firstPlayer || players[0];
    var temp = new Array();
    var teamFirst = firstPlayer.team;
    var otherTeam= teamFirst === 1 ? 2 : 1;
    var firstPos= teams[teamFirst].indexOf(firstPlayer);
    temp.push(firstPlayer); //First the thriumber
    temp.push(teams[otherTeam][firstPos]); //The other player in the other team. 
    firstPos++; //Increment the position to get the other two players. 
    firstPos=firstPos %2;
    temp.push(teams[teamFirst][firstPos]);
    temp.push(teams[otherTeam][firstPos]);
    
    return temp;
}    
    

var ButifarraGame = function(name) {
    Game.Game.call(this,name);
    this.teams = {};
    this.score = {1:0,2:0};

    //Holds the number of the actual round
    this.round=0;
    //Holds the rounds played in the past;
    this.playedRounds=[];

    //Holds the last player to choose Thriumph
    var _thriumpher;

    /*
        Asigns a player to a team.
        Also assigns an empty tuple to each player for holding their cards
        Also initializes the scores for each team. 
    */
     this.assignTeams = function(){
        var teamA = [], teamB = [];
        this.players.forEach(function(player){
            var randomNumber = Math.floor(Math.random()*2000);
            if(randomNumber%2===0 && teamA.length < 2) {
                teamA.push(player);
                player.team=1;
            }
            else if (teamB.length < 2) {
                teamB.push(player);
                player.team=2;
            } 
            else 
            {
                teamA.push(player);
                player.team=1;
            }
            player.cards=[];
        });
        this.teams[1] = teamA;
        this.teams[2] = teamB;
        
        this.score[1]=0;
        this.score[2]=0;
    }
    /*
        Assigns a suit forEach player. 
        Takes one randomCard. 
        The player with the suit of that card is 
        TODO: ¿¿The players should see this process???
    */
    function assignFirstPlayerToChooseTriumph(players){
        var stack = Stack.create();
        stack.suits.forEach(function(value,idx){
            players[idx].suit=value;
        });
        stack.shuffle();
        var card = stack.next();
        players.forEach(function(player,idx){
            //If the player suit is equal to the card suit. The players is the next triumpher
            if(player.suit===card.suit)
            {
                _thriumpher=idx;
            }
            delete player.suit; 
        });
    }
    
    this.roundEnded = function(roundData){
        this.playedRounds[this.round]=roundData; //Refresh the round data.
        var roundScores=roundData.getScores();
        var winnerTeam,result;
        var tie=false;
        for(var i=0;i<roundScores.length;i++)
        {
            if(roundScores[i]>36) //We only compute the points above 36 (half of the stack)
            {
                winnerTeam=i;
                result=roundScores[i]-36;
            }
            else if (roundScores[i]===36) //Tie round
            {
                tie=true;
            }
        }
        var gameEnded=false;
        if(winnerTeam)
        {
            this.score[winnerTeam]+=result;
            if(this.score[winnerTeam]>100)
            {
                gameEnded=true;
            }
        }
        //TODO: Notify the players with the round result
        if(gameEnded)
        {
            this.emit('game-ended',this);
        }
        else
        {
            this.emit('start-new-round');
        }
    }
        
    /*
        Starts a new round. Has the following responsabilities: 
        1. Increment round number.
        2. Start a new round
    */
    this.startNewRound = function(){
        this.round++;
        var idFristplayer = _thriumpher+1;
        idFristplayer = idFristplayer % 4;
        var currentRound = Round.create(this.teams,this.players[_thriumpher],this.players[idFristplayer]);
        if(this.test)
            currentRound.test=true;
        currentRound.start();

        var game=this; //Save the object to call it latter.
        currentRound.on('round-ended',function(roundData){
            game.roundEnded(roundData);
        });
        currentRound.on('notifyAll',function(event,data,callback){
            game.notifyAll(event,data,callback);
        });

        currentRound.on('update-contro',function(data){
            if(game.round)
            {
                game.playedRounds[game.round-1].multiplier=data.val;
                game.notifyAll('updated-game',game);
            }
        });

        currentRound.on('update-thriumph',function(choise,thriumpher){
            if(game.round)
            {
                game.playedRounds[game.round-1].thriumph=choise;
                game.playedRounds[game.round-1].thriumpher=thriumpher;
                game.notifyAll('updated-game',game);
            }
        });

        this.playedRounds.push(currentRound);
        //Listen to the round Events
        for (event in currentRound._events)
        {
            this.on(event,function(){
                //Properly get the event from the arguments.
                var event = arguments.callee.caller.arguments[0];
                //Call the functions with the current round an the first argument
                if(Array.isArray(currentRound._events[event].length))
                {
                    for(var i=0;i<currentRound._events[event];i++)
                    {
                        var fn = currentRound._events[event][i];
                        fn.call(currentRound,arguments[0],arguments[1]);
                    }
                }
                else
                {
                    var fn = currentRound._events[event];
                    fn.call(currentRound,arguments[0],arguments[1]);
                }
            });
        }
        //this.emit('updated',this);
    }
    this.on('start-new-round',this.startNewRound);
    
    
    //Reference to the super start function.
    var super_start = this.start;
    /*
    This function initializes the game. Has the following responsabilities:
    0. Call super.start; 
    1. Assign a team to all the players. 
    2. Put the players in the correct order in seats.  
    3. Randomly assign the first player to choose triumph. 
    4. Start the first round.
    */
    this.start = function(){
        super_start.call(this,false);
        this.assignTeams();
        this.players=orderPlayers(this.players,this.teams);
        assignFirstPlayerToChooseTriumph(this.players);
        this.startNewRound();
        this.notifyAll('start',this);
    }
    
    var super_addPlayer = this.addPlayer;
    /*
        Override addPlayer to validate the number of players.
    */
    this.addPlayer = function(player){
        if(this.numberOfPlayers() === 4) throw new Error('The game is full');
        super_addPlayer.call(this,player)
    }
};
//Inherits from game
util.inherits(ButifarraGame, Game.Game);

module.exports.create = function(name) {
	var buti = new ButifarraGame(name);
	buti.min_players=4;
	return buti;
};

module.exports.clone = function(game) {
    var _game = Game.clone(game,ButifarraGame);
    _game.teams = game.teams || {};
    _game.score = game.score || {1:0,2:0};
    _game.round = game.round || 0;
    _game.playedRounds= game.playedRounds || [];
    return _game;
}
//Export orderPlayers function to reuse it in the Round Engine
module.exports.orderPlayers = orderPlayers;

