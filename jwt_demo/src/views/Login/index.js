import React, { useState } from 'react';

const LoginView = (props) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const {
        authError,
        setAuthError,
        authErrorMessage,
        setAuthErrorMessage,
        setLoggedIn
    } = props;

    const handleUsernameChange = (event) => {
        setUsername(event.target.value);
    }

    const handlePasswordChange = (event) => {
        setPassword(event.target.value);
    }

    const handleSubmit = (event) => {
        event.preventDefault();
        if (username === '') {
            setAuthError(true);
            setAuthErrorMessage('Username field is required.');
        } else if (password === '') {
            setAuthError(true);
            setAuthErrorMessage('Password field is required.');
        } else {
            const requestOptions = {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  username,
                  password
                })
            };
            fetch('http://localhost:5000/api/auth/login', requestOptions)
                .then((response) => {return response.json(); })
                .then((body) => {
                    if (body.auth === true) {
                        localStorage.setItem('jwttoken', body.token);
                        localStorage.setItem('auth', true);
                        setLoggedIn(true);
                    } else {
                        localStorage.setItem('auth', false);
                        setAuthError(true);
                        setAuthErrorMessage(body.msg);
                    }
                });
        }
    }

    return (
        <fieldset>
            <legend>Login</legend>
            {authError && <p style={{color:'red'}}>{authErrorMessage}</p>}
            <label htmlFor="username">Username </label>
            <input type="text" name="username" value={username} onChange={handleUsernameChange} />
            <br />
            <label htmlFor="password">Password </label>
            <input type="password" name="password" value={password} onChange={handlePasswordChange} />
            <br />
            <button value="submit" onClick={handleSubmit} >Submit</button>
        </fieldset>
    )
}

export default LoginView;