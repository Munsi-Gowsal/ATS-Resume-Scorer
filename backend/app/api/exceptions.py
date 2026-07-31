import logging
from typing import Any, Dict
from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse

logger = logging.getLogger(__name__)


class APIException(Exception):
    """Base exception class for API errors."""

    def __init__(self, message: str, status_code: int = status.HTTP_400_BAD_REQUEST, details: Any = None) -> None:
        self.message = message
        self.status_code = status_code
        self.details = details
        super().__init__(message)


class InvalidFileFormatError(APIException):
    """Raised when an uploaded file format is invalid or unsupported."""

    def __init__(self, message: str = "Invalid file format. Only PDF files are supported.") -> None:
        super().__init__(message=message, status_code=status.HTTP_400_BAD_REQUEST)


class ResumeParsingError(APIException):
    """Raised when parsing a resume PDF fails."""

    def __init__(self, message: str = "Failed to parse resume document.") -> None:
        super().__init__(message=message, status_code=status.HTTP_400_BAD_REQUEST)


class JobDescriptionParsingError(APIException):
    """Raised when parsing a job description fails."""

    def __init__(self, message: str = "Failed to parse job description.") -> None:
        super().__init__(message=message, status_code=status.HTTP_400_BAD_REQUEST)


def register_exception_handlers(app: FastAPI) -> None:
    """Registers custom exception handlers with the FastAPI application."""

    @app.exception_handler(APIException)
    async def api_exception_handler(request: Request, exc: APIException) -> JSONResponse:
        content: Dict[str, Any] = {
            "error": exc.message,
            "status_code": exc.status_code,
        }
        if exc.details:
            content["details"] = exc.details
        return JSONResponse(status_code=exc.status_code, content=content)

    @app.exception_handler(Exception)
    async def unhandled_exception_handler(request: Request, exc: Exception) -> JSONResponse:
        logger.exception("An unhandled exception occurred during request processing")
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={
                "error": "An internal server error occurred.",
            },
        )

