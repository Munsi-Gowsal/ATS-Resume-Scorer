from pathlib import Path
from typing import Union, Dict, Any
import fitz  # PyMuPDF

from app.parser.validators import (
    DocumentValidator,
    PDFParserError,
    InvalidPDFSignatureError,
    EncryptedPDFError,
    CorruptedPDFError
)


class PDFReader:
    """Manages the lifecycle of a PyMuPDF Document resource and computes document diagnostics.
    
    Acts as a wrapper over PyMuPDF, ensuring files are read safely and diagnostics
    like page count, encryption status, and corruption status are exposed.
    """

    def __init__(self, file_path: Union[str, Path]):
        self.file_path = Path(file_path)
        self._validator = DocumentValidator()
        
        # Fail-fast active validation for file system access and signature
        self._file_size = self._validator.validate_file_properties(self.file_path)
        
        self._diagnostics: Dict[str, Any] = {
            "file_size_bytes": self._file_size,
            "page_count": 0,
            "is_encrypted": False,
            "is_corrupted": False,
            "is_valid_pdf": True
        }
        self._run_diagnostics()

    def _run_diagnostics(self) -> None:
        """Runs a passive diagnostic check on the PDF file structure and populates statistics."""
        # Attempt to open and inspect internal document structure
        doc = None
        try:
            doc = fitz.open(self.file_path)
            
            # Check security encryption
            if doc.is_encrypted:
                self._diagnostics["is_encrypted"] = True
                # If authentication fails with empty password, we can't extract page counts safely
                if not doc.authenticate(""):
                    self._diagnostics["is_corrupted"] = False  # Just encrypted, not corrupted
                    return
            
            # Validate page metrics
            self._diagnostics["page_count"] = len(doc)
            self._validator.validate_document_structure(doc)

        except EncryptedPDFError:
            self._diagnostics["is_encrypted"] = True
        except (CorruptedPDFError, fitz.FileDataError, Exception):
            self._diagnostics["is_corrupted"] = True
        finally:
            if doc is not None:
                doc.close()

    @property
    def diagnostics(self) -> Dict[str, Any]:
        """Returns the dictionary of document diagnostics (size, encryption, corruption, validity)."""
        return self._diagnostics.copy()

    def open_document(self) -> fitz.Document:
        """Opens and returns the PyMuPDF Document object for active processing.
        
        Performs full strict validation prior to returning the document handler.
        
        Raises:
            PDFParserError: If validation fails.
        """
        # 1. Run strict file properties validation
        self._validator.validate_file_properties(self.file_path)

        # 2. Open document and validate structural integrity
        try:
            doc = fitz.open(self.file_path)
        except Exception as e:
            raise CorruptedPDFError(f"Failed to open PDF document: {e}") from e

        try:
            self._validator.validate_document_structure(doc)
        except Exception:
            doc.close()
            raise

        return doc
