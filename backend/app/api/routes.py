from __future__ import annotations
from typing import Optional
from fastapi import APIRouter, File, UploadFile, Form, Depends, status

from app.parser.parser import ResumeParser
from backend.app.analyzer.analyzer import ResumeAnalyzer
from backend.app.matcher import JobMatcher, ParsedJobDescription
from backend.app.api.dependencies import (
    get_resume_parser,
    get_resume_analyzer,
    get_job_matcher,
    save_upload_file_tmp,
    parse_job_description_from_text,
)
from backend.app.api.exceptions import InvalidFileFormatError, JobDescriptionParsingError
from backend.app.api.schemas import (
    ParsedDocumentSchema,
    ResumeSchema,
    ParsedJobDescriptionSchema,
    MatchResultSchema,
    ParseJobDescriptionTextRequestSchema,
)

router = APIRouter()


@router.get("/health", status_code=status.HTTP_200_OK, tags=["Health"])
def health_check() -> dict:
    """Returns application health status."""
    return {"status": "ok"}


@router.post(
    "/parse-resume",
    response_model=ParsedDocumentSchema,
    status_code=status.HTTP_200_OK,
    summary="Parse Resume PDF into ParsedDocument",
    tags=["Resume"],
)
def parse_resume(
    file: UploadFile = File(..., description="Resume PDF file"),
    parser: ResumeParser = Depends(get_resume_parser),
) -> ParsedDocumentSchema:
    """Parses an uploaded resume PDF document into layout-aware blocks and metadata."""
    with save_upload_file_tmp(file) as tmp_path:
        parsed_doc = parser.parse(tmp_path)

    return ParsedDocumentSchema.model_validate(parsed_doc, from_attributes=True)


@router.post(
    "/analyze-resume",
    response_model=ResumeSchema,
    status_code=status.HTTP_200_OK,
    summary="Analyze Resume PDF into structured Resume object",
    tags=["Resume"],
)
def analyze_resume(
    file: UploadFile = File(..., description="Resume PDF file"),
    parser: ResumeParser = Depends(get_resume_parser),
    analyzer: ResumeAnalyzer = Depends(get_resume_analyzer),
) -> ResumeSchema:
    """Parses and analyzes an uploaded resume PDF document into structured candidate information."""
    with save_upload_file_tmp(file) as tmp_path:
        parsed_doc = parser.parse(tmp_path)

    resume = analyzer.analyze(parsed_doc)
    return ResumeSchema.model_validate(resume, from_attributes=True)


@router.post(
    "/parse-job-description",
    response_model=ParsedJobDescriptionSchema,
    status_code=status.HTTP_200_OK,
    summary="Parse Job Description from text or file",
    tags=["Job Description"],
)
def parse_job_description(
    file: Optional[UploadFile] = File(None, description="Optional Job Description text or PDF file"),
    raw_text: Optional[str] = Form(None, description="Optional raw text of the job description"),
    json_request: Optional[ParseJobDescriptionTextRequestSchema] = None,
) -> ParsedJobDescriptionSchema:
    """Parses a job description provided either as a multipart file, form text, or JSON payload."""
    text_content = ""

    if file is not None:
        # Enforce maximum upload size limit to prevent memory exhaustion
        MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB
        content_bytes = bytearray()
        try:
            while chunk := file.file.read(8192):
                content_bytes.extend(chunk)
                if len(content_bytes) > MAX_FILE_SIZE:
                    raise InvalidFileFormatError(
                        message="Uploaded file exceeds the maximum allowed limit of 10MB."
                    )
        finally:
            try:
                file.file.close()
            except Exception:
                pass

        if file.filename and file.filename.lower().endswith(".pdf"):
            with save_upload_file_tmp(file) as tmp_path:
                parser = ResumeParser()
                parsed_doc = parser.parse(tmp_path)
                text_content = parsed_doc.cleaned_text
        else:
            text_content = content_bytes.decode("utf-8", errors="ignore")
    elif raw_text:
        text_content = raw_text
    elif json_request and json_request.raw_text:
        text_content = json_request.raw_text

    if not text_content.strip():
        raise JobDescriptionParsingError(message="Please provide a valid job description text or file.")

    parsed_jd = parse_job_description_from_text(text_content)
    return ParsedJobDescriptionSchema.model_validate(parsed_jd, from_attributes=True)


@router.post(
    "/match",
    response_model=MatchResultSchema,
    status_code=status.HTTP_200_OK,
    summary="Match Resume against Job Description",
    tags=["Matching"],
)
def match_resume_to_jd(
    file: UploadFile = File(..., description="Candidate Resume PDF file"),
    jd_text: Optional[str] = Form(None, description="Job Description text"),
    jd_file: Optional[UploadFile] = File(None, description="Optional Job Description file"),
    parser: ResumeParser = Depends(get_resume_parser),
    analyzer: ResumeAnalyzer = Depends(get_resume_analyzer),
    matcher: JobMatcher = Depends(get_job_matcher),
) -> MatchResultSchema:
    """Compares a candidate resume PDF against a job description (text or file) and returns structured MatchResult."""
    # 1. Parse and analyze resume
    with save_upload_file_tmp(file) as tmp_path:
        parsed_doc = parser.parse(tmp_path)
    resume = analyzer.analyze(parsed_doc)

    # 2. Parse job description
    target_jd_text = ""
    if jd_file is not None:
        if jd_file.filename and jd_file.filename.lower().endswith(".pdf"):
            with save_upload_file_tmp(jd_file) as jd_tmp_path:
                jd_parsed_doc = parser.parse(jd_tmp_path)
                target_jd_text = jd_parsed_doc.cleaned_text
        else:
            MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB
            jd_bytes = bytearray()
            try:
                while chunk := jd_file.file.read(8192):
                    jd_bytes.extend(chunk)
                    if len(jd_bytes) > MAX_FILE_SIZE:
                        raise InvalidFileFormatError(
                            message="Uploaded file exceeds the maximum allowed limit of 10MB."
                        )
            finally:
                try:
                    jd_file.file.close()
                except Exception:
                    pass
            target_jd_text = jd_bytes.decode("utf-8", errors="ignore")
    elif jd_text:
        target_jd_text = jd_text

    if not target_jd_text.strip():
        raise JobDescriptionParsingError(message="Please provide a valid job description text or file for matching.")

    parsed_jd = parse_job_description_from_text(target_jd_text)

    # 3. Perform deterministic matching
    match_result = matcher.match(resume, parsed_jd)
    return MatchResultSchema.model_validate(match_result, from_attributes=True)
