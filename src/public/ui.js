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
    $('#game-details').height(height - 40);
    $('#game-list').height(height - 40);
    $('#game-form').height(40);
    //Create a dialog for asking the user her login.
    $("#login-dialog").dialog({
	autoOpen: false,
	height: 210,
	width: 350,
	modal: true,
	buttons: {
		"Login": function() {
                socket.emit('login',{'name' : $('#login-name').val() },function(data){
                    savePlayerId(data.id);
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
	height: 210,
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
    $('#watch').click(function(){ alert(__("Not yet implemented"));return;});
    $('#create').click(function(){$("#create-game-dialog").dialog('open')});
});

/*
    Add's new message on the messages list
*/

function addMessage(data)
{
	$('#messages').append('<li>' + data + '</li>');
	//Move the scroll to the atached element.
	$('#messages > li ').last()[0].scrollIntoView();
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
    $('#game-details').append('<tr><th>'+__('Name')+'</th><td>'+gameData.name+'</td><tr>');
    $('#game-details').append('<tr><th>'+__('State')+'</th><td>'+gameData.state+'</td><tr>');
    $('#game-details').append('<tr><th colspan="2">'+__('Players')+'</th>');
    for(var i=0;i<gameData.players.length;i++)
    {
        $('#game-details').append('<tr><td colspan="2">'+gameData.players[i].name+'</td><tr>');
    }
    if(gameData.watchers.length > 0)
    {
        $('#game-details').append('<tr><th colspan="2">'+__('Watchers')+'</th>');
        for(var i=0;i<gameData.watchers.length;i++)
        {
            $('#game-details').append('<tr><td colspan="2">'+gameData.watchers[i]+'</td><tr>');
        }
    }
    $('#game-details').append('<tr><td colspan="2"><input onclick="javascript:addBot();" id="add-bot" class="ui-button ui-widget ui-state-default ui-corner-all ui-button-text-only type="button" value="'+__('Add bot')+'" /></td></tr>');
    $('#game-details').append('</table>');
}

/*
    Draw the game data in the screen
*/
function drawGameData(data){
		$('#game-list').children().remove();
		$('#game-list').append('<thead><tr><th style="width: 55%">'+__('Name')+'</th><th style="width: 20%">'+__('State')+'</th><th style="width: 10%" class="text-right">'+__('Players')+'</th><th style="width: 10%" class="text-right">'+__('Watchers')+'</th></thead>')
		if(!data || data===[] || data.length ===0)
		{
		    games=[];
			return;
		}
		games=data;
		for(var i=0;i<data.length;i++)
		{
			$('#game-list').append('<tr onClick="selectGame('+i+')"><td>'+data[i].name+'</td><td>'+data[i].state+'</td><td class="text-right">'+data[i].players.length+'</td><td class="text-right">'+data[i].watchers.length+'</td></tr>');
		}
		//Refresh the game data if it has changed.
		if(selected || selected === 0)
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
		if(!data || data===[] || data.length ===0)
		{
			$('#player-list').append('<li>'+__('No players on the server')+'</li>');
			return;
		}
		for(var i=0;i<data.length;i++)
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
             $('#current-game #summary').height($('#current-game > #game').height() * 0.55);
             $('#current-game #score').height($('#current-game > #game').height() * 0.45);
             initCanvas($('#game'),gameData);
        },
     });
}

/*
    Updates the game info: 
    - Teams
    - Current score
    - Round Info
*/
function updateGameInfo(gameData)
{
    if($('#summary').length===0)
    {
        setTimeout(function(){updateGameInfo(gameData)},100);
        return;
    }

    var sHTML = '';

    sHTML += '<table>';
    sHTML += '<tr><th>'+__('Name')+'</th><td>'+gameData.name+'</td></tr>';
    sHTML += '<tr><th>'+__('Round')+'</th><td>'+gameData.round+'</td></tr>';
    sHTML += '</table>';
    if(gameData.teams && gameData.teams[1])
    {
        sHTML += '<table>';
        sHTML += '<tr><th>'+__('Team')+' 1</th><th>'+__('Team')+' 2</th></tr>';
        for(var i=0;i<gameData.teams[1].length;i++)
        {
            sHTML += '<tr><td>'+gameData.teams[1][i].name+'</td><td>'+gameData.teams[2][i].name+'</td></tr>';
        }
        sHTML += '</table>';
    }
    if(gameData.score && gameData.score[1])
    {
        sHTML += '<table>';
        sHTML += '<tr><th>'+__('Score')+'</th></tr>';
        sHTML += '<tr><td>'+__('Team')+' 1</td><td>'+gameData.score[1]+'</td></tr>';
        sHTML += '<tr><td>'+__('Team')+' 2</td><td>'+gameData.score[2]+'</td></tr>';
        sHTML += '</table>';
    }
    if(gameData.playedRounds && gameData.playedRounds[gameData.round-1])
    {
        var round = gameData.playedRounds[gameData.round-1];
        sHTML += '<table>';
        sHTML += '<tr><th>'+__('Round Info')+'</th></tr>';
        if(round.thriumph)
        {
            sHTML += '<tr><td>'+__('Thriumph: ')+'</td><td>'+round.thriumph;
            if(round.delegated) sHTML += ' '+__('(Delegated)');
            sHTML += '</td></tr>';
        }
        if(round.thriumpher)
            sHTML += '<tr><td>'+__('Thriumpher')+':</td><td>'+round.thriumpher.name+'</td></tr>';
        if(round.multiplier>1)
            sHTML += '<tr><td>'+__('Contro')+':</td><td> x'+round.multiplier+'</td></tr>';
        if(round.controPlayers.length>0)
        {
            sHTML += '<tr><td>'+__('Contro players')+'</td></tr>';
            for(var i=0;i<round.controPlayers.length;i++)
                sHTML += '<tr><td>'+round.controPlayers[i].name+' (x'+(i+1)*2+')</td></tr>';
        }
        sHTML += '</table>';
    }

    $('#summary').children().remove();
    $('#summary').append(sHTML);
}

//Positions of the Player Cards Holder
var cardHolderHeight;
var cardHolderWidth;
var cardHolderXOffset;
var cardHolderYOffset;
var cardWidth;
var cardHeight;

/*
    Function for creating a CardHolder
*/

function createCardHolder(name,x,y,width,height)
{
    var ret = new Kinetic.Shape(function(){
        var context = this.getContext();
        context.beginPath();
        context.rect(x,y,width,height);
        context.stroke();
        context.closePath();
    },name);
    ret.offsetx=x;
    ret.offsety=y;
    return ret;
}

/*
    Holds if the canvas had been initiated.
*/
var canvasInit=false;

/*
    Holds the Stage where all the layers are placed.
*/
var mainStage;

/*
    Save the ids of the players possitioned in the screen. 
*/
var ids = [];


/*
    Writes a message to a Layer.
    @params:
        - message: The message to write.
        - x: The X offset where we have to write the message
        - y: The Y offset where we have to write the message
*/
function writeMessageDialog(message, x,y){
    if($('#message-dialog').length==0)
    {
        var odiv = '<div id="message-dialog" title="Info">';
        odiv += '<p id="message-dialog-text"></p>';
        odiv += '</div>';
        $(odiv).appendTo($('#game'));
        $('#message-dialog').dialog({ autoOpen: false,height: 250,width: 350});
	}
	$('#message-dialog-text').html(message);
    $('#message-dialog').dialog('open');
}

/*
    Writes a message to a Layer.
    @params:
        - message: The message to write.
        - x: The X offset where we have to write the message
        - y: The Y offset where we have to write the message
*/
function writeMessage(message, x,y){
        var messageLayer = mainStage.getChild('messageLayer');
        var x = 0; var y=0;
        x = x || messageLayer.getCanvas().width*0.33;
        y = y || messageLayer.getCanvas().height*0.10;
        var context = messageLayer.getContext();
        messageLayer.clear();
        messageLayer.moveToTop();
        context.font = "18pt Calibri";
        context.fillStyle = "Red";
        context.fillText(message, x, y);
        setTimeout(3000,function(){
            messageLayer.clear();
        });
}

/* 
    Inits the game Canvas with all the elements
*/
function initCanvas(canvasElement,gameData)
{
    var width=canvasElement.width();
    var height=canvasElement.height();

    mainStage = new Kinetic.Stage(canvasElement.attr('id'), width, height);
    var holdersLayer= new Kinetic.Layer('holdersLayer');
    var context = holdersLayer.getContext();

    //Save the heightOf the current player cardsHolder
    cardHolderHeight=height*0.3;
    cardHolderWidth=width*0.85;
    cardHolderXOffset=width*0.07;
    cardHolderYOffset=height-(height*0.3);
    
    var names = [];
    var playerTeam;
    for(var i=0;i<gameData.players.length;i++)
    {
        if(gameData.players[i].id === playerid)
        {
            playerTeam=gameData.players[i].team;
            ids[3]=playerid;
            names[3]=gameData.players[i].name;
            break;
        }
    }
    ids[1] = gameData.teams[playerTeam][0].id === playerid ? gameData.teams[playerTeam][1].id : gameData.teams[playerTeam][0].id; 
    names[1]=gameData.teams[playerTeam][0].id === playerid ? gameData.teams[playerTeam][1].name : gameData.teams[playerTeam][0].name;

    var right=(i+1)%4;
    var left=(i+3)%4;

    ids[0] = gameData.players[left].id;
    names[0] = gameData.players[left].name;
    ids[2] = gameData.players[right].id;
    names[2] = gameData.players[right].name;

    cardWidth=width*0.08;
    cardHeight=height*0.20;
    var holders = []; 
    //Player 1 cards Holder
    holders.push(createCardHolder('cards'+ids[0],0,height*0.185,width*0.15,height*0.485));
    holders.push(createCardHolder('played'+ids[0],width*0.22,height*0.33,cardWidth,cardHeight));
    //Player 2 cards Holder
    holders.push(createCardHolder('cards'+ids[1],width*0.2,0,width*0.6,height*0.185));
    holders.push(createCardHolder('played'+ids[1],width*0.43,height*0.23,cardWidth,cardHeight));
    //Player 3 cards Holder
    holders.push(createCardHolder('cards'+ids[2],width-(width*0.15),height*0.185,width*0.15,height*0.485));
    holders.push(createCardHolder('played'+ids[2],width-(width*0.22+width*0.14),height*0.33,cardWidth,cardHeight));
    //Player 4 cards Holder
    holders.push(createCardHolder('cards'+ids[3],cardHolderXOffset,cardHolderYOffset,cardHolderWidth,cardHolderHeight));
    holders.push(createCardHolder('played'+ids[3],width*0.43,height*0.47,cardWidth,cardHeight));
    
    for(var i=0;i<holders.length;i++)
        holdersLayer.add(holders[i]);
    mainStage.add(holdersLayer);

    var namesLayer= new Kinetic.Layer('namesLayer');
    namesLayer.clear();

    var nameShape = new Kinetic.Shape(function(){
        //Write the name of the players.
        var context = namesLayer.getContext();
        context.font = "14pt Calibri";
        context.fillStyle = "Black";
        context.fillText(names[0], 0,height*0.15);
        context.fillText(names[1],width*0.40,height*0.15);
        context.fillText(names[2],width-(width*0.15),height*0.15);
        context.fillText(names[3],width*0.40,height-(height*0.05));
    });
    namesLayer.add(nameShape);
    mainStage.add(namesLayer);
    namesLayer.moveToTop();

    //Layer for writing messages to the player.
    var messageLayer = new Kinetic.Layer('messageLayer');
    mainStage.add(messageLayer);
    messageLayer.moveToTop();

    canvasInit=true;
}

/*
    Preloads the following images. 
        1.-Card Images
*/
function preloadImages()
{
    var _suits = ['Oros','Copes','Espases','Bastos'];
    var _numbers = [1,2,3,4,5,6,7,8,9,10,11,12];
    for(var i=0;i<_suits.length;i++)
    {
        var suit = _suits[i];
        for(var j=0;j<_numbers.length;j++)
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

/*
    Places the player cards in the correct place.
*/
function placeCards(cards)
{
    //If the context is not initialized wait 100 miliseconds.
    if(!canvasInit)
    {
        setTimeout(function(){placeCards(cards)},100);
        return;
    }
    var cardsLayer = mainStage.getChild('cardsLayer') || new Kinetic.Layer('cardsLayer');
    if(cardsLayer.children.length === 12 && cards.length === 0)
        return;
    
    if(mainStage.getChild('cardsLayer'))
        mainStage.remove(cardsLayer);
    cardsLayer= new Kinetic.Layer('cardsLayer');
    
    for(var i=0;i<cards.length;i++)
    {
        var card = cards[i];
        var key = card.number+'-'+card.suit.toString().toLowerCase()
        var imgx= cardHolderXOffset+((cardHolderWidth/12)*i);
        //Add to x more offset to put the cards centered when are less than 12.
        imgx += (12-cards.length)*(cardWidth*0.4);
        var imgy = cardHolderYOffset;
        var cardImage = new Kinetic.Image({
                        image: cachedImages[key],
                        x : imgx,
                        y : imgy,
                        width : cardWidth,
                        heigth : cardHolderHeight
                    });
        cardImage.card = cards[i];
        cardImage.on("dblclick", (function(card, idx) {
                    return function () {
                    playCard(card, function (err) {
                            if(err) return;
                            cards.splice(idx, 1);
                            placeCards(cards);
                        });
                    };
        })(card, i));

        cardsLayer.add(cardImage);
    }
    mainStage.add(cardsLayer);
    mainStage.draw();
}

//Boolean for marking if we have to wait to the last round cards are played.
var waitingClear=false;

/*
    Places the player cards in the correct place.
*/
function placePlayedCard(data)
{
    //If we are waiting to clear the playedCards call the function later and return
    if(waitingClear)
    {
        setTimeout(function(){placePlayedCard(data);},300);
        return;
    }   
    var player = data.player;
    var card = data.card;
    var holder = mainStage.getChild('holdersLayer').getChild('played'+player.id);
    var key = card.number+'-'+card.suit.toString().toLowerCase()
    var cardImage = new Kinetic.Image({
                        image: cachedImages[key],
                        x : holder.offsetx,
                        y : holder.offsety,
                        width : cardWidth,
                        heigth : cardHeight
                    });
    var cardsLayer = mainStage.getChild('cardsPlayedLayer');
    if(!cardsLayer)
        cardsLayer= new Kinetic.Layer('cardsPlayedLayer');
    else
    {
        var children = cardsLayer.children;
        mainStage.remove(cardsLayer);
        cardsLayer= new Kinetic.Layer('cardsPlayedLayer');
        cardsLayer.children = children
    }
    cardsLayer.add(cardImage);
    mainStage.add(cardsLayer);
}

//Holds the clear timeout.
var clearTimer;
/*
    Add a listener to the game for clearing the playedCards on clicking the game zone
    Autoclear the played cards after 3 secons
*/
function enableClearPlayedCards(){
    waitingClear=true;
    $('#game').bind('click',clearPlayedCards);
    //Increased to 5 second
    clearTimer = setTimeout(clearPlayedCards,5000);
}

/*
    Clears all the played cards.
*/
function clearPlayedCards()
{
    if(!waitingClear) return;
    waitingClear=false;
    //Remove the listener
    $('#game').unbind('click',clearPlayedCards);
    //Remove the timeOut
    clearTimeout(clearTimer);
    //Clear the cards
    mainStage.getChild('cardsPlayedLayer').children=[];
    mainStage.getChild('cardsPlayedLayer').draw();
}

function showControDialog(selections,additionalText,callback)
{
    var text = additionalText || '';
    //Create the div
    if($('#show-contro-dialog').length===0)
    {
        var oDiv = '<div id="show-contro-dialog" title="'+__('Do you want to make a contro?')+'"><form><fieldset>';
        oDiv += '<p id="show-contro-text">'+text+'</p>';
        oDiv += '<label  for="contro"> '+__('Do you want to make a contro?')+' </label></br>';
        oDiv += '<input type="radio" id="contro-selector" name="thriumph-selector" value="true">'+__('Yes');
        oDiv += '<input type="radio" id="contro-selector" name="thriumph-selector" value="false">'+__('No');
        oDiv += '</fieldset></form></div>';
        $(oDiv).appendTo($('#container'));
        $('#show-contro-dialog').dialog({
	    autoOpen: false ,
	    height: 250,
	    width: 350,
	    modal: false,
	    buttons: {
		    "Accept": function() {
		                var value = $('#contro-selector:checked').val()==='true';
                        if(callback) callback(value);
                        $(this).dialog( "close" );
				    }
			    },	
        });
    }
    $('#show-contro-text').html(text);
    $('#show-contro-dialog').dialog('open');
}

function showControDone(controInfo){
    //Close the controDialog
    $('#show-contro-dialog').dialog('close');
    var text= __('Player ')+controInfo.player.name;
    text += (controInfo.value===2) ? __(' has Contred') : __(' has Recontred');
    writeMessage(text);
}

function updateRoundScores(roundPoints,multiplier)
{
    var otherTeam = playerTeam === 1 ? 2 : 1;
    var sHTML = '<tr>'
    if(roundPoints[playerTeam]>36)
    {
        sHTML+= '<td>'+((roundPoints[playerTeam]-36)*multiplier)+'</td><td></td>';
    }
    else if(roundPoints[otherTeam]>36)
    {
        sHTML+= '<td></td><td>'+((roundPoints[otherTeam]-36)*multiplier)+'</td>';
    }
    else
    {
        sHTML+= '<td>----------<td><td>----------</td>';
    }
    sHTML += '</tr>';
    $('#score > table').append(sHTML);
}

function showThriumphDialog(selections,callback)
{
    //Prevent from showing the dialog if no selections
    if(selections.length===0)
    {   
        console && console.log('Empty selections');
        return;
    }
    //Create the div
    if($('#show-thriumph-dialog').length===0)
    {
        var oDiv = '<div id="show-thriumph-dialog" title="'+__('Select Thriumph')+'"><form><fieldset>';
        oDiv += '<label for="thriumph">'+__('Select Thriumph')+'</label>';
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
	    height: 210,
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
            $('#thriumph-selector').append('<option value="'+selections[i]+'">'+selections[i]+'</option>');
        }
    }
    $('#show-thriumph-dialog').dialog('open');
}
