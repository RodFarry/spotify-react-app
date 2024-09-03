import React from 'react';

const Login = () => {
    const handleLogin = () => {
        console.log('Logging in with Spotify');
        window.location.href = 'http://localhost:5001/api/login';
    };

    return (
        <div>
            <h2>Login with Spotify</h2>
            <button onClick={handleLogin}>Login with Spotify</button>
        </div>
    );
};

export default Login;
