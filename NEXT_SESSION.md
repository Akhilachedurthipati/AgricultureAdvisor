# AGRICULTURE ADVISOR – NEXT SESSION HANDOVER INSTRUCTIONS

> [!IMPORTANT]
> **READ THIS FIRST IF YOU ARE STARTING A NEW SESSION / NEW ACCOUNT / RESUMING WORK**
> This file contains the exact state of development and step-by-step instructions so any developer or AI assistant can immediately resume without restarting or repeating completed work.

---

## 1. Current State Snapshot
- **Project Name:** AGRICULTURE ADVISOR
- **Current Phase:** Phase 1 Completed -> Entering **Phase 2: User Authentication & Security**
- **Repository Location:** `c:\Users\hp\Desktop\Agriculture Advisor`
- **Active Branch:** `master`

---

## 2. Last Completed Milestones
1. Git initialized and verified; strict `.gitignore` in place preventing any credentials or node_modules leakage.
2. Continuity files created and synchronized (`PROJECT_STATUS.md`, `DEVELOPMENT_LOG.md`, `NEXT_SESSION.md`, `TASK_CHECKLIST.md`, `ARCHITECTURE.md`, `README.md`).
3. Complete Express backend architecture created (`server/src/app.js`, `server/src/server.js`, `server/src/config/db.js`, `server/src/routes/health.routes.js`, error middleware).
4. Automated backend health check test written and verified (`server/test-health.js` passing with HTTP 200).
5. Complete React 18 + Vite frontend created (`client/`) with Tailwind CSS (nature green theme), Lucide React, Axios API client with interceptors.
6. Frontend production build verified (`npm run build` succeeds).

---

## 3. How to Run the Project
To run backend dev server:
```bash
npm run server
# or: cd server && npm run dev
```

To run frontend dev server:
```bash
npm run client
# or: cd client && npm run dev
```

To test backend health check:
```bash
npm run test:server
# or: cd server && npm test
```

---

## 4. Exact Next Action (Phase 2: Authentication)
Proceed directly with **Phase 2**:
1. Implement `server/src/models/User.js` Mongoose model with email, hashed password, name, phone, preferredLanguage, location.
2. Implement `server/src/utils/jwt.js` and `server/src/middleware/auth.middleware.js` for JWT token generation and verification.
3. Implement `server/src/controllers/auth.controller.js` and `server/src/routes/auth.routes.js` with Zod input validation (`/api/auth/register`, `/api/auth/login`, `/api/auth/profile`).
4. Mount auth routes in `server/src/app.js`.
5. Implement frontend `client/src/context/AuthContext.jsx` with persistent login state.
6. Create `client/src/pages/Login.jsx` and `client/src/pages/Register.jsx` with responsive UI.
7. Test authentication flow end-to-end.
