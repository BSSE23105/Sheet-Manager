"""
Pydantic models for request/response validation.
Ensures proper data validation and serialization for all API endpoints.
"""

from pydantic import BaseModel, EmailStr, Field
from typing import Optional


class RecordCreate(BaseModel):
    """Schema for creating a new record. All fields are required."""

    name: str = Field(
        ...,
        min_length=1,
        max_length=100,
        description="Full name of the person",
        examples=["John Doe"]
    )
    email: EmailStr = Field(
        ...,
        description="Valid email address",
        examples=["john.doe@example.com"]
    )
    department: str = Field(
        ...,
        min_length=1,
        max_length=100,
        description="Department name",
        examples=["Engineering"]
    )


class RecordUpdate(BaseModel):
    """
    Schema for updating an existing record.
    All fields are optional — only provided fields will be updated.
    """

    name: Optional[str] = Field(
        None,
        min_length=1,
        max_length=100,
        description="Full name of the person"
    )
    email: Optional[EmailStr] = Field(
        None,
        description="Valid email address"
    )
    department: Optional[str] = Field(
        None,
        min_length=1,
        max_length=100,
        description="Department name"
    )


class RecordResponse(BaseModel):
    """Schema for a record returned from the API."""

    id: int = Field(..., description="Unique identifier for the record")
    name: str = Field(..., description="Full name of the person")
    email: str = Field(..., description="Email address")
    department: str = Field(..., description="Department name")


class MessageResponse(BaseModel):
    """Generic message response for operations like delete."""

    message: str = Field(..., description="Status message")
    id: int = Field(..., description="ID of the affected record")
