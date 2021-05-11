const ACTIONS = {
    JOIN: 'join',
    LEAVE: 'leave',
    SHARE_ROOMS: 'share-rooms',
    ADD_PEER: 'add-peer',
    REMOVE_PEER: 'remove-peer',
    RELAY_SDP: 'relay-sdp',
    RELAY_ICE: 'relay-ice',
    ICE_CANDIDATE: 'ice-candidate',
    SESSION_DESCRIPTION: 'session-description',
    CREATE_NAME: 'create-name',
    GET_NAME: 'get-name',
    SEND_MESSAGE: 'send-message',
    GET_MESSAGES: 'get-messages'
}

module.exports = ACTIONS;