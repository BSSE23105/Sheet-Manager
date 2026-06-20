# Backend — FastAPI Google Sheets CRUD API

## Overview

A RESTful API built with **FastAPI** that performs CRUD operations on a private Google Sheet using a Google Service Account for authentication.

## Prerequisites

- Python 3.10+
- A Google Cloud project with the **Google Sheets API** and **Google Drive API** enabled
- A **Service Account** with a downloaded JSON key file (`credentials.json`)
- A Google Sheet shared with the Service Account email as an **Editor**

## Setup

### 1. Create a virtual environment

```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate

# macOS/Linux
source venv/bin/activate
```

### 2. Install dependencies

```bash
pip install -r requirements.txt
```

### 3. Configure environment variables

Copy the example environment file and fill in your values:

```bash
cp .env.example .env
```

Edit `.env`:

| Variable          | Description                                  | Default               |
|-------------------|----------------------------------------------|-----------------------|
| `GOOGLE_SHEET_ID` | The ID from your Google Sheet URL            | *(required)*          |
| `CREDENTIALS_FILE`| Path to the service account JSON key file    | `../credentials.json` |
| `SHEET_NAME`      | Name of the worksheet tab                    | `Sheet1`              |
| `HOST`            | Server host                                  | `0.0.0.0`             |
| `PORT`            | Server port                                  | `8000`                |
| `FRONTEND_URL`    | Frontend origin for CORS                     | `http://localhost:5173`|

### 4. Run the server

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at `http://localhost:8000`.

Interactive API documentation (Swagger UI) is at `http://localhost:8000/docs`.

## API Endpoints

| Method   | Endpoint          | Description              | Status Codes        |
|----------|-------------------|--------------------------|---------------------|
| `GET`    | `/records`        | Fetch all records        | `200`, `500`        |
| `GET`    | `/record/{id}`    | Fetch a specific record  | `200`, `404`, `500` |
| `POST`   | `/record`         | Create a new record      | `201`, `422`, `500` |
| `PUT`    | `/record/{id}`    | Update an existing record| `200`, `404`, `422`, `500` |
| `DELETE` | `/record/{id}`    | Delete a record          | `200`, `404`, `500` |

### Example Requests

**Create a record:**
```bash
curl -X POST http://localhost:8000/record \
  -H "Content-Type: application/json" \
  -d '{"name": "Alice Smith", "email": "alice@example.com", "department": "Engineering"}'
```

**Fetch all records:**
```bash
curl http://localhost:8000/records
```

**Update a record:**
```bash
curl -X PUT http://localhost:8000/record/1 \
  -H "Content-Type: application/json" \
  -d '{"department": "Marketing"}'
```

**Delete a record:**
```bash
curl -X DELETE http://localhost:8000/record/1
```

## Project Structure

```
backend/
├── main.py           # FastAPI application and route handlers
├── sheets.py         # Google Sheets service layer (CRUD logic)
├── models.py         # Pydantic request/response models
├── config.py         # Environment configuration
├── requirements.txt  # Python dependencies
├── .env              # Environment variables (git-ignored)
└── .env.example      # Example environment file
```
