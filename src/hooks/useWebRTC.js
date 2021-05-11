import { useCallback, useEffect, useRef, useState } from "react";
import freeice from 'freeice';
import {socket} from '../socket/index';
import ACTIONS from "../socket/actions";


export default function useWebRTC (roomID) {
    const [clients, setClients] = useState([]);

    
    const provideMediaRef = (id, node) => peerMediaElements.current[id] = node;


    const addNewClient = useCallback( (newClient, cb) => {
        if (!clients.includes(newClient)) {
            setClients( list => [...list, newClient]);
            cb();
        };
    }, [clients]);



    const peerConnection = useRef({});
    const localMediaStream = useRef(null);
    const peerMediaElements = useRef({
        [socket.id]: null,
    });

    // create peer Connection
    useEffect( () => {
        async function handleNewPeer({peerId, createOffer}) {
            if (peerId in peerConnection.current) {
                return console.warn(`Already connected to peer ${peerId}`)
            }

            peerConnection.current[peerId] = new RTCPeerConnection({
                iceServers: freeice(), // free STAN
            });

            peerConnection.current[peerId].onicecandidate = event => {
                if (event.candidate) {
                    socket.emit(ACTIONS.RELAY_ICE, {
                        peerId,
                        iceCandidate: event.candidate,
                    });
                }
            }

            let tracksNumber = 0;


            peerConnection.current[peerId].ontrack = ({streams: [remoteStream]}) => {
                tracksNumber++;
                if (tracksNumber === 2) { // video and audio
                    addNewClient(peerId, () => {
                        peerMediaElements.current[peerId].srcObject = remoteStream;
                    });
                }
            }

            localMediaStream.current.getTracks().forEach(track => {
                peerConnection.current[peerId].addTrack(track, localMediaStream.current);
            });

            if (createOffer) {
                const offer = await peerConnection.current[peerId].createOffer();

                await peerConnection.current[peerId].setLocalDescription(offer);

                socket.emit(ACTIONS.RELAY_SDP, {
                    peerId,
                    sessionDescription: offer,
                })
            }
        }
        socket.on(ACTIONS.ADD_PEER, handleNewPeer);

        return () => {
            socket.off(ACTIONS.ADD_PEER);
        }
    }, []);

     
    // reaction no the created session;

    useEffect( () => {
        async function setRemoutMedia({peerId, sessionDescription: remoutDescription}) {
            await peerConnection.current[peerId].setRemoteDescription(
                new RTCSessionDescription(remoutDescription)
                );

                if (remoutDescription.type === 'offer') {
                    const answer = await peerConnection.current[peerId].createAnswer();
                    await peerConnection.current[peerId].setLocalDescription(answer);

                    socket.emit(ACTIONS.RELAY_SDP, {
                        peerId,
                        sessionDescription: answer,
                    });
                }
        }
        socket.on(ACTIONS.SESSION_DESCRIPTION, setRemoutMedia);

        return () => {
            socket.off(ACTIONS.SESSION_DESCRIPTION);
        }
    }, []);


    // reaction no new iceCandidata;
    useEffect( () => {
        socket.on(ACTIONS.ICE_CANDIDATE, ({peerId, iceCandidate}) => {
            peerConnection.current[peerId].addIceCandidate(
                new RTCIceCandidate(iceCandidate)
            );
        });

        return () => {
            socket.off(ACTIONS.ICE_CANDIDATE);
        }
    }, []);

    // reaction on user leave
    useEffect( () => {
        socket.on(ACTIONS.REMOVE_PEER, ({peerId}) => {
            if(peerConnection.current[peerId]) {
                peerConnection.current[peerId].close();
            }

            delete peerConnection.current[peerId];
            delete peerMediaElements.current[peerId];

            setClients( list => list.filter( client => client !== peerId));
        })

        return () => {
            socket.off(ACTIONS.REMOVE_PEER);
        }
    }, [])

    useEffect( () => {
        async function startCapture() {
            localMediaStream.current = await navigator.mediaDevices.getUserMedia({
                audio: true,
                video: true
            });

            addNewClient(socket.id, () => {
                const localVideoElement = peerMediaElements.current[socket.id];

                if (localVideoElement) {
                    localVideoElement.volume = 0;
                    localVideoElement.srcObject = localMediaStream.current;
                }
            });
        };
        
        startCapture().then( () => socket.emit(ACTIONS.JOIN, {room: roomID}))
        .catch( (e) => console.error('Error getting userMedia:', e));

        return () => {
            localMediaStream.current.getTracks().forEach( track => track.stop());
            socket.emit(ACTIONS.LEAVE);
        }
    }, [])

    return {clients, provideMediaRef, localVideo: localMediaStream};
}