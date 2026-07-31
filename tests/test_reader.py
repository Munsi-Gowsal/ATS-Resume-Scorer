import pytest
import fitz
from app.parser.reader import read_pdf
from app.parser.validators import (
    PDFNotFoundError,
    EmptyPDFError,
    CorruptedPDFError
)


def test_read_pdf_healthy(tmp_path):
    pdf_path = tmp_path / "healthy.pdf"
    doc = fitz.open()
    doc.new_page()
    doc.save(str(pdf_path))
    doc.close()

    result = read_pdf(pdf_path)
    
    assert result.filename == "healthy.pdf"
    assert result.size_bytes > 0
    assert result.page_count == 1
    assert isinstance(result.doc, fitz.Document)
    assert result.doc.is_closed is False
    
    result.doc.close()


def test_read_pdf_missing(tmp_path):
    missing_path = tmp_path / "does_not_exist.pdf"
    with pytest.raises(PDFNotFoundError):
        read_pdf(missing_path)


def test_read_pdf_empty(tmp_path):
    empty_path = tmp_path / "empty.pdf"
    empty_path.write_bytes(b"")

    with pytest.raises(EmptyPDFError):
        read_pdf(empty_path)


def test_read_pdf_corrupted(tmp_path):
    corrupt_path = tmp_path / "corrupt.pdf"
    corrupt_path.write_bytes(b"%PDF-1.4\nCorrupted structural markers")

    with pytest.raises(CorruptedPDFError):
        read_pdf(corrupt_path)
