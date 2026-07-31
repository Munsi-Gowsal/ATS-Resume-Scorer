import sys
from dataclasses import dataclass, field
from typing import List, Optional


def slotted_dataclass(*args, **kwargs):
    """Decorator to generate slotted dataclasses compatible with Python 3.9 and 3.10+."""
    def decorator(cls):
        if sys.version_info >= (3, 10):
            return dataclass(*args, **kwargs, slots=True)(cls)
        else:
            cls = dataclass(*args, **kwargs)(cls)
            cls_dict = dict(cls.__dict__)
            fields = cls.__dataclass_fields__
            cls_dict["__slots__"] = tuple(fields.keys())
            for field_name in fields:
                cls_dict.pop(field_name, None)
            cls_dict.pop("__dict__", None)
            cls_dict.pop("__weakref__", None)
            qualname = getattr(cls, "__qualname__", cls.__name__)
            new_cls = type(cls.__name__, cls.__bases__, cls_dict)
            new_cls.__qualname__ = qualname
            return new_cls
    return decorator


@slotted_dataclass(frozen=True)
class ParsedJobDescription:
    """Represents a structured, parsed job description."""
    title: Optional[str] = None
    company: Optional[str] = None
    required_skills: List[str] = field(default_factory=list)
    preferred_skills: List[str] = field(default_factory=list)
    required_experience_years: float = 0.0
    required_degree: Optional[str] = None
    required_field_of_study: Optional[str] = None
    required_keywords: List[str] = field(default_factory=list)
    description: Optional[str] = None
    raw_text: Optional[str] = None


@slotted_dataclass(frozen=True)
class SkillMatchDetails:
    """Detailed breakdown of skill matching analysis."""
    required_matched: List[str] = field(default_factory=list)
    required_missing: List[str] = field(default_factory=list)
    preferred_matched: List[str] = field(default_factory=list)
    preferred_missing: List[str] = field(default_factory=list)
    extra_skills: List[str] = field(default_factory=list)
    score: float = 0.0


@slotted_dataclass(frozen=True)
class ExperienceMatchDetails:
    """Detailed breakdown of experience matching analysis."""
    required_years: float = 0.0
    available_years: float = 0.0
    title_matches: List[str] = field(default_factory=list)
    company_matches: List[str] = field(default_factory=list)
    recent_experience_matched: bool = False
    score: float = 0.0


@slotted_dataclass(frozen=True)
class EducationMatchDetails:
    """Detailed breakdown of education matching analysis."""
    meets_minimum: bool = True
    degree_matched: bool = True
    major_matched: bool = True
    institution_matched: bool = False
    candidate_highest_degree: Optional[str] = None
    required_degree: Optional[str] = None
    score: float = 0.0


@slotted_dataclass(frozen=True)
class KeywordMatchDetails:
    """Detailed breakdown of keyword matching analysis."""
    matched_keywords: List[str] = field(default_factory=list)
    missing_keywords: List[str] = field(default_factory=list)
    score: float = 0.0


@slotted_dataclass(frozen=True)
class MatchResult:
    """Final comprehensive match result produced by the Job Matching Engine."""
    overall_score: float
    skill_score: float
    experience_score: float
    education_score: float
    keyword_score: float
    matched_skills: List[str] = field(default_factory=list)
    missing_skills: List[str] = field(default_factory=list)
    matched_keywords: List[str] = field(default_factory=list)
    missing_keywords: List[str] = field(default_factory=list)
    strengths: List[str] = field(default_factory=list)
    weaknesses: List[str] = field(default_factory=list)
    recommendations: List[str] = field(default_factory=list)
    skill_details: Optional[SkillMatchDetails] = None
    experience_details: Optional[ExperienceMatchDetails] = None
    education_details: Optional[EducationMatchDetails] = None
    keyword_details: Optional[KeywordMatchDetails] = None
