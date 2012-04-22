var util = require('util'),
    event = require('events'),
    i18n = require('i18n');


var ButifarraGame = require('./butifarraGame'),
    ButifarraMove = require('./butifarraMove'),
    Card = require('./card'),
    Stack = require('./spanishCardStack');



/*
    Holds all the related stuff with a butifarra Round. 
*/
var ButifarraRound = function(players,thriumpher,firstPlayer,firstThriumpher) {
    this.moves = [];
    
    this.thriumph;
    this.thriumpher=thriumpher;
    this.delegated=false;
    this.teams = { 1: [] , 2 : []};
    for(var i=0;i<players.length;i++){
        this.teams[players[i].team].push(players[i]);
    }
    this.winnedCards = {1: [], 2: []};
    this.multiplier=1;
    //Holds the number of do-contro events pending.
    this.pendingContros=[];
    //Holds the player that have done a contro.
    this.controPlayers=[];
    //Holds the information about the current move. 
    var _move;
    //Holds the indexOf the last played player.
    var _lastPlayed=-1;

    //Internally hold the order of the players
    var _players = players;
    //Internally hold the players cards
    var _playersCards = {};

    /*
        Starts a new round. Has the following responsabilities: 
        1. Increment round number.
        2. Shufle card stack.
        3. Put the players in the correct order in seats.     
        4. Deliver cards to players
        5. Notify the player to make thriumph
    */
    this.start = function(roundNumber){
        var stack = Stack.create();
        this.multiplier=1;
        _players=ButifarraGame.orderPlayers(players,this.teams, this.thriumpher,roundNumber);
        /*
            Deliver cards to the players.
            We start for index 1 because is the player in the right of the thriumber
            We deliver 4 cards per player;
        */
        for(var i=1;stack.left() > 0;i++)
        {   
            i=i%4;
            var newCards = stack.next(4);
            if(!this.test || _players[i].cards.length<12)
            {    //To be able to define the players cards on the test.
                _players[i].cards = _players[i].cards.concat(newCards);
            }

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
        var i=0;
        for(i=0;i<_players.length;i++)
        {
            if(_players[i].isEqual(firstPlayer))
                break;
        }
        var temp=[];
        for(var j=0;j<_players.length;j++)
        {
            temp.push(_players[i]);
            i++;
            i=i%4;
        }
        _players=temp;
//        _players=ButifarraGame.orderPlayers(_players,this.teams,firstPlayer);
        _move = ButifarraMove.create(this.thriumph);
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
        var winner = move.getWinner();
        for(var i=0;i<move.rolls.length;i++)
        {
            this.winnedCards[winner.team].push(move.rolls[i].card);
        }
        if(this.moves.length<12)
        {
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
        if(!card || (!card.number && !card.suit))
        {
            callback && callback(i18n.__('Card must be defined'));
            return;
        }
        var card = Card.create(card.number,card.suit);
        _move.addRoll(player,card,function(err,sugestions){
            if(err)
            {
                callback && callback(err.message,sugestions);
                return;
            }
            _lastPlayed++;
            //Remove the played card
            var i;
            for(i=0;i<_playersCards[skey].length;i++)
            {
                if(_playersCards[skey][i].number===card.number &&
                    _playersCards[skey][i].suit===card.suit)
                    break;
            }
            _playersCards[skey].splice(i,1);
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
            this.controPlayers.push(data.player);
            var ret = {
                'value' : this.multiplier,
                'player' : data.player
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
            callback && callback(i18n.__('Make thriumph is allowed once per round'));
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
            //If the round is delegated notify it to the clients
            var notifyData = choise;
            if(this.delegated)
                notifyData += ' '+i18n.__('(Delegated)');
            //Notify all the players with the selected option
            this.emit('notifyAll','notify-thriumph',notifyData);
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
        for(var team=1;team<=2;team++)
        {
            if(!this.winnedCards[team])
                continue;
            for(var i=0;i<this.winnedCards[team].length;i++)
            {
                temp.push(this.winnedCards[team][i]);
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


module.exports.create = function(teams,triumpher,firstPlayer,firstThriumpher) {
    return new ButifarraRound(teams,triumpher,firstPlayer,firstThriumpher);
};

