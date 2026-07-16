import os
from pathlib import Path
from typing import Union, Optional
import fitz  # PyMuPDF


class PDFParserError(Exception):
    """Base exception for all PDF parsing and validation errors."""
    pass


class PDFNotFoundError(PDFParserError):
    """Raised when the specified file path does not exist."""
    pass


class EmptyPDFError(PDFParserError):
    """Raised when the PDF file has a size of 0 bytes."""
    pass


class InvalidPDFSignatureError(PDFParserError):
    """Raised when the file does not begin with the %PDF magic header."""
    pass


class EncryptedPDFError(PDFParserError):
    """Raised when the PDF is password protected and cannot be decrypted."""
    pass


class CorruptedPDFError(PDFParserError):
    """Raised when the PDF file structure is corrupted and cannot be read."""
    pass


class MaxFileSizeExceededError(PDFParserError):
    """Raised when the file size exceeds a configured maximum limit."""
    pass


class MaxPageLimitExceededError(PDFParserError):
    """Raised when the page count exceeds a configured maximum limit."""
    pass


class DocumentValidator:
    """Performs validation checks on PDF documents to ensure they are safe and valid to parse."""

    def __init__(
        self,
        max_bytes: Optional[int] = None,
        max_pages: Optional[int] = None
    ):
        """Initializes validator with configurable constraints.
        
        Args:
            max_bytes: Maximum allowed file size in bytes. None implies no limit.
            max_pages: Maximum allowed page count. None implies no limit.
        """
        self.max_bytes = max_bytes
        self.max_pages = max_pages

    def validate_file_properties(self, file_path: Union[str, Path]) -> int:
        """Validates filesystem parameters before opening the file.
        
        Checks:
        1. File existence
        2. File type (must not be a directory)
        3. File size (not zero, and does not exceed limit)
        4. PDF signature signature check (%PDF magic bytes)
        
        Returns:
            The size of the file in bytes.
        """
        path = Path(file_path)

        if not path.exists():
            raise PDFNotFoundError(f"File not found at: {path}")

        if not path.is_file():
            raise PDFParserError(f"Path is not a regular file: {path}")

        file_size = os.path.getsize(path)

        if file_size == 0:
            raise EmptyPDFError(f"File is empty (0 bytes): {path}")

        if self.max_bytes is not None and file_size > self.max_bytes:
            raise MaxFileSizeExceededError(
                f"File size ({file_size} bytes) exceeds limit of {self.max_bytes} bytes."
            )

        # Verify %PDF header signature in first 4 bytes
        try:
            with open(path, "rb") as f:
                header = f.read(4)
                if header != b"%PDF":
                    raise InvalidPDFSignatureError(
                        f"Invalid file signature {header!r}. Only digital PDF files are supported."
                    )
        except IOError as e:
            raise PDFParserError(f"Could not read file signature: {e}") from e

        return file_size

    def validate_document_structure(self, doc: fitz.Document) -> None:
        """Validates structural properties of an opened PyMuPDF Document.
        
        Checks:
        1. Encryption / password protection
        2. Page count boundary limits
        3. Corruption (inability to read page details)
        """
        # Check security protection
        if doc.is_encrypted:
            # Attempt blank password authentication
            if not doc.authenticate(""):
                raise EncryptedPDFError("The PDF document is password-protected and encrypted.")

        # Check page count constraints
        page_count = len(doc)
        if self.max_pages is not None and page_count > self.max_pages:
            raise MaxPageLimitExceededError(
                f"Document page count ({page_count}) exceeds limit of {self.max_pages} pages."
            )

        # Check corruption (attempting to read page structures)
        try:
            if page_count > 0:
                # Load first page context to verify document stream integrity
                _ = doc[0]
            else:
                raise CorruptedPDFError("The PDF document has 0 pages or contains a corrupted catalog index.")
        except Exception as e:
            if not isinstance(e, PDFParserError):
                raise CorruptedPDFError(f"PDF structure is corrupted or unreadable: {e}") from e
            raise
