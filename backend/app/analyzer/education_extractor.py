from __future__ import annotations
import re
from typing import Union, Sequence
from app.parser.models import ParsedDocument, ResumeBlock
from backend.app.analyzer.models import EducationEntry
from backend.app.analyzer.regex_patterns import (
    DEGREE_PATTERN,
    GPA_PATTERN,
    SCHOOL_KEYWORDS,
)
from backend.app.analyzer.utils import extract_dates, clean_text, normalize_whitespace


class EducationTuple(tuple):
    """Custom tuple type for EducationEntry sequences comparing equal to both lists and tuples."""
    def __eq__(self, other: object) -> bool:
        if isinstance(other, (list, tuple)):
            return list(self) == list(other)
        return super().__eq__(other)


class EducationExtractor:
    """Extracts structured EducationEntry objects from document blocks or education sections."""

    @staticmethod
    def extract_education(
        document_or_blocks: Union[ParsedDocument, Sequence[ResumeBlock]]
    ) -> tuple[EducationEntry, ...]:
        """Groups education blocks and extracts individual EducationEntry objects."""
        if isinstance(document_or_blocks, ParsedDocument):
            education_blocks = document_or_blocks.blocks
        else:
            education_blocks = list(document_or_blocks)

        entries: list[EducationEntry] = []
        if not education_blocks:
            return EducationTuple(entries)

        current_school: str | None = None
        current_degree: str | None = None
        current_field: str | None = None
        current_start: str | None = None
        current_end: str | None = None
        current_gpa: str | None = None
        current_details: list[str] = []

        def save_current_entry() -> None:
            nonlocal current_school, current_degree, current_field, current_start, current_end, current_gpa, current_details
            if current_school or current_degree or current_field or current_details:
                entries.append(
                    EducationEntry(
                        school=current_school,
                        degree=current_degree,
                        field_of_study=current_field,
                        start_date=current_start,
                        end_date=current_end,
                        gpa=current_gpa,
                        details=tuple(current_details),
                    )
                )
            current_school = None
            current_degree = None
            current_field = None
            current_start = None
            current_end = None
            current_gpa = None
            current_details = []

        for block in education_blocks:
            text = block.text.strip()
            if not text:
                continue

            has_school_kw = bool(SCHOOL_KEYWORDS.search(text))
            has_degree_kw = bool(DEGREE_PATTERN.search(text))

            # Trigger a new entry if school or degree keywords appear and current entry already has those fields
            if (has_school_kw and current_school) or (has_degree_kw and current_degree):
                save_current_entry()

            # 1. School Extraction
            if not current_school and has_school_kw:
                parts = text.split(",")
                for part in parts:
                    if SCHOOL_KEYWORDS.search(part):
                        current_school = clean_text(part)
                        break
                if not current_school:
                    current_school = clean_text(text)

            # 2. Degree and Field of Study Extraction
            degree_match = DEGREE_PATTERN.search(text)
            if degree_match:
                if not current_degree:
                    raw_deg = degree_match.group(1)
                    deg_upper = raw_deg.upper()
                    if "BACHELOR" in deg_upper or "B.S" in deg_upper or "B.A" in deg_upper:
                        current_degree = "B.S." if "S" in deg_upper else "B.A."
                    elif "MASTER" in deg_upper or "M.S" in deg_upper or "M.A" in deg_upper or "M.B.A" in deg_upper or "MBA" in deg_upper:
                        if "M.B.A" in deg_upper or "MBA" in deg_upper:
                            current_degree = "M.B.A."
                        else:
                            current_degree = "M.S." if "S" in deg_upper else "M.A."
                    elif "DOCTOR" in deg_upper or "PH" in deg_upper:
                        current_degree = "Ph.D."
                    elif "ASSOCIATE" in deg_upper:
                        current_degree = "Associate"
                    else:
                        current_degree = clean_text(raw_deg)

                field_match = re.search(r"\bin\s+([a-zA-Z\s&]{3,50})", text, re.IGNORECASE)
                if field_match and not current_field:
                    current_field = clean_text(field_match.group(1))

            if not current_field:
                major_match = re.search(r"\bmajor\s*:\s*([a-zA-Z\s&]{3,50})", text, re.IGNORECASE)
                if major_match:
                    current_field = clean_text(major_match.group(1))

            # 3. GPA Extraction
            gpa_match = GPA_PATTERN.search(text)
            if gpa_match and not current_gpa:
                current_gpa = clean_text(gpa_match.group(1))

            # 4. Dates Extraction
            start, end = extract_dates(text)
            if start and not current_start:
                current_start = start
            if end and not current_end:
                current_end = end

            # 5. Details Collection
            is_main_school_line = (
                current_school and current_school.lower() in text.lower() and len(text) < len(current_school) + 10
            )
            is_main_degree_line = (
                current_degree and current_degree.lower() in text.lower() and len(text) < len(current_degree) + 15
            )

            if not is_main_school_line and not is_main_degree_line:
                if not (start and len(text) < 25):
                    current_details.append(clean_text(text))

        save_current_entry()
        return EducationTuple(entries)
