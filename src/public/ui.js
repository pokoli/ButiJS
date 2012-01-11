$(function() {
    //Container must fill all the screen  
    $('#container').height($(window).height()-40);
    $('#tabs').height($(window).height()-40);
    //Create the tabs
    $('#tabs').tabs().find( ".ui-tabs-nav" ).sortable({ axis: "x" });
    var height = $('#tabs').height() -85;
    $('#chat-messages').height(height);
    $('#chat-players').height(height);
});
    

