# AGRICULTURE ADVISOR – NEXT SESSION HANDOVER INSTRUCTIONS

> [!IMPORTANT]
> **READ THIS FIRST IF YOU ARE STARTING A NEW SESSION / NEW ACCOUNT / RESUMING WORK**
> This file contains the exact state of development and step-by-step instructions so any developer or AI assistant can immediately resume without restarting or repeating completed work.

---

## 1. Current State Snapshot
- **Project Name:** AGRICULTURE ADVISOR
- **Current Phase:** Phase 1: Project Setup & MERN Foundation
- **Active Task:** Completing Phase 1 server & client setup, connecting health check API, and verifying end-to-end communication.
- **Repository Location:** `c:\Users\hp\Desktop\Agriculture Advisor`

---

## 2. Last Completed Milestones
1. Git initialized and `.gitignore` configured.
2. All 5 core continuity and architecture documentation files established.
3. System runtime verified (Node.js v21, npm 10.5, Python 3.13, Git).

---

## 3. Files Currently Active / In Scope
- `server/package.json`
- `server/src/app.js`
- `server/src/server.js`
- `server/src/config/db.js`
- `server/src/routes/health.routes.js`
- `client/package.json`
- `client/src/App.jsx`
- `client/src/services/api.js`

---

## 4. Commands to Resume / Test
To run backend:
```bash
cd server
npm install
npm run dev
```

To run frontend:
```bash
cd client
npm install
npm run dev
```

---

## 5. Exact Next Action
Complete backend Express architecture with MongoDB connection and health check route, initialize React + Vite frontend, establish Axios client, and verify `/api/health` test.
