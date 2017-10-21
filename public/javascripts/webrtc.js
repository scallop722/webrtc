$(function() {
    var socket = io.connect();
    var servers = { 'iceServes': [{
        'urls':'stun.l.google.com:19302'
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
        peerConnection = createPeerConnection(servers);
        displayArea = document.getElementById('display_video');

        socket.emit('join', {
            roomName: 'test',
            name: 'test' + Date.now()
        });
    }

    $('#media_auth').on('click', function() {
        navigator.mediaDevices.getUserMedia(mediaOption)
            .then(function (stream) { // success
                localStream = stream;
                peerConnection.addStream(localStream);
                trace('success add stream');
            }).catch(function (error) { // error
                console.error('mediaDevice.getUserMedia() error:', error);
                return;
            });
    });

    /***** 受け取り処理 *****/
    /**
     * 通信相手からのofferを受け取りAnswerを返す
     */
    socket.on('sendOffer', function(offer) {
        if(!!peerConnection) {
            trace('received offer: ' + offer);
            peerConnection.setRemoteDescription(new RTCSessionDescription(offer), function(){}, errorHandler('Received Offer'));
            createAnswer();
        }
    });
    
    socket.on('sendCandidate', function(candidate) {
        trace('receive candidate: ' + candidate);
        peerConnection.addIceCandidate(new RTCIceCandidate(candidate), function(){}, errorHandler('Add Ice candidate'));
    });

    socket.on('sendAnswer', function (answer) {
        if(!!peerConnection) {
            trace('received answer: ' + answer);
            peerConnection.setRemoteDescription(new RTCSessionDescription(answer), function(){}, errorHandler('Received Answer'));
        }
    });

    function createPeerConnection(config) {
        var peerConnection = new RTCPeerConnection(config);

        peerConnection.onicecandidate = function(evt) {
            if(evt) {
                trace('send candidate: ' + evt.candidate);
                socket.emit('sendCandidate', evt.candidate);
            }
        }

        // ネゴシエーションが必要なときに自動でofferを送信
        preparedConnection.onnegotiationneeded = function (evt) {
            createOffer();
        }

        preparedConnection.onaddstream = function (evt) {
            playVideo(document.getElementById('display_video'), evt.stream);
        }

        return preparedConnection;
    }

    /***** ロジック系関数 *****/
    function playVideo(element, stream) {
        trace('play video');
        if ('srcObject' in element) {
            trace('src object');
            element.srcObject = stream;
        } else {
            trace('src');
            element.src = window.URL.createObjectURL(stream);
        }
        element.play();
    }

    function createOffer() {
        trace('called create Offer');
        if(!!peerConnection) {
            peerConnection.createOffer()
            .then(function (offer) {
                trace('create offer: ' + offer);
                return peerConnection.setLocalDescription(new RTCSessionDescription(offer));
            })
            .then(function () {
                trace('send offer' + peerConnection.localDescription);
                socket.emit('sendOffer', peerConnection.localDescription);
            });
        }
    }

    function createAnswer() {
        trace('called create Answer');
        if (!!peerConnection) {
            peerConnection.createAnswer()
            .then(function (answer) {
                trace('create answer' + answer);
                return peerConnection.setLocalDescription(new RTCSessionDescription(answer));
            })
            .then(function () {
                trace('send answer');
                socket.emit('sendAnswer', peerConnection.localDescription);
            });
        }
    }

    /**
     * 簡易エラーコールバック用メソッド
     */
    function errorHandler(context) {
        return function(error) {
            trace('Failure in ' + context + ': ' + error.toString);
        }
    }

    /**
     * ログ出力用メソッド
     */
    function trace(arg) {
        var now = (window.performance.now() / 1000).toFixed(3);
        console.log(now + ': ', arg);
    }
});