import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Callback = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token');

        if (token) {
            console.log('JWT token received:', token);
            // Store the token (e.g., in localStorage)
            localStorage.setItem('spotifyToken', token);
            navigate('/playlists'); // Redirect to another page
        } else {
            console.error('No token found in callback URL');
        }
    }, [navigate]);

    return <div>Processing...</div>;
};

export default Callback;
