var ButifarraGame = require('./butifarraGame'),
    Stack = require('./spanishCardStack');


/*
    Holds all the related stuff with a butifarra Round. 
*/
var ButifarraRound = function(teams,thriumpher,firstPlayer) {
    this.moves = [];
    
    this.thriumpher=thriumpher;
    _teams = teams;

    //Internally hold the order of the players
    var _players = teams[1].concat(teams[2]);
    //Function to call at the end of the round.
    var _callback;
    //Hols the first player to take action
    var _firstPlayer = firstPlayer;
    /*
        Starts a new round. Has the following responsabilities: 
        1. Increment round number.
        2. Shufle card stack.
        3. Put the players in the correct order in seats.     
        4. Deliver cards to players
        
        @params callback: Accecpts a callback called at the end of the process
    */
    this.start = function(callback){
        _callback=callback;
        var stack = Stack.create();
        _players=ButifarraGame.orderPlayers(_players,_teams, this.thriumpher);
        /*
            Deliver cards to the players.
            We start for index 1 because is the player in the right of the thriumber
            We deliver 4 cards per player;
        */
        for(var i=1;stack.left() > 0;i++)
        {   
            i=i%4;
            _players[i].cards = _players[i].cards.concat(stack.next(4));            

        }
        //TODO: Notify players with their cards
    }
    
};


module.exports.create = function(teams,triumpher,firstPlayer,callback) {
    return new ButifarraRound(teams,triumpher,firstPlayer,callback);
};

