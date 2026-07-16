import os
import pytest
import fitz
from app.parser.validators import (
    DocumentValidator,
    PDFNotFoundError,
    EmptyPDFError,
    InvalidPDFSignatureError,
    MaxFileSizeExceededError,
    MaxPageLimitExceededError,
    CorruptedPDFError,
    EncryptedPDFError
)


def test_file_not_found(tmp_path):
    validator = DocumentValidator()
    non_existent = tmp_path / "missing.pdf"
    with pytest.raises(PDFNotFoundError):
        validator.validate_file_properties(non_existent)


def test_empty_file(tmp_path):
    validator = DocumentValidator()
    empty_file = tmp_path / "empty.pdf"
    empty_file.write_bytes(b"")  # Write 0 bytes
    
    with pytest.raises(EmptyPDFError):
        validator.validate_file_properties(empty_file)


def test_invalid_pdf_signature(tmp_path):
    validator = DocumentValidator()
    bad_sig_file = tmp_path / "bad_signature.pdf"
    bad_sig_file.write_bytes(b"Hello world")  # Does not start with %PDF
    
    with pytest.raises(InvalidPDFSignatureError):
        validator.validate_file_properties(bad_sig_file)


def test_max_file_size_exceeded(tmp_path):
    # Set limit to 10 bytes, file is 11 bytes
    validator = DocumentValidator(max_bytes=10)
    oversized_file = tmp_path / "oversized.pdf"
    oversized_file.write_bytes(b"%PDF-1.4\n123")
    
    with pytest.raises(MaxFileSizeExceededError):
        validator.validate_file_properties(oversized_file)


def test_valid_file_signature(tmp_path):
    validator = DocumentValidator()
    valid_sig_file = tmp_path / "valid_sig.pdf"
    valid_sig_file.write_bytes(b"%PDF-1.4\nsome content")
    
    size = validator.validate_file_properties(valid_sig_file)
    assert size == len(b"%PDF-1.4\nsome content")


def test_max_page_limit_exceeded(tmp_path):
    # Dynamically build a valid 2-page PDF
    pdf_path = tmp_path / "two_page.pdf"
    doc = fitz.open()
    doc.new_page()
    doc.new_page()
    doc.save(str(pdf_path))
    doc.close()

    # Configure validator to only allow 1 page max
    validator = DocumentValidator(max_pages=1)
    
    # Reload and test structure validation
    doc_to_test = fitz.open(str(pdf_path))
    try:
        with pytest.raises(MaxPageLimitExceededError):
            validator.validate_document_structure(doc_to_test)
    finally:
        doc_to_test.close()


def test_corrupted_document_structure(tmp_path):
    # Create a corrupted file that starts with %PDF signature but contains garbage
    corrupted_path = tmp_path / "corrupt.pdf"
    corrupted_path.write_bytes(b"%PDF-1.4\nTHIS IS GARBAGE AND CORRUPTED")

    validator = DocumentValidator()
    
    # Opening it will either fail in PyMuPDF or validation checks will catch it
    with pytest.raises((CorruptedPDFError, fitz.FileDataError)):
        doc = fitz.open(str(corrupted_path))
        try:
            validator.validate_document_structure(doc)
        finally:
            doc.close()
