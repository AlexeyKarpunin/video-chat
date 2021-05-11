import {useState } from 'react';
import { useHistory } from 'react-router';
import {v4} from 'uuid';
import { socket } from '../../socket';
import ACTIONS from '../../socket/actions';
import './index.css';

export default function Main () {
    const [name, setName] = useState('');
    const history = useHistory();

    function connect () {
        if (name.trim() === '') {return setName('');};
        createName();
        history.push(`/room/${v4()}`);
    }

    function createName () {
        sessionStorage.setItem('userName', name);
        socket.emit(ACTIONS.CREATE_NAME, {userName: name});
    }

    function onChangeInputHandler (e) {
        setName(e.target.value)
    }

    function onKeyDownHandler (e) {
        if (e.keyCode === 13) connect();
    }

    return (
            <section className="main">
                <div className="main_container container">
                    <div className="main_form">
                        <input onChange={onChangeInputHandler} onKeyDown={onKeyDownHandler} value={name} placeholder="write your name"></input>
                        <button onClick={connect}>Create</button>
                    </div>
                </div>
            </section>
    )
}