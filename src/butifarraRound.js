var ButifarraGame = require('./butifarraGame'),
    Stack = require('./spanishCardStack');


/*
    Holds all the related stuff with a butifarra Round. 
*/
var ButifarraRound = function(teams,thriumpher,firstPlayer) {
    this.moves = [];
    
    this.thriumph;
    this.thriumpher=thriumpher;
    this.delegated=false;
    this.teams = teams;

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
        5. Notify the player to make thriumph
    */
    this.start = function(){
        var stack = Stack.create();
        _players=ButifarraGame.orderPlayers(_players,this.teams, this.thriumpher);
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
        _players.forEach(function(player){
            if(player==this.thriumpher) 
            {
                player.notify('make-triumph',
                    ['Oros','Copes','Espases','Bastos','Botifarra','Delegar'],
                    this.makeThriumph);
            }
            player.notify('cards',player.cards);
        });
    }
    
    this.makeThriumph = function(choise){
        if(this.thriumph) throw new Error('Make thriumph is allowed once per round');
        
        if(choise=='Delega')
        {
            this.delegated=true;
            var team = this.teams[this.thriumpher.team];
            for(i in team)
            {
                if(team[i]!=this.thriumpher)
                {
                    this.thriumpher=team[i];
                    team[i].notify('make-triumph',
                    ['Oros','Copes','Espases','Bastos','Botifarra'],
                    this.makeThriumph);
                }
            }
        }
        else
        {
            this.thriumph=choise;
            //TODO: Start the moves
        }

    }
    
};


module.exports.create = function(teams,triumpher,firstPlayer) {
    return new ButifarraRound(teams,triumpher,firstPlayer);
};

