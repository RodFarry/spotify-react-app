import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

const Callback = () => {
    console.log('Callback.js rendered'); // To verify component rendering

    const navigate = useNavigate();

    useEffect(() => {
        console.log('useEffect triggered'); // Verify useEffect is running

        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token');

        if (token) {
            try {
                const decoded = jwtDecode(token);
                console.log('Decoded JWT:', decoded); // Log the decoded token

                // Store the token in localStorage
                localStorage.setItem('spotifyToken', token);
                
                // Navigate to channels
                navigate('/channels');
            } catch (error) {
                console.error('Error decoding JWT:', error);
            }
        } else {
            console.error('No token found in callback URL');
        }
    }, [navigate]);

    return <div>Processing...</div>;
};

export default Callback;
