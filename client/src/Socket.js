import SocketIO from 'socket.io-client';
const SOCKET_URL = 'localhost:1234';

let socket = SocketIO(SOCKET_URL, {
    transports: ['websocket']
 });

export default socket;