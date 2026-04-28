from flask import Blueprint, request, jsonify
from models import db, User, Lobby, Experiment
import json

api_bp = Blueprint('api', __name__)

@api_bp.route('/lobbies', methods=['GET'])
def get_lobbies():
    lobbies = Lobby.query.all()
    return jsonify([{'id': l.id, 'name': l.name, 'mode': l.mode} for l in lobbies])

@api_bp.route('/lobbies', methods=['POST'])
def create_lobby():
    data = request.json
    lobby = Lobby(name=data['name'], mode=data['mode'])
    db.session.add(lobby)
    db.session.commit()
    return jsonify({'id': lobby.id, 'name': lobby.name, 'mode': lobby.mode}), 201

@api_bp.route('/experiments', methods=['POST'])
def create_experiment():
    data = request.json
    experiment = Experiment(name=data['name'], lobby_id=data['lobby_id'])
    db.session.add(experiment)
    db.session.commit()
    return jsonify({'id': experiment.id, 'name': experiment.name}), 201

@api_bp.route('/search', methods=['GET'])
def search():
    query = request.args.get('q')
    # Placeholder for search functionality
    return jsonify({'results': []})