var Game = process.env.COVERAGE ? require('../src-cov/butifarraGame') : require('../src/butifarraGame'),
	Player = process.env.COVERAGE ? require('../src-cov/player') : require('../src/player'),
	Stack = process.env.COVERAGE ? require('../src-cov/spanishCardStack') : require('../src/spanishCardStack'),
	Card = process.env.COVERAGE ? require('../src-cov/card') : require('../src/card'),
	should = require ('should');

var game = Game.create();
var player1 = Player.create('John');
var player2 = Player.create('Mark');
var player3 = Player.create('Steve');
var player4 = Player.create('Bill');

module.exports = {
    "Butifarra should responTo game's basic methods" : function () {
        game.should.respondTo('numberOfPlayers');
        game.should.respondTo('addPlayer');
        game.should.respondTo('start');
    },
    "Butifarra consits of teams, scores and a players" : function() {
        game.should.have.property('teams');
        game.should.have.property('score');
        game.should.have.property('players');
    },
    "A butifarraGame needs 4 players to start" : function() {
        game.min_players.should.eql(4);
        should.throws(function(){
            game.start();
        },Error,"Not enough playerss");
        player1.join(game);
        player2.join(game);
        player3.join(game);
        player4.join(game);
        should.doesNotThrow(function(){
            game.start();
        },Error,"Not enough players");        
    },
    "A butifarraGame can't hold more than 4 players" : function() {
        game.min_players.should.eql(4);
        should.throws(function(){
            var newPlayer = Player.create('Tom');
            newPlayer.join(game);
        },Error,"The game is full");
    },
    "When the game is started round should be 1 and state running" : function() {
        game.round.should.eql(1);
        game.state.should.eql('running');
    },
    "When the game is started all teams must have 2 players" : function() {
        game.teams[1].length.should.eql(2);
        game.teams[2].length.should.eql(2);
    },
    "When the game is started all the players should be in order (beetween the others team players)" : function() {
        var lastTeam=0;
        game.players.forEach(function(player){
            player.team.should.not.eql(lastTeam);
            lastTeam=player.team;
        });
    },
    "The orderPlayer function must order the players the game flow order" : function() {
        player1.team=1;
        player2.team=1;
        player3.team=2;
        player4.team=2;
        var teams = {
            1 : [player1,player2],
            2 : [player3,player4],
        }
        var players = [player1,player2,player3,player4];
        var ordered = Game.orderPlayers(players,teams,player3);
        ordered.shift().should.eql(player3);
        ordered.shift().should.eql(player1);
        ordered.shift().should.eql(player4);
        ordered.shift().should.eql(player2);
        var ordered = Game.orderPlayers(players,teams,player3);
        var ordered2 = Game.orderPlayers(players,teams,player3);
        ordered.should.eql(ordered2);
        var ordered = Game.orderPlayers(players,teams,player2);
        ordered.shift().should.eql(player2);
        ordered.shift().should.eql(player4);
        ordered.shift().should.eql(player1);
        ordered.shift().should.eql(player3);
    },
    "After playing a round, the scores are updated": function(done){
        function testWinner(move,winner,points)
        {
            move.getWinner().isEqual(winner).should.be.true;
            move.getValue().should.eql(points);
        }

        function testNoError(err)
        {
            should.ifError(err);
        }

        var game = Game.create('Test Game');
        game.test=true;
        var one = Player.create('1');
        var two = Player.create('2');
        var three = Player.create('3');
        var four = Player.create('4');
        one.id=1;
        one.team=1;
        one.cards=[
            Card.create(1,'Oros'),Card.create(6,'Oros'),Card.create(5,'Oros'),Card.create(2,'Oros'),
            Card.create(1,'Copes'),Card.create(4,'Copes'),Card.create(2,'Copes'),Card.create(7,'Espases'),
            Card.create(5,'Espases'),Card.create(2,'Espases'),Card.create(11,'Bastos'),Card.create(10,'Bastos'),
        ];
        two.id=2;
        two.team=1;
        two.cards=[
            Card.create(10,'Oros'),Card.create(3,'Oros'),Card.create(9,'Copes'),Card.create(12,'Copes'),
            Card.create(7,'Copes'),Card.create(5,'Copes'),Card.create(9,'Espases'),Card.create(8,'Espases'),
            Card.create(6,'Espases'),Card.create(3,'Espases'),Card.create(9,'Bastos'),Card.create(1,'Bastos'),
        ];
        three.id=3;
        three.team=2;
        three.cards=[
            Card.create(9,'Oros'),Card.create(8,'Oros'),Card.create(10,'Copes'),Card.create(1,'Espases'),
            Card.create(12,'Espases'),Card.create(11,'Espases'),Card.create(4,'Espases'),Card.create(8,'Bastos'),
            Card.create(7,'Bastos'),Card.create(6,'Bastos'),Card.create(3,'Bastos'),Card.create(2,'Bastos'),
        ];
        four.id=4;
        four.team=2;
        four.cards=[
            Card.create(12,'Oros'),Card.create(11,'Oros'),Card.create(7,'Oros'),Card.create(4,'Oros'),
            Card.create(11,'Copes'),Card.create(8,'Copes'),Card.create(6,'Copes'),Card.create(3,'Copes'),
            Card.create(10,'Espases'),Card.create(12,'Bastos'),Card.create(5,'Bastos'),Card.create(4,'Bastos'),
        ];
        game.firstToTriumph=four;

        one.join(game);
        two.join(game);
        four.join(game);
        three.join(game);

        game.start();

        game.state.should.eql('running');
        game.teams[1].should.eql([one,two]);
        game.teams[2].should.eql([four,three]);

        var tmp=[];
        for(var i=0;i<game.players.length;i++)
            tmp.push(game.players[i].name);
        tmp.should.eql(['4','1','3','2']);

        //Triumpher = four -> Delegar
        game.emit('chosen-thriumph','Delegar',testNoError);
        //Triumpher = three -> Bastos
        game.emit('chosen-thriumph','Bastos',testNoError);
        game.playedRounds[game.round-1].thriumph.should.eql('Bastos');
        game.playedRounds[game.round-1].delegated.should.eql(true);
        // one no contra
        game.emit('do-contro',{value: false, player: one},testNoError);
        // two no contra.
        game.emit('do-contro',{value: false, player: two},testNoError);

        var jugades = [];
        var winners = [];
        var points = [];

        jugades.push(function(){
            // Es el torn de 1 -> 6 Oros
            game.emit('new-roll',Card.create(6,'Oros'),testNoError);
            // Es el torn de 3 -> 8 Oros
            game.emit('new-roll',Card.create(8,'Oros'),testNoError);
            // Es el torn de 2 -> 10 Oros
            game.emit('new-roll',Card.create(10,'Oros'),testNoError);
            // Es el torn de 4 -> 12 Oros
            game.emit('new-roll',Card.create(12,'Oros'),testNoError);
        });
        // Guanya el jugador 4, 5 punts per l'equip 2.
        winners.push(four);
        points.push(5);

        jugades.push(function(){
            // Es el torn de 4 -> 10 Espases
            game.emit('new-roll',Card.create(10,'Espases'),testNoError);
            // Es el torn de 1 -> 2 Espases
            game.emit('new-roll',Card.create(2,'Espases'),testNoError);
            // Es el torn de 3 -> 4 Espases
            game.emit('new-roll',Card.create(4,'Espases'),testNoError);
            // Es el torn de 2 -> 9 Espases
            game.emit('new-roll',Card.create(9,'Espases'),testNoError);
        });
        // Guanya el jugador 2, 7 punts per l'equip 1.
        winners.push(two);
        points.push(7);

        jugades.push(function(){
            // Es el torn de 2 -> 9 Copes
            game.emit('new-roll',Card.create(9,'Copes'),testNoError);
            // Es el torn de 4 -> 3 Copes
            game.emit('new-roll',Card.create(3,'Copes'),testNoError);
            // Es el torn de 1 -> 1 Copes
            game.emit('new-roll',Card.create(1,'Copes'),testNoError);
            // Es el torn de 3 -> 10 Copes
            game.emit('new-roll',Card.create(10,'Copes'),testNoError);
        });
        // Guanya el jugador 2, 11 punts per l'equip 1.
        winners.push(two);
        points.push(11);

        jugades.push(function(){
            // Es el torn de 2 -> 12 Copes
            game.emit('new-roll',Card.create(12,'Copes'),testNoError);
            // Es el torn de 4 -> 6 Copes
            game.emit('new-roll',Card.create(6,'Copes'),testNoError);
            // Es el torn de 1 -> 2 Copes
            game.emit('new-roll',Card.create(2,'Copes'),testNoError);
            // Es el torn de 3 -> 2 Bastos
            game.emit('new-roll',Card.create(2,'Bastos'),testNoError);
        });
        // Guanya el jugador 3, 4 punts per l'equip 2.
        winners.push(three);
        points.push(4);

        jugades.push(function(){
            // Es el torn de 3 -> 6 Bastos
            game.emit('new-roll',Card.create(6,'Bastos'),testNoError);
            // Es el torn de 2 -> 1 Bastos
            game.emit('new-roll',Card.create(1,'Bastos'),testNoError);
            // Es el torn de 4 -> 4 Bastos
            game.emit('new-roll',Card.create(4,'Bastos'),testNoError);
            // Es el torn de 1 -> 11 Bastos
            game.emit('new-roll',Card.create(11,'Bastos'),testNoError);
        });
        // Guanya el jugador 2, 7 punts per l'equip 1
        winners.push(two);
        points.push(7);

        jugades.push(function(){
            // Es el torn de 2 -> 3 Oros
            game.emit('new-roll',Card.create(3,'Oros'),testNoError);
            // Es el torn de 4 -> 11 Oros
            game.emit('new-roll',Card.create(11,'Oros'),testNoError);
            // Es el torn de 1 -> 1 Oros
            game.emit('new-roll',Card.create(1,'Oros'),testNoError);
            // Es el torn de 3 -> 9 Oros
            game.emit('new-roll',Card.create(9,'Oros'),testNoError);
        });
        // Guanya el jugador 3, 12 punts per l'equip 2.
        winners.push(three);
        points.push(12);

        jugades.push(function(){
            // Es el torn de 3 -> 7 Bastos
            game.emit('new-roll',Card.create(7,'Bastos'),testNoError);
            // Es el torn de 2 -> 9 Bastos
            game.emit('new-roll',Card.create(9,'Bastos'),testNoError);
            // Es el torn de 4 -> 5 Bastos
            game.emit('new-roll',Card.create(5,'Bastos'),testNoError);
            // Es el torn de 1 -> 10 Bastos
            game.emit('new-roll',Card.create(10,'Bastos'),testNoError);
        });
        // Guanya el jugador 2, 7 punts per l'equip 1.
        winners.push(two);
        points.push(7);

        jugades.push(function(){
            // Es el torn de 2 -> 8 Espases
            game.emit('new-roll',Card.create(8,'Espases'),testNoError);
            // Es el torn de 4 -> 12 Bastos
            game.emit('new-roll',Card.create(12,'Bastos'),testNoError);
            // Es el torn de 1 -> 5 Espases
            game.emit('new-roll',Card.create(5,'Espases'),testNoError);
            // Es el torn de 3 -> 1 Espases
            game.emit('new-roll',Card.create(1,'Espases'),testNoError);
        });
        // Guanya el jugador 4, 8 punts per l'equip 2.
        winners.push(four);
        points.push(8);

        jugades.push(function(){
            // Es el torn de 4 -> 11 Copes
            game.emit('new-roll',Card.create(11,'Copes'),testNoError);
            // Es el torn de 1 -> 4 Copes
            game.emit('new-roll',Card.create(4,'Copes'),testNoError);
            // Es el torn de 3 -> 11 Espases
            game.emit('new-roll',Card.create(11,'Espases'),testNoError);
            // Es el torn de 2 -> 5 Copes
            game.emit('new-roll',Card.create(5,'Copes'),testNoError);
        });
        // Guanya el jugador 4, 5 punts per l'equip 2.
        winners.push(four);
        points.push(5);

        jugades.push(function(){
            // Es el torn de 4 -> 8 Copes
            game.emit('new-roll',Card.create(8,'Copes'),testNoError);
            // Es el torn de 1 -> 2 Oros
            game.emit('new-roll',Card.create(2,'Oros'),testNoError);
            // Es el torn de 3 -> 12 Espases
            game.emit('new-roll',Card.create(12,'Espases'),testNoError);
            // Es el torn de 2 -> 7 Copes
            game.emit('new-roll',Card.create(7,'Copes'),testNoError);
        });
        // Guanya el jugador 4, 4 punts per l'equip 2.
        winners.push(four);
        points.push(4);

        jugades.push(function(){
            // Es el torn de 4 -> 7 Oros
            game.emit('new-roll',Card.create(7,'Oros'),testNoError);
            // Es el torn de 1 -> 5 Oros
            game.emit('new-roll',Card.create(5,'Oros'),testNoError);
            // Es el torn de 3 -> 3 Bastos
            game.emit('new-roll',Card.create(3,'Bastos'),testNoError);
            // Es el torn de 2 -> 3 Espases
            game.emit('new-roll',Card.create(3,'Espases'),testNoError);
        });
        // Guanya el jugador 3, 1 punts per l'equip 2.
        winners.push(three);
        points.push(1);

        jugades.push(function(){
            // Es el torn de 3 -> 8 Bastos
            game.emit('new-roll',Card.create(8,'Bastos'),testNoError);
            // Es el torn de 2 -> 6 Espases
            game.emit('new-roll',Card.create(6,'Espases'),testNoError);
            // Es el torn de 4 -> 4 Oros
            game.emit('new-roll',Card.create(4,'Oros'),testNoError);
            // Es el torn de 1 -> 7 Espases
            game.emit('new-roll',Card.create(7,'Espases'),testNoError);
        });
        // Guanya el jugador 3, 1 punts per l'equip 2.
        winners.push(three);
        points.push(1);
        //Final de la ronda.
        //Resultat parcial de la ronda:
        //   - Equip 1: 32 punts
        //   - Equip 2: 40 punts
        //   - S'augmenten 4 punts al marcador de l'equip 2.
        game.playedRounds[game.round-1].on('round-ended',function(data){
            var roundScores = data.getScores();
            roundScores[1].should.eql(32);
            roundScores[2].should.eql(40);
            game.score[1].should.eql(0);
            game.score[2].should.eql(4);
            done();
        });
        //Comensa una nova ronda.
        //FIN
        jugades.length.should.eql(winners.length);
        winners.length.should.eql(points.length);

        var rounds=0;
        game.playedRounds[game.round-1].on('end-move',function(data){
            testWinner(data,winners[rounds],points[rounds]);
            rounds++;
            if(jugades[rounds])
            {
                jugades[rounds]();
            }
        });
        //Make the first move
        jugades[rounds]();
    }
    
}   
