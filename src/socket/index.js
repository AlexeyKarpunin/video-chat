const {io} = require('socket.io-client')

const option = {
    "force new connection": true,
    reconnectionAttempts: "Infinity",
    timeout: 10000,
    transports: ["websocket"]
}

const connection = "http://localhost:5000";

const socket = io(connection, option);

module.exports = {
    socket,
};