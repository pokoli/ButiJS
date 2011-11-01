

var app = require('http').createServer(handler)
  , io = require('socket.io').listen(app)

io = require('socket.io');

var socket = io.connect('http://localhost');


  socket.on('news', function (data) {
    alert('hot news:'+data.hello);
    socket.emit('my other event', { my: 'data hola que tal' });
  });

