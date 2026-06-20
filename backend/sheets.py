"""
Google Sheets service layer.
Encapsulates all interactions with the Google Sheets API using the gspread library.
Provides CRUD operations on the configured spreadsheet.
"""

import gspread
from google.oauth2.service_account import Credentials
from typing import Optional

from config import GOOGLE_SHEET_ID, CREDENTIALS_FILE, SHEET_NAME


# Google Sheets API scopes required for read/write access
SCOPES = [
    "https://www.googleapis.com/auth/spreadsheets",
    "https://www.googleapis.com/auth/drive",
]

# Expected column headers in the Google Sheet
EXPECTED_HEADERS = ["ID", "Name", "Email", "Department"]


class SheetsServiceError(Exception):
    """Custom exception for Google Sheets service errors."""
    pass


class RecordNotFoundError(Exception):
    """Raised when a record with the given ID is not found."""
    pass


def _get_worksheet() -> gspread.Worksheet:
    """
    Authenticate with Google Sheets API and return the configured worksheet.
    Raises SheetsServiceError if authentication or access fails.
    """
    try:
        credentials = Credentials.from_service_account_file(
            CREDENTIALS_FILE, scopes=SCOPES
        )
        client = gspread.authorize(credentials)
        spreadsheet = client.open_by_key(GOOGLE_SHEET_ID)
        worksheet = spreadsheet.worksheet(SHEET_NAME)
        return worksheet
    except FileNotFoundError:
        raise SheetsServiceError(
            f"Credentials file not found at '{CREDENTIALS_FILE}'. "
            "Please ensure the file exists and the path is correct."
        )
    except gspread.exceptions.SpreadsheetNotFound:
        raise SheetsServiceError(
            f"Spreadsheet with ID '{GOOGLE_SHEET_ID}' not found. "
            "Please verify the GOOGLE_SHEET_ID and ensure the sheet is shared "
            "with the service account."
        )
    except gspread.exceptions.WorksheetNotFound:
        raise SheetsServiceError(
            f"Worksheet '{SHEET_NAME}' not found in the spreadsheet. "
            "Please verify the SHEET_NAME configuration."
        )
    except Exception as e:
        raise SheetsServiceError(
            f"Failed to connect to Google Sheets: {str(e)}"
        )


def _validate_headers(worksheet: gspread.Worksheet) -> None:
    """
    Validate that the worksheet has the expected column headers.
    Raises SheetsServiceError if headers don't match.
    """
    headers = worksheet.row_values(1)
    if headers != EXPECTED_HEADERS:
        raise SheetsServiceError(
            f"Unexpected sheet headers. Expected {EXPECTED_HEADERS}, "
            f"but found {headers}. Please ensure the first row contains "
            "the correct column headers."
        )


def _generate_next_id(worksheet: gspread.Worksheet) -> int:
    """
    Generate the next unique ID by finding the maximum existing ID and
    incrementing by 1. Returns 1 if the sheet is empty.
    """
    all_values = worksheet.get_all_values()

    # Skip header row; if no data rows, start at 1
    if len(all_values) <= 1:
        return 1

    max_id = 0
    for row in all_values[1:]:  # Skip header
        try:
            row_id = int(row[0])
            if row_id > max_id:
                max_id = row_id
        except (ValueError, IndexError):
            continue

    return max_id + 1


def _find_row_by_id(
    worksheet: gspread.Worksheet, record_id: int
) -> Optional[int]:
    """
    Find the row number (1-indexed) for a given record ID.
    Returns None if not found.
    """
    all_values = worksheet.get_all_values()

    for idx, row in enumerate(all_values[1:], start=2):  # Skip header, rows are 1-indexed
        try:
            if int(row[0]) == record_id:
                return idx
        except (ValueError, IndexError):
            continue

    return None


def get_all_records() -> list[dict]:
    """
    Fetch all records from the Google Sheet.

    Returns:
        List of dictionaries, each representing a record with keys:
        id, name, email, department.
    """
    worksheet = _get_worksheet()
    _validate_headers(worksheet)

    all_values = worksheet.get_all_values()

    records = []
    for row in all_values[1:]:  # Skip header row
        if len(row) >= 4 and row[0].strip():
            try:
                records.append({
                    "id": int(row[0]),
                    "name": row[1],
                    "email": row[2],
                    "department": row[3],
                })
            except ValueError:
                continue  # Skip rows with invalid IDs

    return records


def get_record_by_id(record_id: int) -> dict:
    """
    Fetch a specific record by its ID.

    Args:
        record_id: The unique identifier of the record.

    Returns:
        Dictionary representing the record.

    Raises:
        RecordNotFoundError: If no record with the given ID exists.
    """
    worksheet = _get_worksheet()
    _validate_headers(worksheet)

    row_number = _find_row_by_id(worksheet, record_id)
    if row_number is None:
        raise RecordNotFoundError(f"Record with ID {record_id} not found.")

    row = worksheet.row_values(row_number)
    return {
        "id": int(row[0]),
        "name": row[1],
        "email": row[2],
        "department": row[3],
    }


def create_record(name: str, email: str, department: str) -> dict:
    """
    Create a new record in the Google Sheet.

    Args:
        name: Full name of the person.
        email: Email address.
        department: Department name.

    Returns:
        Dictionary representing the newly created record (with auto-generated ID).
    """
    worksheet = _get_worksheet()
    _validate_headers(worksheet)

    new_id = _generate_next_id(worksheet)
    new_row = [str(new_id), name, email, department]
    worksheet.append_row(new_row, value_input_option="USER_ENTERED")

    return {
        "id": new_id,
        "name": name,
        "email": email,
        "department": department,
    }


def update_record(
    record_id: int,
    name: Optional[str] = None,
    email: Optional[str] = None,
    department: Optional[str] = None,
) -> dict:
    """
    Update an existing record. Only provided fields are updated.

    Args:
        record_id: The ID of the record to update.
        name: New name (optional).
        email: New email (optional).
        department: New department (optional).

    Returns:
        Dictionary representing the updated record.

    Raises:
        RecordNotFoundError: If no record with the given ID exists.
    """
    worksheet = _get_worksheet()
    _validate_headers(worksheet)

    row_number = _find_row_by_id(worksheet, record_id)
    if row_number is None:
        raise RecordNotFoundError(f"Record with ID {record_id} not found.")

    # Get current row values
    current_row = worksheet.row_values(row_number)
    current_record = {
        "id": int(current_row[0]),
        "name": current_row[1],
        "email": current_row[2],
        "department": current_row[3],
    }

    # Apply partial updates
    updated_name = name if name is not None else current_record["name"]
    updated_email = email if email is not None else current_record["email"]
    updated_department = (
        department if department is not None else current_record["department"]
    )

    # Update the row in the sheet
    updated_row = [str(record_id), updated_name, updated_email, updated_department]
    worksheet.update(
        f"A{row_number}:D{row_number}",
        [updated_row],
        value_input_option="USER_ENTERED",
    )

    return {
        "id": record_id,
        "name": updated_name,
        "email": updated_email,
        "department": updated_department,
    }


def delete_record(record_id: int) -> dict:
    """
    Delete a record from the Google Sheet.

    Args:
        record_id: The ID of the record to delete.

    Returns:
        Dictionary with a confirmation message.

    Raises:
        RecordNotFoundError: If no record with the given ID exists.
    """
    worksheet = _get_worksheet()
    _validate_headers(worksheet)

    row_number = _find_row_by_id(worksheet, record_id)
    if row_number is None:
        raise RecordNotFoundError(f"Record with ID {record_id} not found.")

    worksheet.delete_rows(row_number)

    return {"message": f"Record with ID {record_id} deleted successfully.", "id": record_id}
