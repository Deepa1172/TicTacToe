const e = require('cors');
var express = require('express') ;
var app = express() ;
var server = require('http').Server(app);
var path = require('path') ;
var io = require('socket.io') (server);
var window ;
var rooms = 0;
// created arrays for updating roomNo
const roomInfo = [''];
const roomCapacity = [0];
const roomPrivate = [0];
var indexOfRoom ;
app.use(express.static(path.join(__dirname,'/public'))) ;

app.get('/',function(req,res){
    res.sendFile(path.join(__dirname+'/public/bg.html'));
});

app.get('/game',function(req,res){
  res.sendFile(path.join(__dirname+'/public/game.htm'));
});
  
io.on('connection', socket => {
  console.log('connection made');
  var roomNames = [];
  var indx = 0;
  console.log('Calling fetch_single_player_rooms');
  for (let i = 0; i < roomCapacity.length; i++) {
    console.log(roomCapacity[i]);
    console.log(roomPrivate[i]);
    if(roomCapacity[i] == 1 & roomPrivate[i] == 0){
      roomNames[indx] = roomInfo[i];
      indx = indx + 1;
    }
  }
  console.log(roomNames);
  socket.emit('activeRooms', roomNames);
  //create a new game room and notify the creator of the game
  socket.on('createGame', function(data) {
    socket.join('room-' + ++rooms);
    console.log('room-' + rooms);
    roomInfo[rooms] = 'room-'+ rooms.toString() ;
    //Checking socket-rooms
    console.log(socket.rooms);
    roomCapacity[rooms] = 1 ;
    console.log(roomInfo) ;
    console.log(roomCapacity) ;
    if (data.private_game == true) {
      roomPrivate[rooms] = 1;
    }
    else {
      roomPrivate[rooms] = 0;
    }
    console.log(roomInfo);
    console.log(roomCapacity);
    console.log(roomPrivate);
    socket.emit('newGame', {name: data.name, room: 'room-' + rooms});

  });
  socket.on('exit', (data) => {
    console.log('its disconnected roomNo',data) ;
    var msg = 'Your opponent got disconnected :(' ;
    socket.broadcast.to(data).emit('alertmsg' ,msg) ;
    socket.leave(data);
    console.log(socket.rooms);
    var roomIndex = roomInfo.indexOf(data.room) ;
    if(roomIndex !== -1){
      roomCapacity[roomIndex] == 2;
    }
    //location.replace = "bg.window.replace("bg.html");
    var itsok = socket.broadcast.to(data).emit('alertmsg' ,msg) ;
    if(itsok){
       function myFunction() {
      location.replace("bg.html")
    }
      
   
  }

   
    }) ;

  
  // join Game for player 2
  socket.on('joinGame',function(data){
    var roomIndex = roomInfo.indexOf(data.room) ;
    if( roomIndex !== -1){
     
      if (roomCapacity[roomIndex] == 1) {
      
        console.log("HIIIIII");
        socket.join(data.room) ;
        console.log(socket.rooms);
        socket.broadcast.to(data.room).emit('player1',{}) ;
        roomCapacity[roomIndex] = 2 ;
        console.log('its working') ;
        socket.emit('player2',{name:data.name,room :data.room}) ;
      } else {
       socket.emit('err' , {message:'Sorry,The room is full!'}) ;
      console.log('Room is full server') ;
      }
       
    } else{
      socket.emit('err' , {message:'The room does not exist'}) ;
      console.log('it does not') ;
    }
    
  }) ;
  
  

  /*Handle the turn played by either player and notify the  other*/
  
  socket.on('playTurn' , function(data) {
    socket.broadcast.to(data.room).emit('turnPlayed' ,{
      tile:data.tile ,
      room:data.room
    });
  });
  
  // added extra about declaring winner
  socket.on('declarewinner' , function(message) {
    console.log('declaring winner', message) ;
    socket.broadcast.to(message.room).emit('winner', {
      room:message.room ,
      name:message.winnername
    }) ;
  
  }) ;

  socket.on('tie', function(message) {
    console.log('tie function', message);
    socket.broadcast.to(message.room).emit('declaretie', {
      room : message.room,
      msg : message.tiemessage 
    });
  });

});

//Function to check roomNo of opponent who left

//

// server.listen(8000,() => {
//     console.log('listening to port') ;
// }) ;

let port = process.env.PORT;
if (port == null || port == "") {
  port = 8000;
}
server.listen(port, "0.0.0.0", () => {
  console.log(port);
  console.log('listening to port') ;
}) ;
