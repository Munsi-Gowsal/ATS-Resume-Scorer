import io
import fitz
import pytest
from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)


def create_sample_pdf_bytes() -> bytes:
    """Helper creating in-memory sample PDF bytes for API tests."""
    doc = fitz.open()
    page = doc.new_page()
    page.insert_text((50, 50), "John Doe", fontsize=16, fontname="helvetica-bold")
    page.insert_text((50, 70), "john.doe@example.com | (555) 123-4567 | San Francisco, CA", fontsize=10, fontname="helvetica")
    page.insert_text((50, 100), "SUMMARY", fontsize=12, fontname="helvetica-bold")
    page.insert_text((50, 115), "Experienced Software Engineer skilled in Python, FastAPI, and AWS.", fontsize=10, fontname="helvetica")
    page.insert_text((50, 140), "SKILLS", fontsize=12, fontname="helvetica-bold")
    page.insert_text((50, 155), "Python, FastAPI, AWS, Docker, PostgreSQL", fontsize=10, fontname="helvetica")
    page.insert_text((50, 180), "EXPERIENCE", fontsize=12, fontname="helvetica-bold")
    page.insert_text((50, 195), "Senior Software Engineer", fontsize=11, fontname="helvetica-bold")
    page.insert_text((50, 210), "Tech Corp Inc., 2020 - Present", fontsize=10, fontname="helvetica")
    page.insert_text((50, 225), "• Built scalable REST APIs using FastAPI.", fontsize=10, fontname="helvetica")
    page.insert_text((50, 250), "EDUCATION", fontsize=12, fontname="helvetica-bold")
    page.insert_text((50, 265), "Stanford University", fontsize=11, fontname="helvetica-bold")
    page.insert_text((50, 280), "B.S. in Computer Science | 2016 - 2020", fontsize=10, fontname="helvetica")

    buffer = io.BytesIO()
    doc.save(buffer)
    doc.close()
    return buffer.getvalue()


def test_health_check_endpoint():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_parse_resume_endpoint_valid():
    pdf_bytes = create_sample_pdf_bytes()
    response = client.post(
        "/parse-resume",
        files={"file": ("resume.pdf", pdf_bytes, "application/pdf")}
    )
    assert response.status_code == 200
    data = response.json()
    assert "metadata" in data
    assert "blocks" in data
    assert len(data["blocks"]) > 0


def test_parse_resume_endpoint_invalid_file():
    response = client.post(
        "/parse-resume",
        files={"file": ("invalid.txt", b"invalid content", "text/plain")}
    )
    assert response.status_code == 400
    assert "Invalid file format" in response.json()["error"]


def test_analyze_resume_endpoint():
    pdf_bytes = create_sample_pdf_bytes()
    response = client.post(
        "/analyze-resume",
        files={"file": ("resume.pdf", pdf_bytes, "application/pdf")}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "John Doe"
    assert "john.doe@example.com" in data["emails"]
    assert "Python" in data["skills"]
    assert len(data["experience"]) >= 1
    assert len(data["education"]) >= 1


def test_parse_job_description_raw_text():
    jd_text = "Senior Software Engineer at Tech Corp. Requirements: 5+ years experience in Python, FastAPI, AWS, Docker. Bachelor degree in Computer Science."
    response = client.post(
        "/parse-job-description",
        data={"raw_text": jd_text}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["title"] is not None
    assert data["required_experience_years"] == 5.0
    assert len(data["required_skills"]) > 0


def test_parse_job_description_invalid():
    response = client.post("/parse-job-description")
    assert response.status_code == 400
    assert "valid job description" in response.json()["error"]


def test_match_endpoint():
    pdf_bytes = create_sample_pdf_bytes()
    jd_text = "Senior Software Engineer. Required skills: Python, FastAPI, AWS, Docker. Required experience: 3 years."
    response = client.post(
        "/match",
        files={"file": ("resume.pdf", pdf_bytes, "application/pdf")},
        data={"jd_text": jd_text}
    )
    assert response.status_code == 200
    data = response.json()
    assert "overall_score" in data
    assert "skill_score" in data
    assert "matched_skills" in data
    assert data["overall_score"] > 50.0
