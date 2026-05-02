from flask import Flask, request, jsonify
from flask_socketio import SocketIO, emit, join_room, leave_room
from flask_cors import CORS
from models import db, User, Experiment, Lobby
import os

app = Flask(__name__)
app.config['SECRET_KEY'] = 'your-secret-key'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///vislab.db'
CORS(app)
socketio = SocketIO(app, cors_allowed_origins="*", async_mode='threading')

db.init_app(app)

with app.app_context():
    db.create_all()

# Import routes
from routes.api import api_bp

app.register_blueprint(api_bp, url_prefix='/api')

# SocketIO events
@socketio.on('join_lobby')
def handle_join_lobby(data):
    user_id = data['user_id']
    lobby_id = data['lobby_id']
    user = User.query.get(user_id)
    if user:
        user.lobby_id = lobby_id
        db.session.commit()
        join_room(str(lobby_id))
        emit('user_joined', {'user_id': user_id, 'username': user.username}, room=str(lobby_id))

@socketio.on('leave_lobby')
def handle_leave_lobby(data):
    user_id = data['user_id']
    user = User.query.get(user_id)
    if user and user.lobby_id:
        leave_room(str(user.lobby_id))
        user.lobby_id = None
        db.session.commit()
        emit('user_left', {'user_id': user_id}, room=str(user.lobby_id))

@socketio.on('send_message')
def handle_send_message(data):
    emit('receive_message', data, room=data['lobby_id'])

@socketio.on('add_chemical')
def handle_add_chemical(data):
    # Placeholder for adding chemical to experiment
    emit('chemical_added', data, room=data['lobby_id'])

if __name__ == '__main__':
    socketio.run(app, host='0.0.0.0', port=5000, debug=False)