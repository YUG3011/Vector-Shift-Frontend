# Frontend Technical Assessment — VectorShift (Local README)

This project contains a small React + React Flow frontend and a FastAPI backend used for the VectorShift frontend technical assessment.

Run the backend:

```powershell
cd ./backend
pip install -r requirements.txt
uvicorn main:app --reload
```

Run the frontend:

```powershell
cd ./frontend
npm install
npm start
```

Run the tests:

```powershell
# backend tests
cd ./backend
pytest

# frontend tests (from the frontend folder)
npm test -- --watch=false
```

Features implemented
- Node abstraction (`frontend/src/nodes/NodeBase.js`)
- Refactored nodes using NodeBase
- Five demo nodes
- Text node resizing + dynamic variable handles
- Inspector panel for editing node data
- Save/Load pipeline to `localStorage`
- Backend `/pipelines/parse` validation endpoint and `/pipelines/execute` endpoint that streams an execution order
- Inline variable validation with warnings + toast gating to prevent invalid submissions
- Accessible toolbar (keyboard-friendly buttons), visible handle labels, high-contrast light/dark themes

Notes
- Save/Load uses browser `localStorage` under key `vs_pipeline`.
- The backend should be running on `http://localhost:8000` for Validate/Execute to work.
- Use **Validate Pipeline** for DAG check and **Execute Pipeline** to call the backend runner.
