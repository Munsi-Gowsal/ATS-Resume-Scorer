import pytest
from app.parser.models import ParsedDocument, ResumeBlock, DocumentMetadata
from backend.app.analyzer.models import Resume, EducationEntry, ExperienceEntry, ProjectEntry, CertificationEntry, LanguageEntry
from backend.app.analyzer.analyzer import ResumeAnalyzer
from backend.app.analyzer.section_detector import SectionDetector
from backend.app.analyzer.contact_extractor import ContactExtractor
from backend.app.analyzer.skill_extractor import SkillExtractor
from backend.app.analyzer.education_extractor import EducationExtractor
from backend.app.analyzer.experience_extractor import ExperienceExtractor
from backend.app.analyzer.project_extractor import ProjectExtractor
from backend.app.analyzer.certification_extractor import CertificationExtractor
from backend.app.analyzer.language_extractor import LanguageExtractor


def create_doc(blocks: list[ResumeBlock]) -> ParsedDocument:
    """Helper fixture generator for creating ParsedDocument from blocks."""
    cleaned_text = "\n".join([b.text for b in blocks])
    metadata = DocumentMetadata(
        title="Test Resume",
        author="Tester",
        creator="System",
        producer="PDF",
        page_count=1,
        file_size_bytes=1024,
        is_encrypted=False,
        is_corrupted=False,
    )
    return ParsedDocument(
        metadata=metadata,
        blocks=blocks,
        raw_text=cleaned_text,
        cleaned_text=cleaned_text,
    )


# 1. Contact Extraction Tests
def test_contact_extraction_complete():
    """Tests name, single/multiple emails, phone numbers, social links, portfolio, and location."""
    blocks = [
        ResumeBlock("Alice Smith", 1, 50, 50, 200, 70, "Helvetica-Bold", 16.0, True, False),
        ResumeBlock(
            "alice@example.com | alice.work@example.com | +1 (555) 019-2834 | San Francisco, CA",
            1, 50, 75, 500, 90, "Helvetica", 10.0, False, False
        ),
        ResumeBlock(
            "linkedin.com/in/alicesmith | github.com/alicesmith | https://alice.dev",
            1, 50, 95, 500, 110, "Helvetica", 10.0, False, False
        ),
    ]
    doc = create_doc(blocks)
    resume = ResumeAnalyzer.analyze(doc)

    assert resume.name == "Alice Smith"
    assert "alice@example.com" in resume.emails
    assert "alice.work@example.com" in resume.emails
    assert any("(555) 019-2834" in p or "555" in p for p in resume.phone_numbers)
    assert any("alicesmith" in url for url in resume.linkedin_urls)
    assert any("alicesmith" in url for url in resume.github_urls)
    assert any("alice.dev" in url for url in resume.portfolio_urls)
    assert resume.location == "San Francisco, CA"


# 2. Skills Extraction Tests
def test_skills_comma_separated_and_duplicates():
    """Tests comma-separated, mixed separators, duplicate skills deduplication."""
    blocks = [
        ResumeBlock("TECHNICAL SKILLS", 1, 50, 50, 150, 65, "Helvetica-Bold", 12.0, True, False),
        ResumeBlock("Python, Go, Python, JavaScript / TypeScript | Rust", 1, 50, 75, 450, 90, "Helvetica", 10.0, False, False),
    ]
    doc = create_doc(blocks)
    resume = ResumeAnalyzer.analyze(doc)

    assert "Python" in resume.skills
    assert "Go" in resume.skills
    assert "JavaScript" in resume.skills
    assert "TypeScript" in resume.skills
    assert "Rust" in resume.skills
    python_count = sum(1 for s in resume.skills if s.lower() == "python")
    assert python_count == 1


def test_skills_bullet_list_and_empty():
    """Tests bullet list skills and empty skills section handling."""
    blocks = [
        ResumeBlock("TECHNICAL SKILLS", 1, 50, 50, 150, 65, "Helvetica-Bold", 12.0, True, False),
        ResumeBlock("• Docker", 1, 50, 75, 200, 90, "Helvetica", 10.0, False, False),
        ResumeBlock("• Kubernetes", 1, 50, 95, 200, 110, "Helvetica", 10.0, False, False),
        ResumeBlock("• AWS", 1, 50, 115, 200, 130, "Helvetica", 10.0, False, False),
    ]
    doc = create_doc(blocks)
    resume = ResumeAnalyzer.analyze(doc)

    assert "Docker" in resume.skills
    assert "Kubernetes" in resume.skills
    assert "AWS" in resume.skills

    empty_doc = create_doc([])
    empty_resume = ResumeAnalyzer.analyze(empty_doc)
    assert len(empty_resume.skills) == 0


# 3. Education Extraction Tests
def test_education_single_and_multiple_degrees():
    """Tests single degree, multiple degrees, GPA present and absent, missing graduation year."""
    blocks = [
        ResumeBlock("EDUCATION", 1, 50, 50, 150, 65, "Helvetica-Bold", 12.0, True, False),
        ResumeBlock("Harvard University", 1, 50, 80, 250, 95, "Helvetica-Bold", 11.0, True, False),
        ResumeBlock("M.S. in Data Science, GPA: 3.92 | May 2021", 1, 50, 100, 400, 115, "Helvetica", 10.0, False, False),
        ResumeBlock("MIT School of Engineering", 1, 50, 140, 250, 155, "Helvetica-Bold", 11.0, True, False),
        ResumeBlock("B.S. in Computer Science", 1, 50, 160, 400, 175, "Helvetica", 10.0, False, False),
    ]
    doc = create_doc(blocks)
    resume = ResumeAnalyzer.analyze(doc)

    assert len(resume.education) == 2
    edu1 = resume.education[0]
    assert edu1.school == "Harvard University"
    assert edu1.degree == "M.S."
    assert edu1.gpa == "3.92"
    assert edu1.start_date is not None or edu1.end_date is not None

    edu2 = resume.education[1]
    assert edu2.school == "MIT School of Engineering"
    assert edu2.degree == "B.S."
    assert edu2.gpa is None


# 4. Experience Extraction Tests
def test_experience_jobs_and_current_position():
    """Tests single job, multiple jobs, current position ('Present'), missing dates, multi-line descriptions."""
    blocks = [
        ResumeBlock("EXPERIENCE", 1, 50, 50, 150, 65, "Helvetica-Bold", 12.0, True, False),
        ResumeBlock("Staff Software Engineer", 1, 50, 80, 200, 95, "Helvetica-Bold", 11.0, True, False),
        ResumeBlock("Stripe Inc., Jan 2022 - Present", 1, 50, 100, 300, 115, "Helvetica", 10.0, False, False),
        ResumeBlock("Architected payment processing services.", 1, 50, 120, 500, 135, "Helvetica", 10.0, False, False),
        ResumeBlock("• Reduced latency by 40%.", 1, 50, 140, 500, 155, "Helvetica", 10.0, False, False),
        ResumeBlock("Senior Backend Engineer", 1, 50, 180, 200, 195, "Helvetica-Bold", 11.0, True, False),
        ResumeBlock("Uber Technologies Corp", 1, 50, 200, 300, 215, "Helvetica", 10.0, False, False),
        ResumeBlock("Designed dispatching engine.", 1, 50, 220, 500, 235, "Helvetica", 10.0, False, False),
    ]
    doc = create_doc(blocks)
    resume = ResumeAnalyzer.analyze(doc)

    assert len(resume.experience) == 2
    exp1 = resume.experience[0]
    assert exp1.company == "Stripe Inc."
    assert exp1.title == "Staff Software Engineer"
    assert exp1.end_date == "Present"
    assert len(exp1.bullet_points) == 1

    exp2 = resume.experience[1]
    assert exp2.company == "Uber Technologies Corp"
    assert exp2.title == "Senior Backend Engineer"


# 5. Projects Extraction Tests
def test_projects_links_and_tech_stack():
    """Tests multiple projects, GitHub links, live URLs, missing tech stack."""
    blocks = [
        ResumeBlock("PROJECTS", 1, 50, 50, 150, 65, "Helvetica-Bold", 12.0, True, False),
        ResumeBlock("AI Resume Intelligence", 1, 50, 80, 250, 95, "Helvetica-Bold", 11.0, True, False),
        ResumeBlock("github.com/test/resume-ai | Python, FastApi", 1, 50, 100, 400, 115, "Helvetica", 10.0, False, False),
        ResumeBlock("Cloud Monitoring Dashboard", 1, 50, 140, 250, 155, "Helvetica-Bold", 11.0, True, False),
        ResumeBlock("https://dashboard.io", 1, 50, 160, 400, 175, "Helvetica", 10.0, False, False),
    ]
    doc = create_doc(blocks)
    resume = ResumeAnalyzer.analyze(doc)

    assert len(resume.projects) == 2
    proj1 = resume.projects[0]
    assert proj1.title == "AI Resume Intelligence"
    assert "github.com/test/resume-ai" in proj1.link or "https://github.com/test/resume-ai" in proj1.link
    assert "Python" in proj1.technologies

    proj2 = resume.projects[1]
    assert proj2.title == "Cloud Monitoring Dashboard"
    assert "https://dashboard.io" in proj2.link


# 6. Certifications Extraction Tests
def test_certifications_single_multiple_missing_issuer():
    """Tests single certification, multiple certifications, missing issuer."""
    blocks = [
        ResumeBlock("CERTIFICATIONS", 1, 50, 50, 150, 65, "Helvetica-Bold", 12.0, True, False),
        ResumeBlock("Google Professional Cloud Architect, 2021", 1, 50, 80, 450, 95, "Helvetica", 10.0, False, False),
        ResumeBlock("Certified Kubernetes Administrator", 1, 50, 110, 450, 125, "Helvetica", 10.0, False, False),
    ]
    doc = create_doc(blocks)
    resume = ResumeAnalyzer.analyze(doc)

    assert len(resume.certifications) == 2
    assert "Cloud Architect" in resume.certifications[0].name or "Professional" in resume.certifications[0].name
    assert resume.certifications[1].name == "Certified Kubernetes Administrator"


# 7. Languages Extraction Tests
def test_languages_multiple_and_missing_proficiency():
    """Tests multiple languages and missing proficiency."""
    blocks = [
        ResumeBlock("LANGUAGES", 1, 50, 50, 150, 65, "Helvetica-Bold", 12.0, True, False),
        ResumeBlock("English (Full Professional), French, German (B2)", 1, 50, 80, 450, 95, "Helvetica", 10.0, False, False),
    ]
    doc = create_doc(blocks)
    resume = ResumeAnalyzer.analyze(doc)

    assert len(resume.languages) == 3
    assert resume.languages[0].language == "English"
    assert resume.languages[1].language == "French"
    assert resume.languages[1].proficiency is None


# 8. Section Detection Tests
def test_section_detection_reordered_and_formats():
    """Tests reordered sections, uppercase headings, bold headings, missing headings."""
    blocks = [
        ResumeBlock("Carol Danvers", 1, 50, 50, 200, 70, "Helvetica-Bold", 16.0, True, False),
        ResumeBlock("TECHNICAL SKILLS", 1, 50, 100, 150, 115, "Helvetica-Bold", 12.0, True, False),
        ResumeBlock("Python, Go", 1, 50, 120, 300, 135, "Helvetica", 10.0, False, False),
        ResumeBlock("WORK EXPERIENCE", 1, 50, 160, 200, 175, "Helvetica-Bold", 12.0, True, False),
        ResumeBlock("Engineer at NASA Inc., 2020 - Present", 1, 50, 180, 400, 195, "Helvetica", 10.0, False, False),
    ]
    doc = create_doc(blocks)
    sections = SectionDetector.detect_sections(doc)

    assert "skills" in sections
    assert "experience" in sections
    assert len(sections["skills"]) == 1
    assert len(sections["experience"]) == 1


# 9. Edge Cases Tests
def test_edge_cases():
    """Tests empty ParsedDocument, unicode characters, very large resume, duplicate contact info, resume with no experience/education."""
    empty_doc = create_doc([])
    r_empty = ResumeAnalyzer.analyze(empty_doc)
    assert r_empty.name is None

    unicode_blocks = [
        ResumeBlock("José González", 1, 50, 50, 200, 70, "Helvetica-Bold", 16.0, True, False),
        ResumeBlock("jose@domain.es | São Paulo, Brazil", 1, 50, 75, 400, 90, "Helvetica", 10.0, False, False),
    ]
    r_unicode = ResumeAnalyzer.analyze(create_doc(unicode_blocks))
    assert r_unicode.name == "José González"
    assert r_unicode.location == "São Paulo, Brazil"

    dup_blocks = [
        ResumeBlock("dup@domain.com", 1, 50, 50, 200, 65, "Helvetica", 10.0, False, False),
        ResumeBlock("dup@domain.com", 1, 50, 75, 200, 90, "Helvetica", 10.0, False, False),
    ]
    r_dup = ResumeAnalyzer.analyze(create_doc(dup_blocks))
    assert len(r_dup.emails) == 1

    large_blocks = [ResumeBlock(f"Block content line {i}", 1, 50, 50 + (i * 20), 400, 65 + (i * 20), "Helvetica", 10.0, False, False) for i in range(200)]
    r_large = ResumeAnalyzer.analyze(create_doc(large_blocks))
    assert isinstance(r_large, Resume)
