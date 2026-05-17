# Smart Leads Dashboard

A smart dashboard to manage sales leads — track, filter, search, and export leads with role-based access for Admins and Sales users.

---

## Tech Stack

**Frontend** — React + TypeScript + TailwindCSS + Vite  
**Backend** — Node.js + Express + TypeScript  
**Database** — MongoDB + Mongoose  
**Auth** — JWT + bcryptjs  
**DevOps** — Docker + Docker Compose

---

## Features

- JWT Authentication (Register / Login)
- Role-Based Access Control (Admin / Sales)
- Full CRUD for Leads
- Advanced Filtering — by status, source, name/email search (with debounce)
- Sort by latest / oldest
- Backend pagination (10 per page)
- CSV Export
- Responsive UI

---

## Project Structure

```
smart-leads/
├── backend/
│   ├── src/
│   │   ├── controllers/     # Route handlers
│   │   ├── middleware/      # Auth middleware
│   │   ├── models/          # Mongoose schemas
│   │   ├── routes/          # Express routers
│   │   └── index.ts         # Entry point
│   ├── .env.example
│   ├── Dockerfile
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── api/             # Axios instance
│   │   ├── components/      # Reusable UI components
│   │   ├── context/         # Auth context
│   │   ├── pages/           # Page components
│   │   ├── types/           # TypeScript interfaces
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── .env.example
│   ├── Dockerfile
│   └── package.json
└── docker-compose.yml
```

---

## Setup (Without Docker)

### Prerequisites
- Node.js v18+
- MongoDB running locally

### Backend

```bash
cd backend
npm install
cp .env.example .env
# Edit .env and set your MONGO_URI and JWT_SECRET
npm run dev
```

Backend runs at: `http://localhost:5000`

### Frontend

```bash
cd frontend
npm install
cp .env.example .env
# VITE_API_URL should point to your backend
npm run dev
```

Frontend runs at: `http://localhost:3000`

---

## Setup (With Docker)

```bash
# From the project root
docker-compose up --build
```

This starts MongoDB, the backend, and the frontend together.

- Frontend → https://smart-leads-dashboard-si3t.vercel.app  
- Backend API → https://smart-leads-dashboard-fgf5.onrender.com/api  

---

## Environment Variables

### Backend `.env`
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/smart-leads
JWT_SECRET=your_secret_key_here
```

### Frontend `.env`
```
VITE_API_URL=http://localhost:5000/api
```

---

## Default Roles

When registering, you can select a role:
- **admin** — can view all leads, delete leads
- **sales** — can only view/manage leads they created

---

## API Overview

See `API_DOCS.md` for the full reference.

Base URL: `https://smart-leads-dashboard-fgf5.onrender.com/api`

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | /auth/register | No | Register a new user |
| POST | /auth/login | No | Login |
| GET | /auth/me | Yes | Get current user |
| GET | /leads | Yes | List leads (with filters) |
| POST | /leads | Yes | Create a lead |
| GET | /leads/stats | Yes | Get lead stats |
| GET | /leads/export | Yes | Export leads as CSV |
| GET | /leads/:id | Yes | Get single lead |
| PUT | /leads/:id | Yes | Update a lead |
| DELETE | /leads/:id | Admin | Delete a lead |

---

## Notes

This was built as a full-stack internship assignment. The goal was to keep things simple and readable — no over-engineering, just clean code that works.
