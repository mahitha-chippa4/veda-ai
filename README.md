# VedaAI — AI Assessment Creator

> An AI-powered system that lets teachers create structured exam papers in seconds using Google Gemini, with real-time WebSocket progress updates, Redis caching, and BullMQ background job processing.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                          FRONTEND (Next.js 16)                       │
│                                                                       │
│  ┌──────────────┐  ┌───────────────────┐  ┌──────────────────────┐  │
│  │  Create Form  │  │  Assignment List  │  │  Paper Viewer + PDF  │  │
│  │  (4-step)    │  │  (Zustand store)  │  │  Export (jsPDF)      │  │
│  └──────┬───────┘  └─────────┬─────────┘  └──────────┬───────────┘  │
│         │                    │                        │               │
│         └────────────────────┼────────────────────────┘              │
│                              │  HTTP + WebSocket                      │
└──────────────────────────────┼────────────────────────────────────────┘
                               │
┌──────────────────────────────▼────────────────────────────────────────┐
│                        BACKEND (Node.js + Express)                     │
│                                                                        │
│  ┌──────────────┐   ┌──────────────┐   ┌──────────────────────────┐  │
│  │ POST /assign │   │  BullMQ Job  │   │   WebSocket Server        │  │
│  │ments         │──▶│  Queue       │──▶│   (ws://…/ws)             │  │
│  └──────────────┘   └──────┬───────┘   └──────────────────────────┘  │
│                             │                                          │
│                      ┌──────▼───────┐                                 │
│                      │   Worker     │                                  │
│                      │  (BullMQ)    │                                  │
│                      └──────┬───────┘                                 │
│                             │                                          │
│          ┌──────────────────┼────────────────────┐                    │
│          ▼                  ▼                    ▼                    │
│   ┌──────────────┐  ┌──────────────┐  ┌──────────────────────────┐   │
│   │  Gemini API  │  │   MongoDB    │  │  Redis (cache + progress) │   │
│   │  (LLM)       │  │  (persist)   │  │                           │   │
│   └──────────────┘  └──────────────┘  └──────────────────────────┘   │
└────────────────────────────────────────────────────────────────────────┘
```

### Request Flow

1. Teacher fills the 4-step form (title, school, class, subject, chapters, question types)
2. `POST /api/assignments` → assignment saved to MongoDB, job pushed to BullMQ queue
3. Worker picks the job, calls **Gemini 1.5 Flash** with a structured prompt
4. Progress broadcasts over WebSocket: `generation_started → generation_progress → generation_completed`
5. Generated paper validated with **Zod**, saved to MongoDB, cached in **Redis**
6. Frontend receives WebSocket event → paper renders instantly; subsequent loads served from Redis cache
7. Teacher can **Download as PDF** (jsPDF) or **Regenerate**

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16, TypeScript, Zustand, React Hook Form + Zod, Framer Motion, jsPDF |
| Backend | Node.js, Express 5, TypeScript |
| AI | Google Gemini 1.5 Flash (`@google/generative-ai`) |
| Database | MongoDB (Mongoose) |
| Cache / Queue | Redis (ioredis) + BullMQ |
| Real-time | WebSocket (`ws`) |
| File uploads | Multer |

---

## Setup Instructions

### Prerequisites

- Node.js ≥ 18
- MongoDB running locally (`mongod`) or a MongoDB Atlas URI
- Redis running locally (`redis-server`) or a Redis Cloud URI
- Google Gemini API key → [aistudio.google.com](https://aistudio.google.com/app/apikey)

---

### 1 — Clone & install

```bash
git clone <your-repo-url>
cd veda_ai

# Install backend deps
cd backend && npm install

# Install frontend deps
cd ../frontend && npm install
```

---

### 2 — Configure environment

**backend/.env**
```env
PORT=4000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/veda_ai
REDIS_URL=redis://localhost:6379
GEMINI_API_KEY=your_gemini_api_key_here
FRONTEND_URL=http://localhost:3000
UPLOAD_DIR=./uploads
```

**frontend/.env.local**
```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api
NEXT_PUBLIC_WS_URL=ws://localhost:4000/ws
```

---

### 3 — Start services

```bash
# Terminal 1 — MongoDB (if local)
mongod

# Terminal 2 — Redis (if local)
redis-server

# Terminal 3 — Backend
cd backend
npm run dev

# Terminal 4 — Frontend
cd frontend
npm run dev
```

Open **http://localhost:3000** in your browser.

---

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/assignments` | List all assignments |
| `POST` | `/api/assignments` | Create assignment + start generation job |
| `GET` | `/api/assignments/:id` | Get single assignment |
| `DELETE` | `/api/assignments/:id` | Delete assignment + paper |
| `POST` | `/api/assignments/:id/regenerate` | Trigger re-generation |
| `GET` | `/api/assignments/:assignmentId/paper` | Get generated paper (Redis cache → MongoDB) |
| `GET` | `/health` | Health check |
| `WS` | `ws://localhost:4000/ws` | WebSocket (subscribe to assignment progress) |

### WebSocket Protocol

**Subscribe:**
```json
{ "type": "subscribe", "assignmentId": "<id>" }
```

**Events received:**
```json
{ "type": "generation_started",   "assignmentId": "...", "data": { "progress": 5,  "message": "..." } }
{ "type": "generation_progress",  "assignmentId": "...", "data": { "progress": 40, "message": "..." } }
{ "type": "generation_completed", "assignmentId": "...", "data": { "progress": 100, "paper": {...} } }
{ "type": "generation_failed",    "assignmentId": "...", "data": { "error": "..." } }
```

---

## Features

### Core
- ✅ **4-step creation form** — title, school name, class/section/subject, chapters (pill UI), question types table
- ✅ **AI generation** — Gemini 1.5 Flash with structured JSON prompt + Zod validation
- ✅ **Real-time progress** — WebSocket broadcasts with animated progress bar
- ✅ **Sections A/B/C…** — questions grouped by type with instructions
- ✅ **Difficulty badges** — Easy / Moderate / Hard colour-coded tags on each question
- ✅ **Student info fields** — Name / Roll Number / Section fill lines on paper
- ✅ **Answer key** — Included below the question paper
- ✅ **Redis caching** — Generated papers cached, served instantly on revisit
- ✅ **BullMQ background jobs** — Non-blocking generation queue
- ✅ **Zustand state management** — Assignments list + generation state + paper cache
- ✅ **PDF Export** — Fully formatted jsPDF output with school header, difficulty badges, answer key, page numbers

### Bonus
- ✅ **Regenerate** — One-click re-generation with job re-queue
- ✅ **File upload** — Optional syllabus PDF/TXT used in prompt
- ✅ **Mobile responsive** — Sidebar collapses, grid adapts
- ✅ **Skeleton loading** — Shimmer placeholders while data loads
- ✅ **Search** — Filter assignments by title/subject

---

## Project Structure

```
veda_ai/
├── backend/
│   └── src/
│       ├── config/         # Environment config
│       ├── controllers/    # Express route handlers
│       ├── middleware/     # Error handling
│       ├── models/         # Mongoose schemas (Assignment, GeneratedPaper)
│       ├── queues/         # BullMQ queue setup
│       ├── redis/          # Redis client + cache helpers
│       ├── routes/         # Express routers
│       ├── services/       # Gemini AI service
│       ├── types/          # Zod schemas + TypeScript types
│       ├── websocket/      # WebSocket server
│       ├── workers/        # BullMQ question generation worker
│       └── index.ts        # App bootstrap
│
└── frontend/
    └── src/
        ├── app/            # Next.js App Router pages
        │   ├── assignments/
        │   │   ├── page.tsx          # Assignment list
        │   │   ├── create/page.tsx   # 4-step creation form
        │   │   └── [id]/page.tsx     # Paper viewer
        │   ├── groups/page.tsx
        │   ├── toolkit/page.tsx
        │   └── library/page.tsx
        ├── components/
        │   ├── assignments/  # AssignmentCard, EmptyState
        │   ├── form/         # TopicPills, QuestionTypesTable
        │   ├── layout/       # AppShell, Sidebar, TopBar
        │   └── paper/        # ExamPaper, QuestionCard
        ├── hooks/            # useWebSocket, usePDFExport
        ├── services/         # Axios API client
        ├── store/            # Zustand store
        └── types/            # TypeScript interfaces
```

---

## Approach

### AI Prompt Design
The prompt explicitly specifies:
- Exact question counts and marks per type
- Difficulty distribution (~40% easy / 40% medium / 20% hard)
- MCQ option format (`A. option`, `B. option`, …)
- Output as strict JSON (no markdown wrapping) validated by Zod schema
- School name and class included for contextual generation

### Why BullMQ + Redis?
Gemini generation takes 10–30 seconds. Handling it synchronously in an HTTP request would timeout. BullMQ queues the work, the worker processes it independently, and WebSocket broadcasts real-time progress. Redis also caches completed papers so repeated views are instant.

### State Management
Zustand manages three slices:
1. `assignments[]` — list page data
2. `generationStates` — per-assignment WebSocket progress
3. `papers` — in-memory paper cache (avoids re-fetching on back-navigation)

---

## License

MIT
