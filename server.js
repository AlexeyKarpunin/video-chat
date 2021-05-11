const express =require('express');
const ioreq = require("socket.io-request");
const app = express();
const ACTIONS = require('./src/socket/actions');
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const controllers = require('./controllers');
const PORT = 5000;



io.on ('connection', socket => {
    socket.userName = undefined;
    
    socket.on(ACTIONS.CREATE_NAME, (data) => controllers.createName(data, socket));
    socket.on(ACTIONS.JOIN, (config) => controllers.join(config, io, socket));
    socket.on(ACTIONS.RELAY_SDP, (data) => controllers.realySDP(data,io, socket));
    socket.on(ACTIONS.RELAY_ICE, (data) => controllers.realyICE(data, io, socket));
    socket.on(ACTIONS.SEND_MESSAGE, (data) => controllers.sendMessages(data, io, socket));
    socket.on(ACTIONS.LEAVE, () => controllers.leaveRoom(io, socket));
    socket.on('disconnecting', () => controllers.leaveRoom(io, socket));

    ioreq(socket).response(ACTIONS.GET_NAME, async function(req, res){ 
        const {userId, roomId} = req;
        const sockets = await io.in(roomId).fetchSockets();

        for (const usersSocket of sockets) {
            if (usersSocket.id === userId) {
               return res(usersSocket.userName);
            };
        };
    });
});


server.listen(PORT, () => console.log(`server was started on port: ${PORT}`))