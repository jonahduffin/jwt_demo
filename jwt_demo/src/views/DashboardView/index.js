import React, { useState } from 'react';
import { decodeToken } from 'react-jwt';

const MessageOfTheDay = (props) => {
    const { setLoggedIn } = props;
    const [message, setMessage] = useState('');

    const handleMessage = (event) => {
        event.preventDefault();
        fetch('http://localhost:5000/api/messageoftheday', 
            {
                headers: {
                'x-access-token': localStorage.getItem('jwttoken')
                }
            })
            .then((res) => { console.log(res); return res.json(); })
            .then((body) => {
                if (body.auth === false) {
                    setLoggedIn(false);
                } else {
                    setMessage(body.message);
                }
            });
    };

    return (
        <fieldset>
            <legend>Message of the Day</legend>
            <label htmlFor="message">Click here for the Message of the Day! </label>
            <button name="message" onClick={handleMessage} >Obtain</button>
            <br></br>
            <p style={{color: 'blue', fontWeight: 'bold'}}>{message}</p>
        </fieldset>
    )
}

const AdminOnlyComponent = (props) => {

    const { setLoggedIn } = props;
    const [secretMessage, setSecretMessage] = useState('');

    const handleSecretMessage = (event) => {
        event.preventDefault();
        fetch('http://localhost:5000/api/secretmessage', 
            {
                headers: {
                'x-access-token': localStorage.getItem('jwttoken')
                }
            })
            .then((res) => { return res.json(); })
            .then((body) => {
                if (body.auth === false) {
                    setLoggedIn(false);
                } else {
                    setSecretMessage(body.secretmessage);
                }
            });
    }
    return (
        <fieldset>
            <legend>Secret Admin Component</legend>
            <label htmlFor="secretmessage">Click here for a secret message! </label>
            <button name="secretmessage" onClick={handleSecretMessage} >Obtain</button>
            <br></br>
            <p style={{color: 'red', fontWeight: 'bold'}}>{secretMessage}</p>
        </fieldset>
    )
}

const DashboardView = (props) => {
    const { setLoggedIn } = props;
    const jwttoken = localStorage.getItem('jwttoken');
    const decodedToken = jwttoken !== null ? decodeToken(jwttoken) : null;
    const isAdmin = decodedToken ? decodedToken['is_admin'] : false;

    const handleLogout = (event) => {
        event.preventDefault();
        localStorage.clear();
        setLoggedIn(false);
    }
    return (
        <div>
            <button onClick={handleLogout}>
                Logout
            </button>
            <br /><br />
            <MessageOfTheDay setLoggedIn={setLoggedIn} />
            <br />
            {isAdmin && <AdminOnlyComponent setLoggedIn={setLoggedIn} />}
        </div>
    )
}

export default DashboardView;