import React, { useEffect, useState } from 'react';
import DashboardView from './views/DashboardView';
import LoginView from './views/Login';

function App() {
  const [loggedIn, setLoggedIn] = useState(localStorage.getItem('auth'));
  const [authError, setAuthError] = useState(false);
  const [authErrorMessage, setAuthErrorMessage] = useState('');

  useEffect(() => {
    fetch('http://localhost:5000/api/auth/verify', { headers: { 'x-access-token': localStorage.getItem('jwttoken') }})
      .then((res) => { return res.json(); })
      .then((body) => {
        if (body.auth === false) {
          if (localStorage.getItem('jwttoken')) {
            setAuthError(true);
            setAuthErrorMessage('Login invalidated. Please login again.');
          }
          setLoggedIn(false);
        } else {
          setLoggedIn(true);
          setAuthError(false);
          setAuthErrorMessage('');
        }
      })
  });

  return (
    <div >
      {!loggedIn
        ? <LoginView
          authError={authError}
          setAuthError={setAuthError}
          authErrorMessage={authErrorMessage}
          setAuthErrorMessage={setAuthErrorMessage}
          setLoggedIn={setLoggedIn}
          />
        : <DashboardView setLoggedIn={setLoggedIn} />
      }
    </div>
  );
}

export default App;
