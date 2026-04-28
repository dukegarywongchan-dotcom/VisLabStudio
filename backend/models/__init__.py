from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    role = db.Column(db.String(20), nullable=False)  # spectator, editor, helper
    lobby_id = db.Column(db.Integer, db.ForeignKey('lobby.id'), nullable=True)
    lobby = db.relationship('Lobby', back_populates='users', foreign_keys=[lobby_id])

class Lobby(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    mode = db.Column(db.String(20), nullable=False)  # educational, fun, normal
    teacher_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=True)
    users = db.relationship('User', back_populates='lobby', foreign_keys='User.lobby_id', lazy=True)
    teacher = db.relationship('User', foreign_keys=[teacher_id], backref='teaching_lobbies', uselist=False)

class Experiment(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    lobby_id = db.Column(db.Integer, db.ForeignKey('lobby.id'), nullable=False)
    chemicals = db.Column(db.Text, nullable=True)  # JSON string
    apparatus = db.Column(db.Text, nullable=True)  # JSON string