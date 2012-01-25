var util = require('util'),
    event = require('events');


var ButifarraGame = require('./butifarraGame'),
    ButifarraMove = require('./butifarraMove'),
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
    this.winnedCards = {1: [], 2: []};
    
    //Holds the information about the current move. 
    var _move;
    //Holds the indexOf the last played player.
    var _lastPlayed=-1;

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
        for(i in _players)
        {
            var player = _players[i];
            if(player.name == this.thriumpher.name)
            {
                player.notify('make-thriumph',
                    ['Oros','Copes','Espases','Bastos','Botifarra','Delegar'],
                    this.makeThriumph);
            }
            player.notify('cards',player.cards);
        }
        this.emit('round-started');
    }
    
    /*
        Called every time that a new move is Started.    
    */
    this.newMove = function(firstPlayer){
        //Put the players in the correct order
        _players=ButifarraGame.orderPlayers(_players,this.teams,firstPlayer);
        _move = ButifarraMove.create();
        if(this.test)
            _move.test=true;
        _players[0].notify('play-card');
        _lastPlayed=-1;
    }
    //Add the newMove function to the new-move events
    this.on('new-move',this.newMove);
    
    /*
        Called every time that a move is Ended
    */
    this.moveEnded = function(move){
        this.moves.push(move);
        if(this.moves.length<12)
        {
            var winner = move.getWinner();
            for(i in move.rolls)
            {
                var card=move.rolls[i].card;
                this.winnedCards[winner.team].push(card);
            }
            this.emit('new-move',winner);
        }
        else
        {
            this.emit('round-ended',this);
        }
    }
    //Add the newMove function to the new-move events
    this.on('end-move',this.moveEnded);
    
    /*
        Called every time that a player Rolls a card
    */
    this.newRoll = function(card){
        var player= _players[_lastPlayed+1];
        try{
            _move.addRoll(player,card);
            _lastPlayed++;
            var data = {
                "player" : player,
                "card" : card,
            };
            //Notify all the players the played card 
            this.emit('notifyAll','card-played',data);
            if(_lastPlayed==3)
            {
                //The move is ended
                this.emit('end-move',_move);
            }
            else
            {
                //Notify the next player to play a card: 
                _players[_lastPlayed+1].notify('play-card');
            }
            
        }catch(Error){
            player.notify('invalid-roll',Error);   
        }
    }
    //Add the newRoll function to the new-roll events
    this.on('new-roll',this.newRoll);
    
    
    
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
            this.emit('new-move',_players[1]);
        }
        
        //Notify all the players with the selected option
        _players.forEach(function(player){
            player.notify('thriumph',choise);
        });

    }
    //Add the makeThriumph function to the made-triumph events
    this.on('made-thriumph',this.makeThriumph);

    /*
        Returns the score for each team.
    */
    this.getScores = function(){
        var ret = {1:0, 2:0};
        var temp = []
        for(team in [1,2])
        {
            for(i in this.winnedCards[team])
            {
                var card = this.winnedCards[team][i];
                temp.push(card);
                if(temp.length==4)
                {
                    ret[team]= ret[team]+ButifarraMove.calculatePoints(temp);
                    temp=[];
                }
            }
        }
        return ret;
    }
};

//Inherits from EventEmitter so we can manage the events of the round.
util.inherits(ButifarraRound, event.EventEmitter);


module.exports.create = function(teams,triumpher,firstPlayer) {
    return new ButifarraRound(teams,triumpher,firstPlayer);
};

