function init() {
    const P1 = 'X';
    const P2 = 'O';
    let player;
    let game;
    var typing = false ;
//     //Scoket io begins
//     var socket = io() ;

//     //create game event created
//     $('#new').on('click', function() {
//         var name = $('#nameNew').val();
//         if (!name) {
//           alert('Please enter your name');
//           return;
//         }
//         socket.emit('createGame', {name: name});
//         palyer = new Player(name, P1);
//     });

//     // new game created by current client. Updtae the UI and create new Game var..
//     socket.on('newGame', function(data){
//       var message = 'Hello ' + data.name + '<br>' + 'Please ask your friend to enter Game Id : ' + data.room + '.<br>Waiting for Player 2 ...';
//       console.log(message);
//       //Create game for player 1 
//       game = new Game(data.room);
//       game.displayBoard(message);
//     }); 


//     //join an existing game on the entered roomId.emit the join
// $('#join').on('click',function(){
//   var name = $('#nameJoin').val() ;
//   var roomID = $('#room').val() ;
//   if (!name || !roomID){
//     alert('please enter your name and game ID ')  ;
//     return ;
//   }
//   socket.emit('joinGame' , {name : name , room:roomID}) ;
//   player = new Player(name,P2) ;
// });

// // If player creates the game, he'll be P1(x) and has the first turn.
// // This event is received when oppent connects to the room.

//   socket.on('player1', function(data) {
//     var message = 'Hello ' + player.getPlayerName();
//     $('userHello').html(message);
//     player.setCurrentTurn(true);
//   });

//   // Joined the game, so player is P2(O) 
//   // This event is received when P2 successfully joins the game room.

//   socket.on('player2', function(data) {
//     var message = 'Hello ' + data.name;
//     game = new Game(data.room);
//     game.displayBoard(message);
//     player.setCurrentTurn(false);
//   });

    //Player class
    class Player {
        constructor(name, player_type) {
          this.name = name;
          this.player_type = player_type;
          this.currentTurn = true;
          this.movesPlayed = 0; //each tile possesses a number which is a power of 2 (for simplicity of left shift operator)
        }
        static get wins() {
          return [7, 56, 448, 73, 146, 292, 273, 84];
        }
        getPlayerName() { //Returns name of the current user
          return this.name;
        }
        getPlayerType() { //Return type as in 'X' or 'O'
          return this.player_type;
        }
        getCurrentTurn() { //Returns whether it is your turn in terms of true or false
          return this.currentTurn;
        }
        getMovesPlayed() { //Returns the current value of moves played variable 
          return this.movesPlayed;
        }

        updateMovesPlayed(tileValue) { // Summing up the tile values till the moves played
          this.movesPlayed += tileValue;
          console.log(this.movesPlayed);
        }

        setCurrentTurn(turn) { // Setting user's current turn to false, once his/her is done
          this.currentTurn = turn;
          const message = turn ? 'Your turn' : 'Waiting for Opponent';
          $('#turn').text(message);
        }
    }
//Game class begins

class Game {
    constructor(roomId) {
      this.roomId = roomId;
      this.board = [[],
                    [],[]]; // Declared as such in JavaScript
      this.moves = 0;
    }

    displaywinner(message){
      console.log('Display winner function') ;
      $('.gameBoardcontainer').css('display','none') ;
      $('.winner').css('display','block') ;
      //adding confetti  effect
      // $('#bodyTag').append('<script type="text/javascript" src="main.js" ></script>') ;

      $("body").addClass("winnerPage");
      $("body").removeClass("gamePage");

      if (message == 'Game Tied !!') {
        $('#congrats').html('Oops...');
        $('#congrats').css("left", "40%");
        $('.winnername').html(message) ;
        $('.winnername').css("left", "36%") ;
      } else {
        $('#congrats').html('Congratulations');
        $('.winnername').html('Winner is ' + message) ;
      }
    }

    displayBoard(message) {
      console.log("Message from display Board function : ", message);
      $('.menu').css('display', 'none');
      $('.gameBoardcontainer').css('display', 'block');

      // added new
      $("body").addClass("gamePage");
      $("body").removeClass("formPage");

      if ($('#userHello').text().length == 0) {
          $('#userHello').html(message);
      } else {
          $('#userHello').text("");
      }
      // if (($('#userHello').text()).length == 0) {
      //   $('#userHello').html(message);
      // } else {
      //   $('#userHello').text("");
      // }
      this.createGameBoard();
    }

    getRoomId() {
      return this.roomId;
    }

    
//changed the i tag
    updateBoard(player_type, row, col, tile) {
      if (player_type == 'X') {
        $(`#${tile}`).append('<i class="fa fa-times" aria-hidden="true" style = "color:orange;"></i>').prop('disabled', true);
      } else {
        $(`#${tile}`).append('<i class="far fa-circle" aria-hidden="true" style = "color:yellow;"></i>').prop('disabled', true);
      }
      this.board[row][col] = player_type;
      this.moves++;
      // to comment
      //console.log(this.board[row][col]);
      //console.log(this.board);
    }

    playTurn(tile) {
      const clickedTile = $(tile).attr('id');
      var turnObj = {
        tile :clickedTile ,
        room :this.getRoomId()
      } ;
      //emit an eventto  update  other player that you have played 
      socket.emit('playTurn' , turnObj) ;
    }

    checkTie() {
      return this.moves >= 9;
    }

    announceWinner() {
      console.log("ANNOUNCE WINNER FUNCTION ....") ; 
      //Added extra "message"

     var message= {
        room : this.getRoomId() ,
        winnername:player.getPlayerName() 
      } ;

      console.log(message) ;
      socket.emit('declarewinner' , message) ;
      game.displaywinner(player.getPlayerName()) ;
      //alert(message);
     // location.reload();
    }

    checkWinner() {
      var currentPlayerPositions = player.getMovesPlayed();
      var flag = 0;
      Player.wins.forEach(function (winningPosition) {
        if ((winningPosition & currentPlayerPositions) == winningPosition) {
            console.log("WINNERRRR");  
            flag = 1;
            game.announceWinner();
        }
      });
  
     
      if (this.checkTie() && flag == 0) {
        const tiemessage = 'Game Tied !!';
        console.log('Check tie function called .. ');
        var message = {
          room : this.getRoomId() ,
          tiemessage 
        } ;
        console.log(message);
        socket.emit('tie', message);
        game.displaywinner(tiemessage) ;
      }

    }

    // End the game if the other player won.
    // endGame(message) {
    //   alert(message);
    //   console.log("END GAME CALLED") ;
    //   location.reload();
  
    //   }

    createGameBoard() {  

        // adding new 
        $('#end').on('click', function() {
            console.log(player.getPlayerName());
            console.log(game.getRoomId());
            socket.emit('exit' , game.getRoomId()) ;
            location.replace("bg.html");
        });

        for (var i = 0 ; i < 3 ; i++) {
          this.board.push(['','' ,'']) ;
          for (var j = 0 ; j < 3 ; j++) {
            $('#button_' + i + '' + j).on('click',function(){
              if (!player.getCurrentTurn()) {
                alert('Its not your turn!') ;
                return  ;
              }
              if ($(this).prop('disabled')) {
                alert("this tile has been already played on!") ;
              }
              var row = parseInt(this.id.split('_')[1][0] );
              var col = parseInt(this.id.split('_')[1][1]) ;
              console.log('row' ,  row) ;
              console.log('col' , col ) ;
              //update board after your turn.

              game.playTurn(this) ;
              game.updateBoard(player.getPlayerType(),row,col,this.id);
              player.setCurrentTurn(false) ;
              player.updateMovesPlayed(1<<(row * 3 + col)) ;

              game.checkWinner();

            });
          }
        }
        
      }
        
        //FOR LEFT ALIGN
       
        
         
    /*
          const tieMessage = 'Game Tied :(';
          if (this.checkTie()) {
            socket.emit('gameEnded', {
              room: this.getRoomId(),
              message: tieMessage,
            });
            alert(tieMessage);
            location.reload();
          }
          
        }*/

    
    
}
    //Scoket io begins
    var socket = io() ;

    //create game event created
    $('#new').on('click', function() {
        var name = $('#nameNew').val();
        var private = $("#invite_only").is(':checked');
        console.log(private);
        console.log(typeof(private));
        if (!name) {
          alert('Please enter your name');
          return;
        }
        socket.emit('createGame', {name: name, private_game:private});
        player = new Player(name, P1);
    });

    // new game created by current client. Updtae the UI and create new Game var..
    socket.on('newGame', function(data){
      var message = 'Hello ' + data.name + '<br>' + 'Please ask your friend to enter Game Id : ' + data.room + '.<br>Waiting for Player 2 ...';
      console.log(message);
      //Create game for player 1 
      game = new Game(data.room);
      game.displayBoard(message);
    }); 

     
    //join an existing game on the entered roomId.emit the join
    $('#join').on('click',function() {
      var name = $('#nameJoin').val() ;
      // var roomID = $('#room').val() ;
      var radio_friend = $('#radio_friend').is(':checked');
      var radio_random = $('#radio_random').is(':checked');
      console.log('radio friend',radio_friend);
      console.log('radio random',radio_random);
      if (radio_random) {   
        var roomID = $('#room_dropdown').find(":selected").text();
      } 
      if (radio_friend) {
        var roomID = $('#room').val() ;
      }
      console.log(roomID);
      if (!name || !roomID) {
        alert('please enter your name and game ID ')  ;
        return ;
      }
      socket.emit('joinGame' , {name : name , room:roomID}) ;
      player = new Player(name,P2) ;
    });
    //Listening to error due to full room capacity
    socket.on('err' , function(data){
      //console.log(data.message) ;
      //alert(data.message) ;
      var msg = data.message ;
      alert(msg) ;

    }) ;
   
    socket.on('activeRooms' , function(data){
      //console.log(data.message) ;
      //alert(data.message) ;
      for (let i = 0; i < data.length; i++) {
        console.log(data[i]);
        $("#test_rooms").append(data[i]);
        $("#room_dropdown").append('<option>'+data[i]+'</option>');
      }
    }) ;


// If player creates the game, he'll be P1(x) and has the first turn.
// This event is received when oppent connects to the room.

    socket.on('player1', function(data) {
      var message = 'Hello ' + player.getPlayerName();
      console.log("Player1 event ::  ", message);
          $('#userHello').text("");
          $('#userHello').html(message);
          $("#userHello").css({top: 16 + '%', left: 48 + '%', position:'fixed'});
      // $('userHello').html(message);
      player.setCurrentTurn(true);
    });

  // Joined the game, so player is P2(O) 
  // This event is received when P2 successfully joins the game room.

    socket.on('player2', function(data) {
      var message = 'Hello ' + data.name;
      game = new Game(data.room);
      game.displayBoard(message);
      $("#userHello").css({top: 16 + '%', left: 48 + '%', position:'fixed'});
      player.setCurrentTurn(false);
    });

  /*opponent played his turn .update UI Allow  player to play Now .*/

    socket.on('turnPlayed',function(data){
      var row = data.tile.split('_')[1][0] ;
      var col = data.tile.split('_')[1][1] ;
      var opponent = '' ;
      var player_type = player.getPlayerType() ;
      if (player_type == P1) {
        opponent = P2 ;
      } else {
        opponent = P1 ;
      }
      game.updateBoard(opponent , row , col ,data.tile) ;
      console.log('opponent' , opponent) ;
      player.setCurrentTurn(true) ;
    }) ;

  // If the other player wins or game is tired, this event is recieved . Notify the user about either scenario
  // and end the game.
 /* socket.on('endGame', function(data) {
    console.log("I am not working sad") ;
    game.endGame(data.message);

    socket.leave(data.room);
  });*/
  socket.on('winner',function(message) {
    console.log("calling winner event") ;
    console.log(message.room) ,
    console.log(message.name)
    game.displaywinner(message.name) ;
  }) ;
  
  socket.on('declaretie', function(message) {
    console.log("declaring tie .....");
    console.log(message.room);
    console.log(message.msg);
    game.displaywinner(message.msg);
  });
  socket.on('alertmsg' , function(message){
    alert(message);
  }) ;
}
init();
