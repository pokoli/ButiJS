$(function() {
    //Container must fill all the screen  
    $('#container').height($(window).height()-40);
    $('#tabs').height($(window).height()-40);
    //Create the tabs
    $('#tabs').tabs().find( ".ui-tabs-nav" ).sortable({ axis: "x" });
    var height = $('#tabs').height() -85;
    $('#chat-messages').height(height);
    $('#chat-players').height(height);
    $('#game-details').height(height - 100);
    $('#game-form').height(100);
    //Create a dialog for asking the user her login.
    $("#login-dialog").dialog({
	autoOpen: false,
	height: 200,
	width: 350,
	modal: true,
	buttons: {
		"Login": function() {
                socket.emit('login',{'name' : $('#login-name').val() },refreshPlayers);
				$(this).dialog( "close" );
			},
		"Cancel": function() {
	            socket.emit('login',{'name' : 'Unlogged'},refreshPlayers);
		        $(this).dialog('close');
	        }
		}
    });
    //Create a dialog for asking the user the game data.
    function create_game_clear(dialog,values){
        if(values)
        {
            $('#game-name').val('');
        }
        dialog.dialog('close');
    }
    $("#create-game-dialog").dialog({
	autoOpen: false,
	height: 200,
	width: 350,
	modal: true,
	buttons: {
		"Create": function() {
		        var gameData = {
		            name : $('#game-name').val(),
	            };
                createGame(gameData);
				create_game_clear($(this),true);
			},
		"Cancel": function() {
		        create_game_clear($(this),false);
            }
		},
		
    });
    //Game manipulation functions
    $('#join').click(joinGame);
    $('#watch').click(function(){ alert("Not yet implemented");return;});
    $('#create').click(function(){$("#create-game-dialog").dialog('open')});
});
    


