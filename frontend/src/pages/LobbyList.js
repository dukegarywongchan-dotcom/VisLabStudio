import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

function LobbyList() {
  const [lobbies, setLobbies] = useState([]);

  useEffect(() => {
    loadLobbies();
  }, []);

  const loadLobbies = () => {
    axios.get('/api/lobbies')
      .then(response => setLobbies(response.data))
      .catch(error => console.error('Failed to load lobbies:', error));
  };

  const createLobby = async () => {
    const name = window.prompt('Enter a name for the new lobby:', 'New Experiment Lobby');
    if (!name) return;

    const mode = window.prompt('Enter mode (educational, fun, normal):', 'educational');
    if (!mode) return;

    try {
      const response = await axios.post('/api/lobbies', {
        name,
        mode,
      });
      setLobbies(prev => [...prev, response.data]);
    } catch (error) {
      console.error('Failed to create lobby:', error);
      window.alert('Unable to create lobby. Please try again.');
    }
  };

  return (
    <div>
      <h1>VisLab Studio - Lobbies</h1>
      <ul>
        {lobbies.map(lobby => (
          <li key={lobby.id}>
            <Link to={`/lobby/${lobby.id}`}>{lobby.name} ({lobby.mode})</Link>
          </li>
        ))}
      </ul>
      <button onClick={createLobby}>Create Lobby</button>
    </div>
  );
}

export default LobbyList;