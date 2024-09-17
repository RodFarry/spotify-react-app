import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Callback from './components/Callback';
import Channels from './components/Channels';
import Channel from './components/Channel';
import Login from './components/Login';
import { useEffect, useState } from 'react';

function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        // Check if a token exists in localStorage
        const token = localStorage.getItem('spotifyToken');
        if (token) {
            setIsAuthenticated(true);
        }
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