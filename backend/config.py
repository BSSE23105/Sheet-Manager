"""
Configuration module for the FastAPI backend.
Loads environment variables from .env file and provides
centralized access to configuration values.
"""

import os
from pathlib import Path
from dotenv import load_dotenv

# Load .env file from the backend directory
env_path = Path(__file__).resolve().parent / ".env"
load_dotenv(dotenv_path=env_path)


def get_env_variable(name: str, default: str = None) -> str:
    """
    Retrieve an environment variable or raise an error if not set
    and no default is provided.
    """
    value = os.getenv(name, default)
    if value is None:
        raise EnvironmentError(
            f"Required environment variable '{name}' is not set. "
            f"Please check your .env file."
        )
    return value


# Google Sheets configuration
GOOGLE_SHEET_ID: str = get_env_variable("GOOGLE_SHEET_ID")
CREDENTIALS_FILE: str = get_env_variable(
    "CREDENTIALS_FILE",
    default=str(Path(__file__).resolve().parent.parent / "credentials.json")
)
SHEET_NAME: str = get_env_variable("SHEET_NAME", default="Sheet1")

# Server configuration
HOST: str = get_env_variable("HOST", default="0.0.0.0")
PORT: int = int(get_env_variable("PORT", default="8000"))

# CORS configuration
FRONTEND_URL: str = get_env_variable("FRONTEND_URL", default="http://localhost:5173")
