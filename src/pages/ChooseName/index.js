import { useState } from "react";
import { useHistory, useParams } from "react-router";
import { socket } from "../../socket";
import ACTIONS from "../../socket/actions";

export default function ChooseName () {
    const [name, setName] = useState('');
    const {id} = useParams();
    const history = useHistory();
    
    function connect () {
        if (name.trim() === '') {return setName('');};
        createName();
        history.push(`/room/${id}`);
    }

    function createName () {
        sessionStorage.setItem('userName', name);
        socket.emit(ACTIONS.CREATE_NAME, {userName: name});
    }

    function onKeyDownHandler (e) {
        if (e.keyCode === 13) connect();
    }

    return (
            <section className="main">
                <div className="main_container container">
                    <div className="main_form">
                        <input onChange={(e) => {setName(e.target.value)}} onKeyDown={onKeyDownHandler} value={name} placeholder="write your name"></input>
                        <button onClick={connect}>Connect</button>
                    </div>
                </div>
            </section>
    )
}