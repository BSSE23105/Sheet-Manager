"""
FastAPI application for Google Sheets CRUD operations.

This application provides a RESTful API to perform Create, Read, Update,
and Delete operations on a private Google Sheet. It uses a Google Service
Account for authentication and includes proper validation, error handling,
and CORS configuration.
"""

from pathlib import Path

from fastapi import FastAPI, HTTPException, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles

from config import FRONTEND_URL
from models import RecordCreate, RecordUpdate, RecordResponse, MessageResponse
from sheets import (
    get_all_records,
    get_record_by_id,
    create_record,
    update_record,
    delete_record,
    RecordNotFoundError,
    SheetsServiceError,
)


# ─── App Initialization ────────────────────────────────────────────────────────

app = FastAPI(
    title="Google Sheets CRUD API",
    description=(
        "A RESTful API for managing records in a private Google Sheet. "
        "Supports full CRUD operations with proper validation and error handling."
    ),
    version="1.0.0",
)

# ─── CORS Middleware ────────────────────────────────────────────────────────────

app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_URL, "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ─── Global Exception Handler ──────────────────────────────────────────────────

@app.exception_handler(SheetsServiceError)
async def sheets_service_error_handler(request, exc: SheetsServiceError):
    """Handle Google Sheets service errors globally."""
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": str(exc)},
    )


@app.exception_handler(Exception)
async def generic_exception_handler(request, exc: Exception):
    """Catch-all handler for unexpected errors."""
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "An unexpected error occurred. Please try again later."},
    )


# ─── Health Check ───────────────────────────────────────────────────────────────

@app.get("/api/health", tags=["Health"])
async def root():
    """Health check endpoint."""
    return {"status": "ok", "message": "Google Sheets CRUD API is running."}


# ─── CRUD Endpoints ────────────────────────────────────────────────────────────

@app.get(
    "/records",
    response_model=list[RecordResponse],
    tags=["Records"],
    summary="Fetch all records",
    description="Retrieve all records from the Google Sheet.",
)
async def read_all_records():
    """Fetch all records from the Google Sheet."""
    try:
        records = get_all_records()
        return records
    except SheetsServiceError:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch records: {str(e)}",
        )


@app.get(
    "/record/{record_id}",
    response_model=RecordResponse,
    tags=["Records"],
    summary="Fetch a specific record",
    description="Retrieve a single record by its unique ID.",
)
async def read_record(record_id: int):
    """Fetch a specific record by ID."""
    try:
        record = get_record_by_id(record_id)
        return record
    except RecordNotFoundError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Record with ID {record_id} not found.",
        )
    except SheetsServiceError:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch record: {str(e)}",
        )


@app.post(
    "/record",
    response_model=RecordResponse,
    status_code=status.HTTP_201_CREATED,
    tags=["Records"],
    summary="Create a new record",
    description="Add a new record to the Google Sheet. The ID is auto-generated.",
)
async def create_new_record(record: RecordCreate):
    """Create a new record in the Google Sheet."""
    try:
        created = create_record(
            name=record.name,
            email=record.email,
            department=record.department,
        )
        return created
    except SheetsServiceError:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create record: {str(e)}",
        )


@app.put(
    "/record/{record_id}",
    response_model=RecordResponse,
    tags=["Records"],
    summary="Update an existing record",
    description="Update one or more fields of an existing record by its ID.",
)
async def update_existing_record(record_id: int, record: RecordUpdate):
    """Update an existing record in the Google Sheet."""
    # Ensure at least one field is provided for update
    update_data = record.model_dump(exclude_unset=True)
    if not update_data:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="At least one field must be provided for update.",
        )

    try:
        updated = update_record(
            record_id=record_id,
            name=record.name,
            email=record.email,
            department=record.department,
        )
        return updated
    except RecordNotFoundError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Record with ID {record_id} not found.",
        )
    except SheetsServiceError:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update record: {str(e)}",
        )


@app.delete(
    "/record/{record_id}",
    response_model=MessageResponse,
    tags=["Records"],
    summary="Delete a record",
    description="Remove a record from the Google Sheet by its ID.",
)
async def delete_existing_record(record_id: int):
    """Delete a record from the Google Sheet."""
    try:
        result = delete_record(record_id)
        return result
    except RecordNotFoundError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Record with ID {record_id} not found.",
        )
    except SheetsServiceError:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete record: {str(e)}",
        )


# ─── Serve Frontend Static Files ───────────────────────────────────────────────

# Path to the frontend build output
FRONTEND_DIST = Path(__file__).resolve().parent.parent / "frontend" / "dist"

if FRONTEND_DIST.exists():
    # Serve static assets (JS, CSS, images) under /assets
    app.mount(
        "/assets",
        StaticFiles(directory=str(FRONTEND_DIST / "assets")),
        name="static-assets",
    )

    # Catch-all route: serve index.html for any non-API path
    # This must be LAST so it doesn't override API routes
    @app.get("/{full_path:path}", tags=["Frontend"], include_in_schema=False)
    async def serve_frontend(request: Request, full_path: str):
        """Serve the React frontend for any non-API route."""
        # If the path matches a file in dist, serve it
        file_path = FRONTEND_DIST / full_path
        if file_path.is_file():
            return FileResponse(str(file_path))
        # Otherwise serve index.html (React SPA routing)
        return FileResponse(str(FRONTEND_DIST / "index.html"))
