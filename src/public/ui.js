$(function() {
    //Container must fill all the screen  
    $('#container').height($(window).height()-40);
    $('#tabs').height($(window).height()-40);
    //Create the tabs
    $('#tabs').tabs().find( ".ui-tabs-nav" ).sortable({ axis: "x" });
    var height = $('#tabs').height() -85;
    $('#chat-messages').height(height);
    $('#chat-players').height(height);
    //Create a dialog for asking the user her login.
    $("#login-dialog").dialog({
	autoOpen: true,
	height: 200,
	width: 350,
	modal: true,
	buttons: {
		"Login": function() {
                socket.emit('login',{'name' : $('#login-name').val() });
				$(this).dialog( "close" );
			}
		},
		"Cancel": function() {
	        socket.emit('login',{'name' : 'Unlogged'});
		    $(this).dialog('close');
	    }
    });
});
    


