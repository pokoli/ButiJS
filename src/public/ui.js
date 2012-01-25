var height;

$(function() {
    //Container must fill all the screen  
    $('#container').height($(window).height()-40);
    $('#tabs').height($(window).height()-40);
    //Create the tabs
    $('#tabs').tabs().find( ".ui-tabs-nav" ).sortable({ axis: "x" });
    //Automatically select the new added tab
    var $tabs = $('#tabs').tabs({
        add: function(event, ui) {
            $tabs.tabs('select', '#' + ui.panel.id);
        }
    });
    height = $('#tabs').height() -85;
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
/*
    Creates a new Tab where the game is placed.
*/
function addNewGame(gameData)
{
    $('#tabs').tabs("add",'#current-game',gameData.name);
    $('#current-game').height(height);
    $('#current-game').addClass('row');
    $.ajax({
        url : 'game',
        success : function(data) {
             $('#current-game').html(data);
             initCanvas($('#game'));
        },
     });
}

/* 
    Inits the game Canvas with all the elements
*/
function initCanvas(canvasElement)
{
    canvasElement = canvasElement || $('#game');
    var ctx=canvasElement[0].getContext("2d");
    var width=ctx.canvas.width;
    var height=ctx.canvas.height;

    
    //Player 1 cards Holder
    ctx.strokeRect(0,height*0.185,width*0.15,height*0.485);
    //Player 2 cards Holder
    ctx.strokeRect(width*0.2,0,width*0.6,height*0.185);
    //Player 3 cards Holder
    ctx.strokeRect(width-(width*0.15),height*0.185,width*0.15,height*0.485);
    //Player 4 cards Holder
    ctx.strokeRect(width*0.07,height-(height*0.3),width*0.85,height*0.3);

}

