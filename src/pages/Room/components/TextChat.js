import { useEffect, useRef, useState } from "react";
import { socket } from "../../../socket";
import ACTIONS from '../../../socket/actions';

export default function TextChat ({roomId}) {
    const [messages, setMessages] = useState([]);
    const [messageInput, setMessageInput] = useState('');
    const scrollRef = useRef();

    useEffect( () => {
       socket.on(ACTIONS.GET_MESSAGES, ({message}) => {
        if (scrollRef.current.clientHeight >= scrollRef.current.scrollHeight - scrollRef.current.scrollTop ) {
            setMessages( (prev) => [...prev, message]);
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight
          } else {
            setMessages( (prev) => [...prev, message]);
          }
       });

       return () => socket.off(ACTIONS.GET_MESSAGES);
    }, [])

    function onKeyDownHandler (e) {
        if (e.keyCode === 13) sendMessage();
    }

    function sendMessage () {
        if (messageInput.trim() === '') return;
        socket.emit(ACTIONS.SEND_MESSAGE, {message: messageInput, roomId});
        setMessageInput('');
    }


    return (
    <div ref={scrollRef}  className="text--chat"> 
        <div className="text--chat__text">
            {messages.map( (message, index) => {
               return <div className="text--chat__message" key={index}>{message}</div>
            })}
        </div>
        <div className="text--chat_button">
          <input onChange={ (e) => setMessageInput(e.target.value)} onKeyDown={onKeyDownHandler} value={messageInput}></input>
          <button onClick={sendMessage}>send</button>
        </div>
    </div>
    )
} 