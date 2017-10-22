$(function(){
    var socket = io.connect("ws://"+ location.host);

    /**
     * システムに必要な初期化処理を行います。
     */
    function _init() {
        socket.emit('join', {
            roomName: roomName,
            name: name
        });
    }

    socket.on("server_to_client", function(data){appendMsg(data.value)});

    function appendMsg(text) {
        $("#chatLogs").append("<div>" + name + ' : ' + text + "</div>");
    }

    $("form").submit(function(e){
        var message = $("#msgForm").val();
        $("#msgForm").val('');
        socket.emit("client_to_server", {value : message});
        e.preventDefault();
    });
});