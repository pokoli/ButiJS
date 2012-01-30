var height;
/*
    Holds the cached images
*/
var cachedImages={};

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
    height = $('#tabs').height() -65;
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
                socket.emit('login',{'name' : $('#login-name').val() },function(){
                    refreshPlayers();
                    refreshGames();
                });
				$(this).dialog( "close" );
			},
		"Cancel": function() {
	            socket.emit('login',{'name' : 'Unlogged'},function(){
                    refreshPlayers();
                    refreshGames();
                });
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
    Add's new message on the messages list
*/

function addMessage(data)
{
	$('#messages').append('<li>' + data + '</li>');
}

/*
    Send's the text in the chatbox as as message
*/

function send()
{
	var msg = $('#msg').val();
	if(msg && msg!='')
	    sendMsg(msg);
	$('#msg').val('');
}


/*
    Draws the game details in the screen
*/
function showGameDetails(gameData)
{
    $('#game-details').children().remove();
    $('#game-details').append('<table>');
    $('#game-details').append('<tr><th>Name</th><td>'+gameData.name+'</td><tr>');
    $('#game-details').append('<tr><th>State</th><td>'+gameData.state+'</td><tr>');
    $('#game-details').append('<tr><th colspan="2">Players</th>');
    for(var i in gameData.players)
    {
        $('#game-details').append('<tr><td colspan="2">'+gameData.players[i].name+'</td><tr>');
    }
    if(gameData.watchers.length > 0)
    {
        $('#game-details').append('<tr><th colspan="2">Wathcers</th>');
        for(var i in gameData.watchers)
        {
            $('#game-details').append('<tr><td colspan="2">'+gameData.watchers[i]+'</td><tr>');
        }
    }
    $('#game-details').append('</table>');
}

/*
    Draw the game data in the screen
*/
function drawGameData(data){
		$('#game-list').children().remove();
		$('#game-list').append('<thead><tr><th>Name</th><th>State</th><th>Players</th><th>Watchers</th></thead>')
		if(!data || data==[] || data.length ==0)
		{
		    games=[];
			return;
		}
		games=data;
		for(var i in games)
		{
			$('#game-list').append('<tr onClick="selectGame('+i+')"><td>'+data[i].name+'</td><td>'+data[i].state+'</td><td>'+data[i].players.length+'</td><td>'+data[i].watchers.length+'</td></tr>');
		}
		//Refresh the game data if it has changed.
		if(selected || selected == 0)
	       showGameDetails(games[selected]);
}

/*
    Marks the game as selected
*/
function selectGame(i)
{
    selected=i;
    showGameDetails(games[i]);
}


/*
    Draws the players list on chat tab
*/
function drawPlayersList(data){
		$('#player-list').children().remove();
		if(!data || data==[] || data.length ==0)
		{
			$('#player-list').append('<li>No players on the server</li>');
			return;
		}
		for(var i in data)
		{
			$('#player-list').append('<li>'+data[i].name+'</li>');
		}
}
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
    Updates the game info: 
    - Teams
    - Current score
*/
function updateGameInfo(gameData)
{

    if($('#summary').length==0)
    {
        setTimeout(function(){updateGameInfo(gameData)},100);
        return;
    }
    $('#summary').children().remove();
    $('#summary').append('<table>');
    $('#summary').append('<tr><th>Name</th><td>'+gameData.name+'</td><tr>');
    $('#summary').append('<tr><th>Round</th><td> '+gameData.round+'</td><tr>');
    if(gameData.teams && gameData.teams[1])
    {
        $('#summary').append('<tr><table>');
        $('#summary').append('<tr><th>Team 1</th><th>Team 2</th><tr>');
        for(var i=0;i<gameData.teams[1].length;i++)
        {
            $('#summary').append('<tr><td>'+gameData.teams[1][i].name+'</td><th>'+gameData.teams[1][i].name+'</th><tr>');
        }
        $('#summary').append('</tr></table>');
    }
    if(gameData.score && gameData.score[1])
    {
        $('#summary').append('<tr><th>Score</th></tr>');
        $('#summary').append('<tr><td>Team 1</td><td>'+gameData.score[1]+'</td><tr>');
        $('#summary').append('<tr><td>Team 2</td><td>'+gameData.score[2]+'</td><tr>');
    }
    $('#summary').append('</table>');
}

//Canvas 2d Context Holder. 
var context;

//Positions of the Player Cards Holder
var cardHolderHeight;
var cardHolderWidth;
var cardHolderXOffset;
var cardHolderYOffset;

/* 
    Inits the game Canvas with all the elements
*/
function initCanvas(canvasElement)
{
    canvasElement = canvasElement || $('#game');
    this.context=canvasElement[0].getContext("2d");
    var width=context.canvas.width;
    var height=context.canvas.height;

    //Save the heightOf the current player cardsHolder
    cardHolderHeight=height*0.3;
    cardHolderWidth=width*0.85;
    cardHolderXOffset=width*0.07;
    cardHolderYOffset=height-(height*0.3);
    
    //Player 1 cards Holder
    this.context.strokeRect(0,height*0.185,width*0.15,height*0.485);
    //Player 2 cards Holder
    this.context.strokeRect(width*0.2,0,width*0.6,height*0.185);
    //Player 3 cards Holder
    this.context.strokeRect(width-(width*0.15),height*0.185,width*0.15,height*0.485);
    //Player 4 cards Holder
    this.context.strokeRect(cardHolderXOffset,cardHolderYOffset,cardHolderWidth,cardHolderHeight);
}

/*
    Preloads the following images. 
        1.-Card Images
*/
function preloadImages()
{
    var _suits = ['Oros','Copes','Espases','Bastos'];
    var _numbers = [1,2,3,4,5,6,7,8,9,10,11,12];
    for(i in _suits)
    {
        var suit = _suits[i];
        for(j in _numbers)
        {
            var num = _numbers[j];
		    var image = new Image();
		    var name = num+'-'+suit.toString().toLowerCase();
		    image.src = 'public/img/'+ name +'.png'
			cachedImages[name]=image;
		}
	}

}
//Call the image preloading
preloadImages();


function placeCards(cards)
{
    //If the context is not initialized wait 100 miliseconds.
    if(!this.context)
    {
        setTimeout(function(){placeCards(cards)},100);
        return;
    }
    for(var i=0;i<cards.length;i++)
    {
        var card = cards[i];
        var image = cachedImages[card.number+'-'+card.suit.toString().toLowerCase()];
        var x= cardHolderXOffset+((cardHolderWidth/cards.length)*i);
        var y = cardHolderYOffset;
        this.context.drawImage(image,x,y,cardHolderWidth/cards.length,cardHolderHeight);
    }
}

function showThriumphDialog(selections,callback)
{
    //Create the div
    if($('#show-thriumph-dialog').length==0)
    {
        var oDiv = '<div id="show-thriumph-dialog" title="Select Thriumph"><form><fieldset>';
        oDiv += '<label for="thriumph">Select Thriumph</label>';
        oDiv += '<select id="thriumph-selector" name="thriumph-selector">';
        for(var i=0;i<selections.length;i++)
        {
            oDiv += '<option value="'+selections[i]+'">'+selections[i]+'</option>';
        }
        oDiv += '<select>';
        oDiv += '</fieldset></form></div>';
        $(oDiv).appendTo($('#container'));
        $('#show-thriumph-dialog').dialog({
	    autoOpen: false ,
	    height: 200,
	    width: 350,
	    modal: false,
	    buttons: {
		    "Select": function() {
                        if(callback) callback($('#thriumph-selector').val());
                        $(this).dialog( "close" );
				    }
			    },	
        });
    }
    else
    {
        //If exist we must refresh the options.
        $('#thriumph-selector').children().remove();
        for(var i=0;i<selections.length;i++)
        {
            $('#show-thriumph-dialog > #thriumph').append('<option value="'+selections[i]+'">'+selections[i]+'</option>');
        }
    }
    $('#show-thriumph-dialog').dialog('open');
}
