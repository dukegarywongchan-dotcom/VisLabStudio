# VisLab Studio

A comprehensive chemistry simulator with multiplayer features, 3D visualization, and educational tools.

## Features

- Multiplayer experiment lobbies
- Roles: spectator, editor, helper
- Pop questions and polls
- Teacher demos
- Educational, fun, and normal modes
- Search for glassware, chemicals, apparatus
- Zoomable 3D visualization
- Scalable architecture
- Web app, mobile, downloadable .zip, and wiki support

## Project Structure

- `backend/` - Flask backend with SocketIO
- `frontend/` - React frontend with Three.js
- `mobile/` - Placeholder for React Native
- `wiki/` - MkDocs documentation
- `shared/` - Shared utilities
- `tests/` - Test files
- `docs/` - Additional documentation

## Setup

### Backend

```bash
cd backend
pip install -r requirements.txt
python app.py
```

### Frontend

```bash
cd frontend
npm install
npm start
```

### Wiki

```bash
cd wiki
pip install -r requirements.txt
mkdocs serve
```

## License

See LICENSE file.