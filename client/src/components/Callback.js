import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

const Callback = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token');

        if (token) {
            try {
                const decoded = jwtDecode(token);
                const expiresAt = new Date().getTime() + 3600 * 1000; // Assuming token expires in 1 hour

                const tokenData = {
                    accessToken: decoded.accessToken,
                    refreshToken: decoded.refreshToken, // Ensure refreshToken is also stored if needed
                    expiresAt,
                };

                localStorage.setItem('spotifyTokenData', JSON.stringify(tokenData));
                
                // Navigate to the channels page
                navigate('/channels');
            } catch (error) {
                console.error('Error decoding or storing the token:', error);
            }
        } else {
            console.error('No token found in callback URL');
        }
    }, [navigate]);

    return <div>Processing...</div>;
};

export default Callback;
