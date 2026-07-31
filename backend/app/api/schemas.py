from __future__ import annotations
from typing import List, Optional
from pydantic import BaseModel, Field


# ParsedDocument Schemas
class DocumentMetadataSchema(BaseModel):
    title: Optional[str] = None
    author: Optional[str] = None
    creator: Optional[str] = None
    producer: Optional[str] = None
    page_count: int = 0
    file_size_bytes: int = 0
    is_encrypted: bool = False
    is_corrupted: bool = False


class ResumeBlockSchema(BaseModel):
    text: str
    page_number: int
    x0: float
    y0: float
    x1: float
    y1: float
    font_name: str
    font_size: float
    is_bold: bool
    is_italic: bool


class ParsedDocumentSchema(BaseModel):
    metadata: DocumentMetadataSchema
    blocks: List[ResumeBlockSchema] = Field(default_factory=list)
    raw_text: str = ""
    cleaned_text: str = ""


# Resume Analysis Schemas
class EducationEntrySchema(BaseModel):
    school: Optional[str] = None
    degree: Optional[str] = None
    field_of_study: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    gpa: Optional[str] = None
    details: List[str] = Field(default_factory=list)


class ExperienceEntrySchema(BaseModel):
    company: Optional[str] = None
    title: Optional[str] = None
    location: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    description: Optional[str] = None
    bullet_points: List[str] = Field(default_factory=list)


class ProjectEntrySchema(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    technologies: List[str] = Field(default_factory=list)
    link: Optional[str] = None
    bullet_points: List[str] = Field(default_factory=list)


class CertificationEntrySchema(BaseModel):
    name: Optional[str] = None
    issuing_organization: Optional[str] = None
    date: Optional[str] = None
    link: Optional[str] = None


class LanguageEntrySchema(BaseModel):
    language: Optional[str] = None
    proficiency: Optional[str] = None


class ResumeSchema(BaseModel):
    name: Optional[str] = None
    emails: List[str] = Field(default_factory=list)
    phone_numbers: List[str] = Field(default_factory=list)
    linkedin_urls: List[str] = Field(default_factory=list)
    github_urls: List[str] = Field(default_factory=list)
    portfolio_urls: List[str] = Field(default_factory=list)
    location: Optional[str] = None
    summary: Optional[str] = None
    skills: List[str] = Field(default_factory=list)
    education: List[EducationEntrySchema] = Field(default_factory=list)
    experience: List[ExperienceEntrySchema] = Field(default_factory=list)
    projects: List[ProjectEntrySchema] = Field(default_factory=list)
    certifications: List[CertificationEntrySchema] = Field(default_factory=list)
    languages: List[LanguageEntrySchema] = Field(default_factory=list)


# Job Description Schemas
class ParsedJobDescriptionSchema(BaseModel):
    title: Optional[str] = None
    company: Optional[str] = None
    required_skills: List[str] = Field(default_factory=list)
    preferred_skills: List[str] = Field(default_factory=list)
    required_experience_years: float = 0.0
    required_degree: Optional[str] = None
    required_field_of_study: Optional[str] = None
    required_keywords: List[str] = Field(default_factory=list)
    description: Optional[str] = None
    raw_text: Optional[str] = None


class ParseJobDescriptionTextRequestSchema(BaseModel):
    raw_text: str = Field(..., description="Raw job description text to parse.")


# Match Result Schemas
class SkillMatchDetailsSchema(BaseModel):
    required_matched: List[str] = Field(default_factory=list)
    required_missing: List[str] = Field(default_factory=list)
    preferred_matched: List[str] = Field(default_factory=list)
    preferred_missing: List[str] = Field(default_factory=list)
    extra_skills: List[str] = Field(default_factory=list)
    score: float = 0.0


class ExperienceMatchDetailsSchema(BaseModel):
    required_years: float = 0.0
    available_years: float = 0.0
    title_matches: List[str] = Field(default_factory=list)
    company_matches: List[str] = Field(default_factory=list)
    recent_experience_matched: bool = False
    score: float = 0.0


class EducationMatchDetailsSchema(BaseModel):
    meets_minimum: bool = True
    degree_matched: bool = True
    major_matched: bool = True
    institution_matched: bool = False
    candidate_highest_degree: Optional[str] = None
    required_degree: Optional[str] = None
    score: float = 0.0


class KeywordMatchDetailsSchema(BaseModel):
    matched_keywords: List[str] = Field(default_factory=list)
    missing_keywords: List[str] = Field(default_factory=list)
    score: float = 0.0


class MatchResultSchema(BaseModel):
    overall_score: float
    skill_score: float
    experience_score: float
    education_score: float
    keyword_score: float
    matched_skills: List[str] = Field(default_factory=list)
    missing_skills: List[str] = Field(default_factory=list)
    matched_keywords: List[str] = Field(default_factory=list)
    missing_keywords: List[str] = Field(default_factory=list)
    strengths: List[str] = Field(default_factory=list)
    weaknesses: List[str] = Field(default_factory=list)
    recommendations: List[str] = Field(default_factory=list)
    skill_details: Optional[SkillMatchDetailsSchema] = None
    experience_details: Optional[ExperienceMatchDetailsSchema] = None
    education_details: Optional[EducationMatchDetailsSchema] = None
    keyword_details: Optional[KeywordMatchDetailsSchema] = None
