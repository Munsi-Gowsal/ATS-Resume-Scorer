import pytest
import fitz
from app.parser.parser import ResumeParser
from app.parser.validators import MaxPageLimitExceededError, MaxFileSizeExceededError


def test_end_to_end_resume_parsing(tmp_path):
    pdf_path = tmp_path / "end_to_end.pdf"
    
    doc = fitz.open()
    page = doc.new_page()
    page.insert_text((50, 100), "SUMMARY SECTION", fontsize=14, fontname="helvetica-bold")
    page.insert_text((50, 150), "\u2022 Senior Software Engineer", fontsize=10, fontname="helvetica")
    doc.save(str(pdf_path))
    doc.close()

    # Parse document
    parsed_doc = ResumeParser.parse(pdf_path)
    
    # 1. Verify Metadata
    assert parsed_doc.metadata.page_count == 1
    assert parsed_doc.metadata.file_size_bytes > 0
    assert parsed_doc.metadata.is_encrypted is False
    assert parsed_doc.metadata.is_corrupted is False
    
    # 2. Verify Blocks (Check that the bullet was normalized)
    assert len(parsed_doc.blocks) >= 2
    
    header_block = next(b for b in parsed_doc.blocks if "SUMMARY" in b.text)
    assert header_block.is_bold is True
    assert header_block.is_italic is False
    
    content_block = next(b for b in parsed_doc.blocks if "Senior" in b.text)
    assert content_block.text.startswith("• ")
    assert content_block.is_bold is False

    # 3. Verify general cleaned text stream
    assert "SUMMARY SECTION" in parsed_doc.cleaned_text
    assert "• Senior Software Engineer" in parsed_doc.cleaned_text


def test_parser_with_page_limit_enforcement(tmp_path):
    pdf_path = tmp_path / "multi_page.pdf"
    
    doc = fitz.open()
    doc.new_page()
    doc.new_page()
    doc.save(str(pdf_path))
    doc.close()

    # Parse with limit of 1 page
    with pytest.raises(MaxPageLimitExceededError):
        ResumeParser.parse(pdf_path, max_pages=1)


def test_parser_with_file_size_limit_enforcement(tmp_path):
    pdf_path = tmp_path / "size_check.pdf"
    
    doc = fitz.open()
    doc.new_page()
    doc.save(str(pdf_path))
    doc.close()

    # Parse with small size constraint of 10 bytes
    with pytest.raises(MaxFileSizeExceededError):
        ResumeParser.parse(pdf_path, max_bytes=10)
