from __future__ import annotations
import sys
import dataclasses
from dataclasses import dataclass

# Python 3.9 backward compatibility helper for slots=True keyword argument
if sys.version_info < (3, 10):
    _orig_dataclass = dataclasses.dataclass
    def dataclass(*args, **kwargs):
        kwargs.pop("slots", None)
        return _orig_dataclass(*args, **kwargs)


@dataclass(frozen=True, slots=True)
class EducationEntry:
    """Represents an educational background record."""
    school: str | None = None
    degree: str | None = None
    field_of_study: str | None = None
    start_date: str | None = None
    end_date: str | None = None
    gpa: str | None = None
    details: tuple[str, ...] = ()


@dataclass(frozen=True, slots=True)
class ExperienceEntry:
    """Represents a work experience record."""
    company: str | None = None
    title: str | None = None
    location: str | None = None
    start_date: str | None = None
    end_date: str | None = None
    description: str | None = None
    bullet_points: tuple[str, ...] = ()


@dataclass(frozen=True, slots=True)
class ProjectEntry:
    """Represents a project record."""
    title: str | None = None
    description: str | None = None
    technologies: tuple[str, ...] = ()
    link: str | None = None
    bullet_points: tuple[str, ...] = ()


@dataclass(frozen=True, slots=True)
class CertificationEntry:
    """Represents a professional certification record."""
    name: str | None = None
    issuing_organization: str | None = None
    date: str | None = None
    link: str | None = None


@dataclass(frozen=True, slots=True)
class LanguageEntry:
    """Represents a language proficiency record."""
    language: str | None = None
    proficiency: str | None = None


@dataclass(frozen=True, slots=True)
class Resume:
    """Represents a parsed candidate resume document."""
    name: str | None = None
    emails: tuple[str, ...] = ()
    phone_numbers: tuple[str, ...] = ()
    linkedin_urls: tuple[str, ...] = ()
    github_urls: tuple[str, ...] = ()
    portfolio_urls: tuple[str, ...] = ()
    location: str | None = None
    summary: str | None = None
    skills: tuple[str, ...] = ()
    education: tuple[EducationEntry, ...] = ()
    experience: tuple[ExperienceEntry, ...] = ()
    projects: tuple[ProjectEntry, ...] = ()
    certifications: tuple[CertificationEntry, ...] = ()
    languages: tuple[LanguageEntry, ...] = ()
