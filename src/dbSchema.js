var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Player = new Schema({
    name            : String
  , email           : String
  , playedGames     : Number
  , winnedGames     : Number
});
module.exports.Player = Player;

var Card = new Schema({
    number      : Number
  , suit        : String
});

var Roll = new Schema({
    card        : [Card]
  , player      : [Player]
});

var Move = new Schema({
    rolls       : [Roll]
});

var Round = new Schema({
    moves       : [Move]
  , thriumph    : String
  , delegated   : Boolean
  , thriumpher  : { type: Schema.ObjectId, ref: 'Player' }
});

var Teams = new Schema({
    1           : [Player]
  , 2           : [Player]
});

var TeamsScore = new Schema({
    1           : Number
  , 2           : Number
});

var Game = new Schema({
    name        : String
  , players     : [Player]
  , state       : String
  , rounds      : [Round]
  , teams       : [Teams]
  , score       : [TeamsScore]
});
module.exports.ButifarraGame = Game

mongoose.model('player', Player);
mongoose.model('game', Game);

