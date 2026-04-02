# ⚔️ AI Adventure

An AI-powered Choose Your Own Adventure game where every story is uniquely generated based on your choices. Built with FastAPI, PostgreSQL, and React.

![Python](https://img.shields.io/badge/Python-3.10+-3776AB?style=flat&logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688?style=flat&logo=fastapi&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16+-4169E1?style=flat&logo=postgresql&logoColor=white)
![React](https://img.shields.io/badge/React-18+-61DAFB?style=flat&logo=react&logoColor=black)
![Groq](https://img.shields.io/badge/Groq-LLaMA3_70B-F55036?style=flat)

---

## What is this?

AI Adventure lets you create a character, pick a genre and setting, then play through a dynamically generated story. Every scene is written by an AI model — no two adventures are ever the same.

- Pick from Fantasy, Horror, Sci-Fi, or Mystery
- Choose your character class — Warrior, Mage, Rogue, or Explorer
- Make choices that shape the story
- Adventures last 7-10 turns and reach a natural conclusion

---

## Tech Stack

| Layer       | Technology                   |
| ----------- | ---------------------------- |
| Backend     | FastAPI, SQLAlchemy, Alembic |
| Database    | PostgreSQL                   |
| Auth        | JWT (python-jose, bcrypt)    |
| AI          | Groq API (LLaMA 3 70B)       |
| Frontend    | React, Vite, Tailwind CSS    |
| HTTP Client | Axios                        |

---

## Features

- JWT authentication — register, login, protected routes
- AI story generation — one API call per turn returns story + choices + end state as structured JSON
- Full adventure history stored in PostgreSQL
- Resume past adventures from where you left off
- Delete adventures you no longer want
- Automatic story ending after reaching a natural conclusion

---

## Project Structure

```
ai-adventure/
├── backend/
│   ├── app/
│   │   ├── main.py           # FastAPI app entry point
│   │   ├── config.py         # Environment variables
│   │   ├── database.py       # SQLAlchemy setup
│   │   ├── dependencies.py   # JWT auth dependency
│   │   ├── utils.py          # Password hashing + JWT utils
│   │   ├── models/
│   │   │   ├── user.py       # User table
│   │   │   └── adventure.py  # AdventureSession + StoryNode tables
│   │   ├── routers/
│   │   │   ├── auth.py       # /auth endpoints
│   │   │   └── adventure.py  # /adventure endpoints
│   │   ├── schemas/
│   │   │   ├── user.py       # Pydantic schemas for auth
│   │   │   └── adventure.py  # Pydantic schemas for adventure
│   │   └── services/
│   │       └── ai.py         # Groq API integration
│   └── .env.example
└── frontend/
    └── src/
        ├── pages/
        │   ├── Login.jsx
        │   ├── Register.jsx
        │   ├── Dashboard.jsx
        │   └── Game.jsx
        ├── services/
        │   └── api.js        # Axios API calls
        └── components/
            └── ProtectedRoute.jsx
```

---

## Database Schema

```
users
├── id (UUID, PK)
├── username (unique)
├── email (unique)
├── hashed_password
└── created_at

adventure_sessions
├── id (UUID, PK)
├── user_id (FK → users)
├── genre
├── setting
├── character_name
├── character_class
├── status (active / completed)
└── created_at

story_nodes
├── id (UUID, PK)
├── session_id (FK → adventure_sessions)
├── sequence_number
├── story_text
├── choices (array)
├── choice_made
└── created_at
```

---

## API Endpoints

### Auth

| Method | Endpoint         | Description             |
| ------ | ---------------- | ----------------------- |
| POST   | `/auth/register` | Create a new account    |
| POST   | `/auth/login`    | Login and get JWT token |
| GET    | `/auth/me`       | Get current user info   |

### Adventure

| Method | Endpoint                 | Description                      |
| ------ | ------------------------ | -------------------------------- |
| POST   | `/adventure/start`       | Start a new adventure            |
| POST   | `/adventure/{id}/choice` | Make a choice and get next scene |
| GET    | `/adventure/`            | List all your adventures         |
| GET    | `/adventure/{id}`        | Load a specific adventure        |
| DELETE | `/adventure/{id}`        | Delete an adventure              |

---

## Local Setup

### Prerequisites

- Python 3.10+
- PostgreSQL
- Node.js 18+
- Groq API key (free at [console.groq.com](https://console.groq.com))

### Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate       # Windows
source venv/bin/activate    # Mac/Linux

pip install -r requirements.txt
```

Create a `.env` file based on `.env.example`:

```env
DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/adventure_db
SECRET_KEY=your-secret-key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
GROQ_API_KEY=your-groq-key
```

Create the database:

```bash
psql -U postgres -c "CREATE DATABASE adventure_db;"
```

Run the server:

```bash
uvicorn app.main:app --reload
```

API runs at `http://localhost:8000`
Swagger docs at `http://localhost:8000/docs`

### Frontend

```bash
cd frontend
npm install
npm run dev
```

App runs at `http://localhost:5173`

---

## How the AI Works

Each turn makes a single API call to Groq (LLaMA 3 70B) that returns structured JSON:

```json
{
  "story": "80-100 words of narrative...",
  "choices": ["option one", "option two", "option three"],
  "is_ended": false
}
```

The full conversation history is sent with every request so the AI remembers everything that happened in the adventure. When `is_ended` is true, the frontend shows the ending screen instead of choices.

---

## Author

**Gautam** — B.Tech Electrical Engineering, Delhi Technological University (2025)

