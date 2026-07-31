from __future__ import annotations
from app.parser.models import ParsedDocument
from backend.app.analyzer.models import Resume
from backend.app.analyzer.utils import sort_blocks_reading_order, clean_text
from backend.app.analyzer.section_detector import SectionDetector
from backend.app.analyzer.contact_extractor import ContactExtractor
from backend.app.analyzer.skill_extractor import SkillExtractor
from backend.app.analyzer.education_extractor import EducationExtractor
from backend.app.analyzer.experience_extractor import ExperienceExtractor
from backend.app.analyzer.project_extractor import ProjectExtractor
from backend.app.analyzer.certification_extractor import CertificationExtractor
from backend.app.analyzer.language_extractor import LanguageExtractor


class ResumeAnalyzer:
    """Orchestrator class for parsing and structuring resume contents into a Resume object."""

    @staticmethod
    def analyze(doc: ParsedDocument) -> Resume:
        """Analyzes a ParsedDocument and extracts structured Resume information."""
        # 1. Sort blocks into reading order
        sorted_blocks = sort_blocks_reading_order(doc.blocks)

        # 2. Segment blocks into logical sections via SectionDetector
        sections = SectionDetector.detect_sections(sorted_blocks)

        # 3. Delegate contact metadata extraction to ContactExtractor
        emails = ContactExtractor.extract_emails(doc.cleaned_text)
        phones = ContactExtractor.extract_phones(doc.cleaned_text)
        linkedin_urls = ContactExtractor.extract_linkedin_urls(doc.cleaned_text)
        github_urls = ContactExtractor.extract_github_urls(doc.cleaned_text)
        portfolio_urls = ContactExtractor.extract_portfolio_urls(doc.cleaned_text)

        name = ContactExtractor.extract_name(sorted_blocks)
        location = ContactExtractor.extract_location(sections["contact"])
        if not location and sorted_blocks:
            location = ContactExtractor.extract_location(sorted_blocks[:10])

        # 4. Extract summary section text
        summary_raw = " ".join([b.text for b in sections["summary"]]).strip()
        summary = clean_text(summary_raw) if summary_raw else None

        # 5. Delegate section extractions to specialized extractors
        skills = SkillExtractor.extract_skills(sections["skills"])
        education = EducationExtractor.extract_education(sections["education"])
        experience = ExperienceExtractor.extract_experience(sections["experience"])
        projects = ProjectExtractor.extract_projects(sections["projects"])
        certifications = CertificationExtractor.extract_certifications(sections["certifications"])
        languages = LanguageExtractor.extract_languages(sections["languages"])

        # 6. Assemble and return structured Resume dataclass instance
        return Resume(
            name=name,
            emails=emails,
            phone_numbers=phones,
            linkedin_urls=linkedin_urls,
            github_urls=github_urls,
            portfolio_urls=portfolio_urls,
            location=location,
            summary=summary,
            skills=skills,
            education=education,
            experience=experience,
            projects=projects,
            certifications=certifications,
            languages=languages,
        )
