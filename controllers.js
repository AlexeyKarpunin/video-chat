const ACTIONS = require('./src/socket/actions');

function leaveRoom(io, socket) {
    const {rooms} = socket;

    Array.from(rooms)
         .forEach(roomID => {
             const clients = Array.from(io.sockets.adapter.rooms.get(roomID) || []);

             clients.forEach(clientID => {
                 io.to(clientID).emit(ACTIONS.REMOVE_PEER, {
                     peerId: socket.id,
                 });

                 socket.emit(ACTIONS.REMOVE_PEER, {
                     peerId: clientID,
                 });
             });

             socket.leave(roomID);
         });
};

function join (config, io, socket) {
    const {room: roomID} = config;
    const {rooms: joinedRooms} = socket;

    if (Array.from(joinedRooms).includes(roomID)) {
        return console.warn(`Already joined to ${roomID}`)
    }

    const clients = Array.from(io.sockets.adapter.rooms.get(roomID) || []);
    
    clients.forEach( clientID => {
        io.to(clientID).emit(ACTIONS.ADD_PEER, {
            peerId: socket.id,
            createOffer: false,
        });

        socket.emit(ACTIONS.ADD_PEER, {
            peerId: clientID,
            createOffer: true,
        });
    });

    socket.join(roomID);

};


function realySDP ({peerId, sessionDescription}, io, socket) {
    io.to(peerId).emit(ACTIONS.SESSION_DESCRIPTION, {
        peerId: socket.id,
        sessionDescription,
    });
}

function realyICE ({peerId, iceCandidate}, io, socket) {
    io.to(peerId).emit(ACTIONS.ICE_CANDIDATE, {
        peerId: socket.id,
        iceCandidate,
    });
}

function createName ({userName}, socket) {
    socket.userName = userName;
}

function sendMessages ({message, roomId}, io, socket) {
    const clients = Array.from(io.sockets.adapter.rooms.get(roomId) || []);
    const date = new Date();

    let hours = date.getHours();
    let minutes = date.getMinutes();

    if (String(minutes).length === 1) minutes = `0${minutes}`;
    if (String(hours).length === 1) hours = `0${hours}`;

    const userMessage = `${socket.userName}:${hours}:${minutes}: ${message}`;

    clients.forEach((clientId) => {
        io.to(clientId).emit(ACTIONS.GET_MESSAGES, {
            message: userMessage,
        });
    });
}



module.exports = {
    leaveRoom,
    join,
    realySDP,
    realyICE,
    createName,
    sendMessages,
};