# ResumeTracker

Project Overview
----------------
ResumeTracker is a full-stack Resume / ATS toolkit that lets users upload and parse resumes, run ATS compatibility checks, match resumes to job descriptions, track job applications, and view analytics. The server is built with Node/Express and MongoDB; the client is a React (Vite) app.

Features
--------
- User authentication (JWT + refresh tokens), email verification, password reset
- Upload, store and parse resumes (PDF/DOCX)
- Public ATS checker and private dashboard ATS scoring
- Resume ↔ Job Description matcher with a match score
- Job application tracking (pipeline statuses)
- Analytics dashboards for resume and application performance

Tech Stack
----------
- Server: Node.js, Express, MongoDB / Mongoose
- Auth: JSON Web Tokens (access + refresh)
- Email: SMTP (nodemailer)
- Client: React + Vite
- File uploads: multer
- Dev tools: nodemon / Vite dev server

Architecture
------------
- client/ — React app (Vite). Handles UI, auth flows, file uploads, and calls server APIs.
- server/ — Express API. Routes grouped by function (auth, resumes, ats, match, applications, analytics).
  - controller/ — request handlers (authController, atsController, matchController, etc.)
  - models/ — Mongoose schemas (User, Resume, JobApplication, ...)
  - routes/ — Express routes wired in server.js
  - utils/ — helpers (ATS scoring, match scoring, email helpers)
  - middleware/ — auth, file upload, error handling
- Authentication:
  - Access token: short-lived JWT returned to client
  - Refresh token: longer-lived JWT sent to client and hashed in DB for rotation
- CORS:
  - Server includes middleware for CORS; ensure x-refresh-token is allowed/exposed for token refresh flows

Screenshots
-----------
I'll soon add Screenshots.

Example:
![ATS Upload](./screenshots/ats-upload.png)
![Dashboard](./screenshots/dashboard.png)

Installation
------------
(Windows — PowerShell / CMD / Git Bash)

1. Clone repo (if needed)
   - git clone <repo-url>
   - cd d:\React\Projects\RESUMETRACKER

2. Server
   - cd server
   - npm install
   - copy .env.example .env        (CMD)  
     OR cp .env.example .env      (Git Bash / PowerShell)
   - Fill .env with required values (see below)
   - npm run dev                  (or npm start depending on package.json)

3. Client
   - cd ..\client
   - npm install
   - npm run dev

4. Open the client dev URL (Vite will show it, usually http://localhost:5173) and the API server (default PORT in .env or 5000).

Environment Variables
---------------------
Create server/.env with at least:

- PORT=5000
- MONGO_URI=your_mongodb_connection_string
- JWT_SECRET=your_jwt_secret
- JWT_REFRESH_SECRET=your_jwt_refresh_secret
- FRONTEND_URL=http://localhost:5173
- SMTP_HOST=smtp.example.com
- SMTP_PORT=587
- SMTP_USER=your_smtp_user
- SMTP_PASS=your_smtp_password
- EMAIL_FROM="ResumeTracker <no-reply@example.com>"

Optional:
- CLOUDINARY_URL or other storage keys if used
- NODE_ENV=development

Future Enhancements
-------------------
- Stronger refresh-token rotation (httpOnly cookie + rotated refresh tokens)
- Improve parsing accuracy (NLP / resume parsing library)
- Add role-based access control (admin / user)
- Job import (from LinkedIn / CSV) and bulk resume parsing
- CI/CD pipeline and Docker Compose for easy local deployment
- Automated tests (unit + integration) and API contract tests

If you want, I can generate a .env.example or scaffold screenshots folder and a brief
