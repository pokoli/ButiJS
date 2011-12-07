var util = require('util');

var Game = require('./game'),
    Stack = require('./spanishCardStack');

var ButifarraGame = function() {
    Game.Game.call(this);
    this.teams = {};
    this.score = {};
    this.stack = Stack.create();
    //Holds the actual rounds
    this.round=0;
    
    
    //Holds the last player to choose Thriumph
    var _thriumpher;
    
    function assignTeams(players,teams){
        var teamA = [], teamB = [];
        players.forEach(function(player){
            var randomNumber = Math.floor(Math.random()*2000);
            if(randomNumber%2==0 && teamA.length < 2) {
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
        });
        teams[1] = teamA;
        teams[2] = teamB;
    }
    /*
        Assigns a suit forEach player. 
        Takes one randomCard. 
        The player with the suit of that card is 
        TODO: ¿¿The players should see this process???
    */
    function assignFirstPlayerToChooseTriumph(players,stack){
        stack.suits.forEach(function(value,idx){
            players[idx].suit=value;
        });
        stack.shuffle();
        var card = stack.next();
        stack.reset();
        players.forEach(function(player){
            //If the player suit is equal to the card suit. The players is the next triumpher
            if(player.suit==card.suit)
            {
                _thriumpher=player;
            }
            delete player.suit; 
        });
    }
    
    /*
        Starts a new round. Has the following responsabilities: 
        1. Increment round number.
        2. Shufle card stack.
        3. Deliver cards to players
    */
    this.startNewRound = function(){
        this.round++;
        this.stack.shuffle();
        //TODO: Deliver cards
    }
    
    //Reference to the super start function.
    var super_start = this.start;
    /*
    This function initializes the game. Has the following responsabilities:
    0. Call super.start; 
    1. Assign a team to all the players. 
    2. Randomly assign the first player to choose triumph. 
    3. Start the first round.
    */
    this.start = function(){
        super_start.call(this);
        assignTeams(this.players,this.teams);;
        assignFirstPlayerToChooseTriumph(this.players,this.stack);
        this.startNewRound();
    }
    
};
//Inherits from game
util.inherits(ButifarraGame, Game.Game);

module.exports.create = function() {
	var buti = new ButifarraGame();
	buti.min_players=4;
	return buti;
};

