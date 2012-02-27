var util = require('util'),
    event = require('events');


var ButifarraGame = require('./butifarraGame'),
    ButifarraMove = require('./butifarraMove'),
    Card = require('./card'),
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
    this.multiplier=1;
    //Holds the number of do-contro events pending.
    this.pendingContros=[];
    //Holds the information about the current move. 
    var _move;
    //Holds the indexOf the last played player.
    var _lastPlayed=-1;

    //Internally hold the order of the players
    var _players = teams[1].concat(teams[2]);
    //Internally hold the players cards
    var _playersCards = {};
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
        this.multiplier=1;
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
        for(var i=0;i<_players.length;i++)
        {
            if(_players[i].isEqual(this.thriumpher))
            {
                _players[i].notify('select-thriumph',
                    ['Oros','Copes','Espases','Bastos','Botifarra','Delegar']);
            }
            var skey = _players[i].id || _players[i].name;
            _playersCards[skey]=_players[i].cards;
            _players[i].notify('cards',_players[i].cards);
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
        this.emit('notifyAll','end-move');
        this.moves.push(move);
        if(this.moves.length<12)
        {
            var winner = move.getWinner();
            for(var i=0;i<move.rolls.length;i++)
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
    this.newRoll = function(card,callback){
        //If the move is endend do nothing. 
        if(this.moves.length==12)
            return;
        var player= _players[_lastPlayed+1];
        var skey = player.id || player.name;
        var that=this;
        player.cards=_playersCards[skey];
        _move.addRoll(player,Card.create(card.number,card.suit),function(err){
            if(err)
            {
                callback && callback(err.message);
                return;
            }
            _lastPlayed++;
            player.cards = []; //To avoid sending it to all the clients
            var data = {
                "player" : player,
                "card" : card,
            };
            //Notify all the players the played card 
            that.emit('notifyAll','card-played',data);
            if(_lastPlayed===3)
            {
                //The move is ended
                that.emit('end-move',_move);
            }
            else
            {
                //Notify the next player to play a card: 
                _players[_lastPlayed+1].notify('play-card');
            }
            callback && callback();
        });
    }
    //Add the newRoll function to the new-roll events
    this.on('new-roll',this.newRoll);
    
    //Notify the correct players with the contro event.
    this.on('notify-contro',function(){
        this.pendingContros=[];
        //We have to notify the players that they have the option of doing a contro
        var team;
        if(this.multiplier === 2)
            team=this.thriumpher.team;
        else
            team= this.thriumpher.team===1 ? 2 : 1;
        for(var i=0;i<_players.length;i++)
        {
            var player = _players[i];
            if(player.team===team)
            {
                player.notify('contro');
                this.pendingContros.push(player);
            }
        }
    });
    
    this.doContro = function(data){
        var val  = data.value || false;
        //If test simply remove the player
        if(this.test)
        {
            this.pendingContros.pop();
        }
        else
        {
            var idx=0;
            //Find if the player is on the pendingCOntros list. If not do nothing.
            for(idx=0;idx<this.pendingContros.length;idx++)
            {
                if(this.pendingContros[idx].isEqual(data.player))
                    break;
            }
            //If the player is not on the list return
            if(idx>=this.pendingContros.length)
                return;
            //Remove the player from the pending list
            this.pendingContros.splice(idx,1);
        }
        if(val && this.multiplier<4)
        {
            this.multiplier=this.multiplier*2;
            var ret = {
                'value' : this.multiplier,
                'player' : data.player.name
            }
            this.emit('contro-done',ret);
            this.emit('notifyAll','contro-done',ret);
            //There is the posibility of the other players to do a contro
            if(this.multiplier===4)
            {
                this.pendingContros=[];
                this.emit('new-move',_players[1]);
            }
            else
                this.emit('notify-contro');
            //Notify the game that the round contro has been updated
            this.emit('update-contro',ret);
        }
        else if (this.pendingContros.length===0)
        {
            this.emit('new-move',_players[1]);
        }
    }
    this.on('do-contro',this.doContro);
    
    this.makeThriumph = function(choise,callback){
        if(this.thriumph) {
            callback && callback('Make thriumph is allowed once per round');
            return;
        }
        if(choise==='Delegar')
        {
            this.delegated=true;
            var team = this.teams[this.thriumpher.team];
            for(var i=0;i<team.length;i++)
            {
                if(team[i].isEqual(this.thriumpher)===false)
                {
                    this.thriumpher=team[i];
                    team[i].notify('select-thriumph',
                    ['Oros','Copes','Espases','Bastos','Botifarra']);
                    break;
                }
            }
        }
        else
        {
            //Notify all the players with the selected option
            this.emit('notifyAll','notify-thriumph',choise);
            //Notify the player who has the option to contro
            this.emit('notify-contro');
            this.thriumph=choise;
            this.emit('update-thriumph',this.thriumph,this.thriumpher);

        }
        callback && callback();

    }
    //Add the makeThriumph function to the made-triumph events
    this.on('chosen-thriumph',this.makeThriumph);

    /*
        Returns the score for each team.
    */
    this.getScores = function(){
        var ret = {1:0, 2:0};
        var temp = []
        for(team in [1,2])
        {
            if(!this.winnedCards[team])
                continue;
            for(var i=0;i<this.winnedCards[team].length;i++)
            {
                var card = this.winnedCards[team][i];
                temp.push(card);
                if(temp.length===4)
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

