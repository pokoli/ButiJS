var conf = require('./database_configuration');
var mongoose = require('mongoose');
var butiSchema = require('./dbSchema');
var util = require('util');
var Player = require('./player');

mongoose.connect('mongodb://'+conf.host+'/'+conf.database);

var player = Player.create('Hola','test@koolpi.com');
player.save();
model = Player.Model;
model.findOne(function(err,player){
    console.log(player.name);
    console.log(player.email);
    process.exit();
});


