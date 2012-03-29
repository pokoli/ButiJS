var conf = require('./database_configuration');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var util = require('util');

mongoose.connect('mongodb://'+conf.host+'/'+conf.database);

var BlogPost = new Schema({
    author    : String
  , title     : String
  , body      : String
  , date      : Date
});

var BlogPost = mongoose.model('blog',BlogPost);
var milliseconds = new Date().getTime();

 
var myClass = function(){
    this.sayName = function(){
        console.log('My name is'+ this.author);
    }
}

util.inherits(BlogPost,myClass);

var instance = new BlogPost();
instance.author = 'Sergi Almacellas Abellana'
instance.title = 'Test'
myClass.sayName();
instance.save(function(err){
    if(i==num)
    {
        var time = new Date().getTime() - milliseconds;
        console.log('Process time: '+ time+ ' ms');
        console.log('All OK');
        process.exit(); 
    }
});
