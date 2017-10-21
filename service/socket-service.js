// chat 利用者
var users = {};

module.exports = function(socket) {
    
    /**
     * room入室処理
     */
    socket.on('join', function(user) {
        users[socket.id] = {
            id: socket.id,
            room: user.roomName,
            name: user.name
        }
        socket.join(user.roomName, () => {
            console.log(users);
        });
    });
    
    /**
     * room内のユーザにメディア送信offerを伝達
     */
    socket.on('sendOffer', (offer) => {
        console.log('offer: ' + offer);
        broadcastToOwnRoom('sendOffer', offer);
    });

    /**
     * room内のユーザにcandidateを伝達
     */
    socket.on('sendCandidate', (candidate) => {
        console.log('candidate: ' + candidate);
        broadcastToOwnRoom('sendCandidate'), candidate;
    });

    /**
     * offerを送って来たユーザにanswer情報を伝達
     */
    socket.on('sendAnswer', (answer) => {
        console.log('answer: ' + answer);
        broadcastToOwnRoom('sendAnswer', answer);
    });

    socket.on('client_to_server', function(data) {
        broadcastToOwnRoom('server_to_client', {value : data.value});
        socket.emit('server_to_client', {value : data.value});
    });
    
    /**
     * 自身の入室しているroomで、自分以外のユーザへデータを送信する。
     * @eventName {String} 対象となるイベントの名前
     * @data {Object} 送信するデータ
     */
    function broadcastToOwnRoom(eventName, data) {
        console.log('data => ' + data);
        console.log('users => ' + users);
    
        console.log('users => ' + socket.id);
        socket.broadcast.to(users[socket.id].room).emit(eventName, data);
    }
}