import { useEffect, useState } from "react";
import {useParams } from "react-router"
import useWebRTC from "../../hooks/useWebRTC";
import { socket } from "../../socket";
import noneVideo from "../../imges/none-video.png";
import ioreq from "socket.io-request";
import './index.css';
import ACTIONS from "../../socket/actions";
import TextChat from './components/TextChat';

export default function Room () {
    const {id} = useParams();
    const {clients, provideMediaRef, localVideo} = useWebRTC(id);
    const [media, setMedia] = useState(undefined);

    useEffect( () => {
        const userName = sessionStorage.getItem("userName");
        if (userName) {
            socket.emit(ACTIONS.CREATE_NAME, {userName: userName});
        } else {
            window.location = `/name/${id}`;
        };
    }, []);


    useEffect ( () => {
        if (localVideo.current) setMedia(localVideo.current.getTracks());
    }, [localVideo.current]);

    const setVideo = () => {
        const [_, video] = media;
        video.enabled ? video.enabled = false : video.enabled = true;
    }

    const setAudio = () => {
        const [audio] = media;
        audio.enabled ? audio.enabled = false : audio.enabled = true;
    }

    return (
            <section className="room">
                <div className="room_container container">
                  <div className="chat">
                      <div className="video--chat">
                        {clients.map( (clientID) => {
                                return (
                                     <div className="video--chat__video--box" key={clientID}>
                                        <video 
                                          ref={ (instance) => {
                                              provideMediaRef(clientID, instance)
                                          }}
                                          poster={noneVideo}
                                          autoPlay
                                          playsInline
                                          muted={clientID === socket.id}
                                          style={{width: '100%'}}
                                        />
                                        <Name userId={clientID} roomId={id} />
                                        {clientID === socket.id ? <div className="video--chat__btns">
                                            <button onClick={setVideo}></button>
                                            <button onClick={setAudio}></button>
                                        </div> : null}
                                    </div>
                                );
                        })}
                      </div>
                      <TextChat roomId={id} />
                  </div>
                </div>
            </section>
    )
}

function Name ({userId, roomId}) {
    const [name, setName] = useState('');

    useEffect( () => {
        ioreq(socket).request(ACTIONS.GET_NAME, {userId, roomId})
        .then(function(res){
            setName(res);
        })
        .catch(function(err){
          console.error(err.stack || err);
        });
    }, [])


    return <div className="video--chat__text">{name}</div>
}
