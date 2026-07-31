import random
import string
import io
import pytest
import fitz  # PyMuPDF
from fastapi.testclient import TestClient

from app.parser.parser import ResumeParser
from app.parser.validators import PDFParserError, CorruptedPDFError
from app.parser.models import ParsedDocument, ResumeBlock, DocumentMetadata
from backend.app.analyzer.analyzer import ResumeAnalyzer
from backend.app.api.dependencies import parse_job_description_from_text
from backend.app.matcher.matcher import JobMatcher
from backend.app.matcher.models import ParsedJobDescription
from backend.main import app

# Use raise_server_exceptions=False so that TestClient returns error status codes (e.g. 500/400)
# rather than propagating unhandled exceptions directly to the test framework.
client = TestClient(app, raise_server_exceptions=False)

# Helper generators for fuzz inputs
def generate_random_unicode(length: int = 100) -> str:
    """Generates a random string containing normal chars, emojis, RTL text, and combining marks."""
    categories = [
        (0x0020, 0x007E),  # ASCII
        (0x00A0, 0x00FF),  # Latin-1 Supplement
        (0x0400, 0x04FF),  # Cyrillic
        (0x0590, 0x05FF),  # Hebrew (RTL)
        (0x0600, 0x06FF),  # Arabic (RTL)
        (0x1F600, 0x1F64F),  # Emoticons
        (0x2000, 0x206F),  # General Punctuation
    ]
    chars = []
    for _ in range(length):
        start, end = random.choice(categories)
        chars.append(chr(random.randint(start, end)))
    return "".join(chars)

def generate_random_bytes(length: int = 1000) -> bytes:
    """Generates random byte sequences (potentially invalid UTF-8)."""
    return bytes(random.getrandbits(8) for _ in range(length))

def generate_long_text(word_count: int = 50000) -> str:
    """Generates a very long text string for performance and buffer limits test."""
    words = ["fuzz", "resume", "test", "FastAPI", "software", "development", "🚀", "python", "code", "years"]
    return " ".join(random.choice(words) for _ in range(word_count))


# ==========================================
# 1. Resume Parser Fuzz Tests
# ==========================================

def test_parser_fuzz_corrupted_pdf_signature(tmp_path):
    """Test parser with file starting with %PDF but followed by random invalid bytes."""
    corrupt_file = tmp_path / "corrupt_sig.pdf"
    content = b"%PDF" + generate_random_bytes(500)
    corrupt_file.write_bytes(content)
    
    with pytest.raises((PDFParserError, fitz.FileDataError)):
        ResumeParser.parse(corrupt_file)

def test_parser_fuzz_empty_file(tmp_path):
    """Test parser with 0 byte files."""
    empty_file = tmp_path / "empty.pdf"
    empty_file.write_bytes(b"")
    
    with pytest.raises(PDFParserError):
        ResumeParser.parse(empty_file)

def test_parser_fuzz_completely_random_bytes(tmp_path):
    """Test parser with random bytes not starting with %PDF."""
    random_file = tmp_path / "random_bytes.pdf"
    random_file.write_bytes(generate_random_bytes(1000))
    
    with pytest.raises(PDFParserError):
        ResumeParser.parse(random_file)


# ==========================================
# 2. Resume Analyzer Fuzz Tests
# ==========================================

def test_analyzer_fuzz_unicode_and_garbage_blocks():
    """Verify analyzer handles blocks with exotic Unicode, RTL text, and empty values without crash."""
    for _ in range(10):
        fuzz_text_1 = generate_random_unicode(random.randint(5, 500))
        fuzz_text_2 = generate_long_text(random.randint(100, 1000))
        
        blocks = [
            ResumeBlock(
                text=fuzz_text_1,
                page_number=1,
                x0=0.0, y0=0.0, x1=100.0, y1=10.0,
                font_name="Helvetica", font_size=10.0,
                is_bold=False, is_italic=False
            ),
            ResumeBlock(
                text=fuzz_text_2,
                page_number=1,
                x0=0.0, y0=20.0, x1=100.0, y1=30.0,
                font_name="Helvetica-Bold", font_size=12.0,
                is_bold=True, is_italic=True
            )
        ]
        
        doc = ParsedDocument(
            metadata=DocumentMetadata(
                title="Fuzz",
                author="Author",
                creator="Creator",
                producer="Producer",
                page_count=1,
                file_size_bytes=1000,
                is_encrypted=False,
                is_corrupted=False
            ),
            blocks=blocks,
            raw_text=fuzz_text_1 + "\n" + fuzz_text_2,
            cleaned_text=fuzz_text_1 + " " + fuzz_text_2
        )
        
        # Test analyzer logic (should run to completion regardless of text format)
        resume = ResumeAnalyzer.analyze(doc)
        assert isinstance(resume.skills, (list, tuple))
        assert isinstance(resume.experience, (list, tuple))


# ==========================================
# 3. Job Parser Fuzz Tests
# ==========================================

@pytest.mark.parametrize("fuzz_input", [
    generate_random_unicode(1000),
    generate_long_text(20000),
    "",
    "   \n  \t  ",
    "years " * 100,
    "Python\x00FastAPI\x00Developer"
])
def test_job_parser_fuzz(fuzz_input):
    """Test parsing job descriptions using various fuzz text inputs."""
    parsed_jd = parse_job_description_from_text(fuzz_input)
    assert isinstance(parsed_jd, ParsedJobDescription)
    assert isinstance(parsed_jd.required_skills, (list, tuple))
    assert isinstance(parsed_jd.preferred_skills, (list, tuple))


# ==========================================
# 4. Matcher Fuzz Tests
# ==========================================

def test_matcher_fuzz_anomalous_inputs():
    """Verify Matcher returns scores bounded in 0-100 for random properties."""
    matcher = JobMatcher()
    
    for _ in range(10):
        # Generate arbitrary parsed resume properties
        resume = ResumeAnalyzer.analyze(
            ParsedDocument(
                metadata=DocumentMetadata(
                    title="Fuzz",
                    author="Author",
                    creator="Creator",
                    producer="Producer",
                    page_count=1,
                    file_size_bytes=500,
                    is_encrypted=False,
                    is_corrupted=False
                ),
                blocks=[
                    ResumeBlock(
                        text=generate_random_unicode(50), page_number=1,
                        x0=0, y0=0, x1=50, y1=10, font_name="Arial", font_size=10.0,
                        is_bold=False, is_italic=False
                    )
                ],
                raw_text=generate_random_unicode(200),
                cleaned_text=generate_random_unicode(200)
            )
        )
        
        # Generate arbitrary parsed job description properties
        jd = ParsedJobDescription(
            title=generate_random_unicode(20),
            company=generate_random_unicode(20),
            required_skills=[generate_random_unicode(10) for _ in range(5)],
            preferred_skills=[generate_random_unicode(10) for _ in range(5)],
            required_experience_years=random.uniform(-10.0, 100.0),
            required_degree=generate_random_unicode(15),
            required_field_of_study=generate_random_unicode(15),
            required_keywords=[generate_random_unicode(10) for _ in range(10)],
            description=generate_long_text(500),
            raw_text=generate_long_text(500)
        )
        
        result = matcher.match(resume, jd)
        assert 0.0 <= result.overall_score <= 100.0
        assert 0.0 <= result.skill_score <= 100.0
        assert 0.0 <= result.experience_score <= 100.0
        assert 0.0 <= result.education_score <= 100.0
        assert 0.0 <= result.keyword_score <= 100.0


# ==========================================
# 5. FastAPI Endpoint Fuzz Tests
# ==========================================

def test_api_parse_resume_invalid_bytes():
    """Verify endpoint rejects random invalid byte stream uploads gracefully with HTTP 400/500."""
    random_bytes = generate_random_bytes(2000)
    response = client.post(
        "/parse-resume",
        files={"file": ("fuzz.pdf", random_bytes, "application/pdf")}
    )
    assert response.status_code in (400, 500)
    assert "error" in response.json()

def test_api_parse_resume_empty_upload():
    """Verify endpoint rejects empty file uploads with HTTP 400/500."""
    response = client.post(
        "/parse-resume",
        files={"file": ("empty.pdf", b"", "application/pdf")}
    )
    assert response.status_code in (400, 500)
    assert "error" in response.json()

def test_api_parse_job_description_malformed_text():
    """Verify job parser handles non-ASCII unicode or extremely long forms gracefully."""
    response = client.post(
        "/parse-job-description",
        data={"raw_text": generate_random_unicode(5000)}
    )
    assert response.status_code == 200
    assert "required_skills" in response.json()

def test_api_match_endpoint_malformed_multipart():
    """Verify match endpoint behaves properly when multipart payloads are empty or missing expected headers."""
    # Scenario A: Missing file parameter
    response = client.post(
        "/match",
        data={"jd_text": "Need python dev"}
    )
    assert response.status_code == 422  # FastAPI validation error (unprocessable entity)
    
    # Scenario B: PDF is empty bytes
    response = client.post(
        "/match",
        files={"file": ("empty.pdf", b"", "application/pdf")},
        data={"jd_text": "Need python dev"}
    )
    assert response.status_code in (400, 500)
    assert "error" in response.json()
