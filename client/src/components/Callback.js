import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Callback = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const searchParams = new URLSearchParams(window.location.search);
        const accessToken = searchParams.get('accessToken');

        if (accessToken) {
            localStorage.setItem('spotifyAccessToken', accessToken);
            navigate('/playlists');
        } else {
            console.error('Access token not found in callback URL');
            navigate('/');
        }
    }, [navigate]);

    return <div>Loading...</div>;
};

export default Callback;
