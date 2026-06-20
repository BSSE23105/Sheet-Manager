# Google Sheets CRUD Application

A full-stack application with a **React** frontend and **Python/FastAPI** backend that performs CRUD operations on a private Google Sheet.

**Tech Stack:** React + Vite · FastAPI · gspread · Google Sheets API

---

## Prerequisites

- Python 3.10+
- Node.js 18+
- A Google Cloud **Service Account** with Sheets & Drive APIs enabled
- `credentials.json` (service account key file) placed in the project root

---

## Google Sheet Setup

1. Create a Google Sheet with these headers in row 1: `ID | Name | Email | Department`
2. Share the sheet with the service account email (`client_email` in `credentials.json`) as **Editor**
3. Copy the Sheet ID from the URL: `https://docs.google.com/spreadsheets/d/{SHEET_ID}/edit`

---

## Configuration

Create `backend/.env` (copy from `backend/.env.example`):

```env
GOOGLE_SHEET_ID=your_sheet_id_here
CREDENTIALS_FILE=../credentials.json
SHEET_NAME=Sheet1
HOST=0.0.0.0
PORT=8000
FRONTEND_URL=http://localhost:5173
```

---

## Running Locally

**Terminal 1 — Backend:**
```bash
cd backend
python -m venv venv
.\venv\Scripts\activate       # Windows
# source venv/bin/activate    # macOS/Linux
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm install
npm run dev
```

Open **http://localhost:5173**

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/records` | Fetch all records |
| GET | `/record/{id}` | Fetch a record |
| POST | `/record` | Create a record |
| PUT | `/record/{id}` | Update a record |
| DELETE | `/record/{id}` | Delete a record |

Swagger docs available at **http://localhost:8000/docs**

---

## System Design

See [SYSTEM_DESIGN.md](./SYSTEM_DESIGN.md) for the scalable architecture design covering 1M+ records and 10K daily active users.
