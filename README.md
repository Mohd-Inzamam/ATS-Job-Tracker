![React](https://img.shields.io/badge/React-19-blue)
![Node.js](https://img.shields.io/badge/Node.js-Backend-green)
![MongoDB](https://img.shields.io/badge/MongoDB-Database-green)
![JWT](https://img.shields.io/badge/Auth-JWT-orange)
![Groq](https://img.shields.io/badge/AI-Groq-purple)

# ATS Job Tracker

ATS Job Tracker is a full-stack AI-powered career management platform that helps job seekers optimize resumes, improve ATS compatibility, match resumes with job descriptions, track applications, prepare for interviews, and analyze job search performance.

![ATScheckerPublic](/client/src/assets/screenshots/ATScheckerPublic.png)
![ATSResultPublic](/client/src/assets/screenshots/ATSResultPublic.png)

## Live Demo

https://ats-job-tracker.vercel.app/

## Overview

Most resumes never reach a recruiter because they are filtered out by Applicant Tracking Systems (ATS).

ATS Job Tracker helps users understand why resumes fail automated screening and provides actionable insights to improve interview opportunities.

The platform combines ATS analysis, AI-powered resume coaching, job application management, interview preparation, and analytics into a single workflow.

---

## Core Features

### Resume Intelligence

- Upload and manage multiple resumes (PDF/DOCX)
- Resume parsing and text extraction
- ATS compatibility analysis with detailed scoring
- Missing section detection and optimization suggestions
- Resume quality recommendations

### Resume ↔ Job Description Matching

- Match resumes against job descriptions
- Match percentage calculation
- Matched and missing keyword analysis
- AI-generated explanations and improvement suggestions

### Application Tracking

- Manage applications across multiple companies
- Visual hiring pipeline:
  - Saved
  - Applied
  - Interview
  - Offer
  - Rejected

- Associate resumes with specific applications
- Track progress throughout the hiring journey

### AI-Powered Assistance

- AI Match Explanations
- Personalized Interview Preparation
- Resume Improvement Guidance
- Weekly Career Insights

### Analytics Dashboard

- Application performance metrics
- Resume effectiveness tracking
- Interview and offer rate analysis
- Job search trend visualization

### Authentication & Security

- JWT Authentication
- Refresh Token Management
- Email Verification
- Password Reset Workflow
- Protected Routes

---

## Tech Stack

### Frontend

- React.js
- Vite
- React Router
- Context API
- Axios
- Recharts

### Backend

- Node.js
- Express.js
- MongoDB
- Mongoose

### Authentication & Security

- JWT Authentication
- Refresh Tokens
- Bcrypt

### AI & Integrations

- Groq API
- Resume Parsing Engine
- Nodemailer

### File Handling

- Multer
- PDF / DOCX Processing

---

## Architecture

```text
ATS-Job-Tracker
│
├── client
│   ├── pages
│   ├── components
│   ├── context
│   └── services
│
└── server
    ├── controllers
    ├── routes
    ├── models
    ├── middleware
    └── utils
```

### Key Modules

- Authentication System
- Resume Management
- ATS Scoring Engine
- Resume Matching Engine
- Application Tracking
- Analytics Dashboard
- AI Services

---

## Screenshots

Screenshots are included in the repository at: /client/src/assets/screenshots

Example markdown to display one of these images:

![Dashboard](/client/src/assets/screenshots/UserDashboard.png)
![Login](/client/src/assets/screenshots/Login.png)
![Register](/client/src/assets/screenshots/Register.png)
![ATScheckerPublic](/client/src/assets/screenshots/ATScheckerPublic.png)
![ATSResultPublic](/client/src/assets/screenshots/ATSResultPublic.png)

---

## Getting Started

### Clone Repository

```bash
git clone https://github.com/Mohd-Inzamam/ATS-Job-Tracker.git
cd ATS-Job-Tracker
```

### Server Setup

```bash
cd server
npm install
npm run dev
```

### Client Setup

```bash
cd client
npm install
npm run dev
```

---

## Environment Variables

Create a `.env` file inside the server directory:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string

JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_jwt_refresh_secret

FRONTEND_URL=http://localhost:5173

SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=
EMAIL_FROM=

GROQ_API_KEY=
```

---

## Future Enhancements

- Advanced NLP Resume Parsing
- LinkedIn Job Import
- Bulk Resume Analysis
- Docker Deployment
- CI/CD Pipeline
- Automated Testing
- Role-Based Access Control

---

## Contributing

Contributions are welcome! Please open an issue first to discuss what you'd like to change.

## Author

Mohd Injmam

Full Stack MERN Developer

GitHub: https://github.com/Mohd-Inzamam

LinkedIn: https://www.linkedin.com/in/inzamam-sheikh/
