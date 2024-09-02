import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Playlist from './components/Playlist';
import Login from './components/Login';
import Leaderboard from './components/Leaderboard';

function App() {
    return (
        <Router>
            <div className="App">
                <Routes>
                    <Route path="/" element={<Login />} />
                    <Route path="/playlists" element={<Playlist />} />
                    <Route path="/leaderboard" element={<Leaderboard />} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;