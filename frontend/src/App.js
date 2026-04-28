import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LobbyList from './pages/LobbyList';
import Lobby from './pages/Lobby';
import Experiment from './pages/Experiment';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<LobbyList />} />
          <Route path="/lobby/:id" element={<Lobby />} />
          <Route path="/experiment/:id" element={<Experiment />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;