$(function() {
    var socket = io.connect();
    var servers = { 'iceServers': [{
        'urls':'stun:stun.l.google.com:19302'
    }]};
    var mediaOption,
        peerConnection,
        localStream,
        displayArea = document.getElementById('display_video');

    function _init() {
        mediaOption = {
            video: true,
            audio: true
        }

        socket.emit('join', {
            roomName: 'test',
            name: 'test' + Date.now()
        });
    }

    $('#media_auth').on('click', function() {
        _init();
        peerConnection = new RTCPeerConnection(servers);
        navigator.getUserMedia(mediaOption, function(stream) {
            localStream = stream;
            peerConnection.addStream(localStream);
        }, function(err) {
            console.error("getUserMedia error : " + err);
        });

        peerConnection.onaddstream = function(evt) {
            if ('srcObject' in displayArea) {
                displayArea.srcObject = stream;
            } else {
                displayArea.src = window.URL.createObjectURL(stream);
            }
            displayArea.play();
        }
        peerConnection.onicecandidate = function(evt) {
            if (evt.candidate) {
                socket.emit('sendCandidate', evt.candidate);
            }
        }


        createOffer();
    });

    function createOffer() {
        peerConnection.createOffer(function(sdp) {
            peerConnection.setLocalDescription(sdp, function() {
                socket.emit('sendOffer', sdp);
            });
        });
    }

    /**
     * 受け取り側の処理
     */
    socket.on('sendOffer', function(data) {
        var sdp = new RTCSessionDescription(data);
        peerConnection.setRemoteDescription(sdp, function() {}, function() {});
        peerConnection.createAnswer(function(sdp) {
            peerConnection.setLocalDescription(sdp, function() {
                socket.emit('sendAnswer', sdp);
            });
        });
    });

    socket.on('sendAnswer', function(sdp) {
        var sdp = new RTCSessionDescription(sdp);
        peerConnection.setRemoteDescription(sdp);
    });

    socket.on('sendCandidate', function(candidate) {
        var ice = new RTCIceCandidate(candidate);
        peerConnection.addIceCandidate(ice);
    })
});