import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Callback from './components/Callback';
import Channels from './components/Channels';
import Channel from './components/Channel';
import Login from './components/Login';
import { useEffect, useState } from 'react';
import { getValidSpotifyToken } from './utils/spotifyToken';

function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        // Check if spotifyTokenData exists in localStorage and if the token is valid
        const checkAuthentication = async () => {
            const tokenData = localStorage.getItem('spotifyTokenData');
            if (tokenData) {
                try {
                    const token = await getValidSpotifyToken(); // Validate or refresh the token
                    if (token) {
                        setIsAuthenticated(true);
                    }
                } catch (error) {
                    console.error('Error validating Spotify token:', error);
                    setIsAuthenticated(false);
                }
            }
        };

        checkAuthentication();
    }, []);

    return (
        <Router>
            <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/callback" element={<Callback />} />
                <Route path="/channels" element={<Channels />} />
                <Route path="/channels/:channelId" element={<Channel />} />
            </Routes>
        </Router>
    );
}

export default App;
