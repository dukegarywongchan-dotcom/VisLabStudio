import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import io from 'socket.io-client';

const socket = io();

function Lobby() {
  const { id } = useParams();
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    socket.emit('join_lobby', { user_id: 1, lobby_id: id }); // Placeholder user_id

    socket.on('receive_message', (data) => {
      setMessages(prev => [...prev, data]);
    });

    return () => {
      socket.emit('leave_lobby', { user_id: 1 });
    };
  }, [id]);

  const sendMessage = () => {
    socket.emit('send_message', { message, lobby_id: id });
    setMessage('');
  };

  return (
    <div>
      <h1>Lobby {id}</h1>
      <Link to={`/experiment/1`}>Start Experiment</Link>
      <div>
        <h2>Chat</h2>
        <ul>
          {messages.map((msg, index) => <li key={index}>{msg.message}</li>)}
        </ul>
        <input value={message} onChange={e => setMessage(e.target.value)} />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
}

export default Lobby;