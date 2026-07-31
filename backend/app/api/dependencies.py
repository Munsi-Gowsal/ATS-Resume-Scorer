from __future__ import annotations
import os
import re
import tempfile
from pathlib import Path
from contextlib import contextmanager
from typing import Generator, List, Set, Optional
from fastapi import UploadFile

from app.parser.parser import ResumeParser
from backend.app.analyzer.analyzer import ResumeAnalyzer
from backend.app.analyzer.regex_patterns import DEGREE_PATTERN, JOB_TITLE_KEYWORDS
from backend.app.matcher import JobMatcher, ParsedJobDescription
from backend.app.matcher.utils import extract_keywords, parse_degree_rank, SKILL_ALIASES
from backend.app.api.exceptions import InvalidFileFormatError


def get_resume_parser() -> ResumeParser:
    """Dependency provider for ResumeParser."""
    return ResumeParser()


def get_resume_analyzer() -> ResumeAnalyzer:
    """Dependency provider for ResumeAnalyzer."""
    return ResumeAnalyzer()


def get_job_matcher() -> JobMatcher:
    """Dependency provider for JobMatcher."""
    return JobMatcher()


@contextmanager
def save_upload_file_tmp(upload_file: UploadFile) -> Generator[Path, None, None]:
    """Saves an UploadFile to a temporary file on disk and cleans it up on exit."""
    # Sanitize input filename to prevent directory traversal
    raw_filename = upload_file.filename or "upload.pdf"
    filename = Path(raw_filename).name
    if not filename.lower().endswith(".pdf"):
        raise InvalidFileFormatError(message="Invalid file format. Only PDF files are supported.")

    tmp_dir = tempfile.mkdtemp()
    tmp_path = Path(tmp_dir) / filename
    try:
        # Enforce maximum upload size limit to prevent memory exhaustion
        MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB
        content = bytearray()
        while chunk := upload_file.file.read(8192):
            content.extend(chunk)
            if len(content) > MAX_FILE_SIZE:
                raise InvalidFileFormatError(
                    message="Uploaded file exceeds the maximum allowed limit of 10MB."
                )

        if not content:
            raise InvalidFileFormatError(message="Uploaded file is empty.")
        with open(tmp_path, "wb") as f:
            f.write(content)
        yield tmp_path
    finally:
        try:
            upload_file.file.close()
        except Exception:
            pass
        if tmp_path.exists():
            try:
                os.remove(tmp_path)
            except OSError:
                pass
        if os.path.exists(tmp_dir):
            try:
                os.rmdir(tmp_dir)
            except OSError:
                pass


def parse_job_description_from_text(text: str) -> ParsedJobDescription:
    """Extracts structured ParsedJobDescription fields from raw job description text."""
    if not text:
        return ParsedJobDescription()

    raw_text = text.strip()
    lines = [line.strip() for line in raw_text.splitlines() if line.strip()]

    # 1. Job Title Extraction
    title: Optional[str] = None
    for line in lines[:5]:
        if JOB_TITLE_KEYWORDS.search(line):
            title = line
            break
    if not title and lines:
        title = lines[0]

    # 2. Required Experience Years Extraction (e.g. "5+ years", "3-5 years")
    exp_years = 0.0
    exp_match = re.search(r"\b(\d{1,2})\+?\s*(?:-\s*\d{1,2}\s*)?years?\b", raw_text, re.IGNORECASE)
    if exp_match:
        try:
            exp_years = float(exp_match.group(1))
        except ValueError:
            exp_years = 0.0

    # 3. Required Degree Extraction
    req_degree: Optional[str] = None
    degree_match = DEGREE_PATTERN.search(raw_text)
    if degree_match:
        req_degree = degree_match.group(0)

    # 4. Extract Skills (scan text for known skills from SKILL_ALIASES and keywords)
    detected_skills: List[str] = []
    text_lower = raw_text.lower()
    for alias, canonical in SKILL_ALIASES.items():
        if re.search(rf"\b{re.escape(alias)}\b", text_lower):
            if canonical.capitalize() not in detected_skills:
                detected_skills.append(canonical.capitalize())

    # Categorize first half as required, rest as preferred if skills found
    half = len(detected_skills) // 2 or len(detected_skills)
    required_skills = detected_skills[:half]
    preferred_skills = detected_skills[half:]

    # 5. Extract General Keywords
    keywords = list(extract_keywords(raw_text))

    return ParsedJobDescription(
        title=title,
        company=None,
        required_skills=required_skills,
        preferred_skills=preferred_skills,
        required_experience_years=exp_years,
        required_degree=req_degree,
        required_field_of_study=None,
        required_keywords=keywords[:20],
        description=raw_text,
        raw_text=raw_text,
    )
