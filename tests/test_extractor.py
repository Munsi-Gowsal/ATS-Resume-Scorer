import pytest
import fitz
from app.parser.extractor import TextExtractor


def test_raw_text_extraction(tmp_path):
    pdf_path = tmp_path / "raw_text.pdf"
    
    # Create test PDF and write text
    doc = fitz.open()
    page = doc.new_page()
    page.insert_text((50, 50), "Line One\nLine Two")
    doc.save(str(pdf_path))
    doc.close()

    # Load and test
    doc_to_test = fitz.open(str(pdf_path))
    try:
        extractor = TextExtractor(doc_to_test)
        raw_text = extractor.extract_raw_text()
        
        # Verify text stream contains the written lines
        assert "Line One" in raw_text
        assert "Line Two" in raw_text
    finally:
        doc_to_test.close()


def test_layout_and_font_style_extraction(tmp_path):
    pdf_path = tmp_path / "layout_style.pdf"
    
    doc = fitz.open()
    page = doc.new_page()
    
    # 1. Insert a Bold Title (size 16)
    page.insert_text((100, 100), "RESUME TITLE", fontsize=16, fontname="helvetica-bold")
    
    # 2. Insert Italic Normal Text (size 10)
    page.insert_text((100, 200), "Senior Dev Candidate", fontsize=10, fontname="helvetica-oblique")
    
    doc.save(str(pdf_path))
    doc.close()

    doc_to_test = fitz.open(str(pdf_path))
    try:
        extractor = TextExtractor(doc_to_test)
        blocks = extractor.extract_blocks()
        
        # We should have extracted at least the 2 text structures
        assert len(blocks) >= 2
        
        # Locate bold title block
        title_block = next(b for b in blocks if "RESUME" in b.text)
        assert title_block.is_bold is True
        assert title_block.is_italic is False
        assert title_block.font_size == pytest.approx(16.0, abs=0.5)
        assert title_block.page_number == 1
        assert title_block.x0 > 0
        assert title_block.y0 > 0
        
        # Locate italic text block
        desc_block = next(b for b in blocks if "Candidate" in b.text)
        assert desc_block.is_bold is False
        assert desc_block.is_italic is True
        assert desc_block.font_size == pytest.approx(10.0, abs=0.5)
    finally:
        doc_to_test.close()
