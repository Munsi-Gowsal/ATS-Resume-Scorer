"""
reader.py — PDF I/O and Lifecycle Layer

Responsibility:
    Validate a file path, confirm it points to a readable PDF,
    open it with PyMuPDF, and return a structured object containing
    the open document handle and key document properties.

This module intentionally does nothing beyond opening and inspecting
the document. Text extraction, normalisation, and metadata parsing
are handled by separate modules in the pipeline.
"""

from dataclasses import dataclass
from pathlib import Path
from typing import Optional, Union

import fitz  # PyMuPDF

from app.parser.validators import (
    CorruptedPDFError,
    DocumentValidator,
    EncryptedPDFError,
    PDFParserError,
)


@dataclass
class PDFDocument:
    """Holds the open PyMuPDF document and its key properties.

    Attributes:
        filename:        The bare filename, e.g. "john_doe_cv.pdf".
        file_size_bytes: Size of the PDF file on disk, in bytes.
        page_count:      Total number of pages in the document.
        doc:             The open fitz.Document handle.
                         The caller is responsible for closing it
                         (or use it as a context manager via fitz).
    """

    filename: str
    size_bytes: int
    page_count: int
    doc: fitz.Document

    # TODO: Add context manager support (__enter__ / __exit__) so callers can use
    #   `with read_pdf(...) as pdf: ...` and have doc.close() called automatically.


def read_pdf(
    file_path: Union[str, Path],
    max_bytes: Optional[int] = None,
    max_pages: Optional[int] = None,
) -> PDFDocument:
    """Validate, open, and return a PDF document as a PDFDocument object.

    This is the single public entry point for this module.
    Call it with a file path; get back a ready-to-use PDFDocument.

    Args:
        file_path:  Path to the PDF file (string or Path object).
        max_bytes:  Optional upper limit on file size in bytes.
                    Pass None (default) to skip the size check.
        max_pages:  Optional upper limit on page count.
                    Pass None (default) to skip the page check.

    Returns:
        A PDFDocument containing the open document handle and its properties.

    Raises:
        PDFNotFoundError:         File does not exist at the given path.
        EmptyPDFError:            File exists but has 0 bytes.
        InvalidPDFSignatureError: File does not start with the %PDF header.
        MaxFileSizeExceededError: File size exceeds max_bytes.
        EncryptedPDFError:        PDF is password-protected.
        CorruptedPDFError:        PyMuPDF cannot read the document structure.
        MaxPageLimitExceededError: Page count exceeds max_pages.

    Example:
        pdf = read_pdf("resumes/john_doe.pdf", max_pages=10)
        print(pdf.page_count)  # e.g. 2
        pdf.doc.close()
    """
    path = Path(file_path)

    # Step 1: Validate file-system level properties (existence, size, %PDF header).
    validator = DocumentValidator(max_bytes=max_bytes, max_pages=max_pages)
    file_size = validator.validate_file_properties(path)

    # Step 2: Open the document with PyMuPDF.
    doc = _open_document(path)

    # Step 3: Validate internal document structure (encryption, corruption, page count).
    try:
        validator.validate_document_structure(doc)
    except Exception:
        doc.close()  # Always release the C handle on failure.
        raise

    # Step 4: Assemble and return the result.
    return PDFDocument(
        filename=path.name,
        size_bytes=file_size,
        page_count=doc.page_count,
        doc=doc,
    )


# ---------------------------------------------------------------------------
# Private helpers
# ---------------------------------------------------------------------------


def _open_document(path: Path) -> fitz.Document:
    """Open a file with PyMuPDF and return the Document handle.

    Wraps PyMuPDF's own exception in a CorruptedPDFError so the rest
    of the pipeline only ever has to deal with our own exception hierarchy.

    Args:
        path: A validated Path object pointing to an existing file.

    Returns:
        An open fitz.Document.

    Raises:
        CorruptedPDFError: If PyMuPDF fails to open the file.
    """
    try:
        return fitz.open(path)
    except fitz.FileDataError as exc:
        raise CorruptedPDFError(
            f"PyMuPDF could not open '{path.name}'. "
            "The file may be corrupted."
        ) from exc
    except Exception as exc:
        raise CorruptedPDFError(
            f"Unexpected error while opening '{path.name}': {exc}"
        ) from exc
