var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Player = new Schema({
    name            : String
  , email           : String
  , playedGames     : Number
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
  , thriumpher  : Player
});

var Teams = new Schema({
    1           : [Players]
  , 2           : [Players]
});

var TeamsScore = new Schema({
    1           : Number
  , 2           : Number
});

module.exports.ButifarraGame = new Schema({
    rounds      : [Round]
    teams       : [Teams]
    score       : TeamsScore
});
