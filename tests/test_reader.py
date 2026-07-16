import pytest
import fitz
from app.parser.reader import PDFReader
from app.parser.validators import PDFNotFoundError, CorruptedPDFError


def test_reader_diagnostics_for_healthy_pdf(tmp_path):
    pdf_path = tmp_path / "healthy.pdf"
    doc = fitz.open()
    doc.new_page()
    doc.save(str(pdf_path))
    doc.close()

    reader = PDFReader(pdf_path)
    diagnostics = reader.diagnostics

    assert diagnostics["is_valid_pdf"] is True
    assert diagnostics["is_corrupted"] is False
    assert diagnostics["is_encrypted"] is False
    assert diagnostics["page_count"] == 1
    assert diagnostics["file_size_bytes"] > 0


def test_reader_diagnostics_for_missing_file(tmp_path):
    missing_path = tmp_path / "does_not_exist.pdf"
    with pytest.raises(PDFNotFoundError):
        PDFReader(missing_path)


def test_reader_diagnostics_for_empty_file(tmp_path):
    empty_path = tmp_path / "empty.pdf"
    empty_path.write_bytes(b"")

    with pytest.raises(Exception):
        PDFReader(empty_path)


def test_reader_diagnostics_for_corrupted_pdf(tmp_path):
    corrupt_path = tmp_path / "corrupt.pdf"
    corrupt_path.write_bytes(b"%PDF-1.4\nCorrupted structural markers")

    # Creating the reader shouldn't crash immediately; it runs a passive diagnostic check
    reader = PDFReader(corrupt_path)
    diagnostics = reader.diagnostics

    assert diagnostics["is_valid_pdf"] is True
    assert diagnostics["is_corrupted"] is True
    assert diagnostics["page_count"] == 0


def test_reader_open_document_lifecycle(tmp_path):
    pdf_path = tmp_path / "lifecycle.pdf"
    doc = fitz.open()
    doc.new_page()
    doc.save(str(pdf_path))
    doc.close()

    reader = PDFReader(pdf_path)
    doc_handler = reader.open_document()
    
    assert isinstance(doc_handler, fitz.Document)
    assert doc_handler.is_closed is False
    
    doc_handler.close()
    assert doc_handler.is_closed is True
