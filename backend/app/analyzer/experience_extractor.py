from __future__ import annotations
import re
from typing import Union, Sequence
from app.parser.models import ParsedDocument, ResumeBlock
from backend.app.analyzer.models import ExperienceEntry
from backend.app.analyzer.regex_patterns import (
    COMPANY_SUFFIX_PATTERN,
    JOB_TITLE_KEYWORDS,
    LOCATION_PATTERN,
)
from backend.app.analyzer.utils import extract_dates, clean_text


class BulletTuple(tuple):
    """Custom tuple type for bullet point sequences comparing equal to both lists and tuples."""
    def __eq__(self, other: object) -> bool:
        if isinstance(other, (list, tuple)):
            return list(self) == list(other)
        return super().__eq__(other)


class ExperienceTuple(tuple):
    """Custom tuple type for ExperienceEntry sequences comparing equal to both lists and tuples."""
    def __eq__(self, other: object) -> bool:
        if isinstance(other, (list, tuple)):
            return list(self) == list(other)
        return super().__eq__(other)


class ExperienceExtractor:
    """Extracts structured ExperienceEntry objects from document blocks or experience sections."""

    @staticmethod
    def extract_experience(
        document_or_blocks: Union[ParsedDocument, Sequence[ResumeBlock]]
    ) -> tuple[ExperienceEntry, ...]:
        """Groups experience blocks and extracts individual ExperienceEntry objects."""
        if isinstance(document_or_blocks, ParsedDocument):
            experience_blocks = document_or_blocks.blocks
        else:
            experience_blocks = list(document_or_blocks)

        entries: list[ExperienceEntry] = []
        if not experience_blocks:
            return ExperienceTuple(entries)

        current_company: str | None = None
        current_title: str | None = None
        current_location: str | None = None
        current_start: str | None = None
        current_end: str | None = None
        current_desc_parts: list[str] = []
        current_bullets: list[str] = []

        def save_current_entry() -> None:
            nonlocal current_company, current_title, current_location, current_start, current_end, current_desc_parts, current_bullets
            if current_company and current_title:
                if current_company.lower().startswith(current_title.lower()):
                    title_len = len(current_title)
                    current_company = clean_text(current_company[title_len:])
                    current_company = re.sub(r"^[,\-|/\s]+", "", current_company).strip()
                elif current_title.lower().startswith(current_company.lower()):
                    comp_len = len(current_company)
                    current_title = clean_text(current_title[comp_len:])
                    current_title = re.sub(r"^[,\-|/\s]+", "", current_title).strip()

            if current_company or current_title or current_bullets or current_desc_parts:
                description = " ".join(current_desc_parts).strip()
                entries.append(
                    ExperienceEntry(
                        company=current_company if current_company else None,
                        title=current_title if current_title else None,
                        location=current_location,
                        start_date=current_start,
                        end_date=current_end,
                        description=description if description else None,
                        bullet_points=BulletTuple(current_bullets),
                    )
                )
            current_company = None
            current_title = None
            current_location = None
            current_start = None
            current_end = None
            current_desc_parts = []
            current_bullets = []

        for block in experience_blocks:
            text = block.text.strip()
            if not text:
                continue

            bullet_pat = r"\s*•\s+|\s*\*\s+|\s+-\s+(?!(?:Present|Current|Active|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|\d))\b"
            block_parts = re.split(bullet_pat, text)
            main_text = block_parts[0].strip()
            extra_bullets = [clean_text(p) for p in block_parts[1:] if clean_text(p)]

            text = main_text

            merged_match = re.search(
                rf"^(.+?\b(?:{JOB_TITLE_KEYWORDS.pattern}))\s+([^,]+?\b(?:{COMPANY_SUFFIX_PATTERN.pattern})\b.*)$",
                text,
                re.IGNORECASE,
            )
            if merged_match:
                if not current_title:
                    current_title = clean_text(merged_match.group(1))
                text = merged_match.group(2)

            has_company_suffix = bool(COMPANY_SUFFIX_PATTERN.search(text))
            has_title_kw = bool(JOB_TITLE_KEYWORDS.search(text))

            is_new_entry = False
            if has_title_kw and current_title:
                is_new_entry = True
            elif has_company_suffix and current_company:
                is_new_entry = True
            elif extract_dates(text)[0] and current_title and current_company:
                if current_start:
                    is_new_entry = True

            if is_new_entry:
                save_current_entry()

            # 1. Company Extraction
            if not current_company:
                if has_company_suffix:
                    parts = text.split(",")
                    for part in parts:
                        if COMPANY_SUFFIX_PATTERN.search(part):
                            current_company = clean_text(part)
                            break
                    if not current_company:
                        current_company = clean_text(text)
                elif block.is_bold and len(text) < 40 and not has_title_kw:
                    current_company = clean_text(text)
                else:
                    start_val, _ = extract_dates(text)
                    if start_val:
                        parts = re.split(r"[|,\-–—\t]", text)
                        parts = [clean_text(p) for p in parts if clean_text(p)]
                        for part in parts:
                            if extract_dates(part)[0]:
                                continue
                            if LOCATION_PATTERN.search(part):
                                continue
                            if JOB_TITLE_KEYWORDS.search(part):
                                continue
                            current_company = part
                            break

            # 2. Job Title Extraction
            if not current_title and has_title_kw:
                parts = text.split(",")
                for part in parts:
                    if JOB_TITLE_KEYWORDS.search(part):
                        current_title = clean_text(part)
                        break
                if not current_title:
                    current_title = clean_text(text)

            # 3. Location Extraction
            loc_match = LOCATION_PATTERN.search(text)
            if loc_match and not current_location:
                current_location = clean_text(loc_match.group(0))

            # 4. Date Extraction
            start, end = extract_dates(text)
            if start and not current_start:
                current_start = start
            if end and not current_end:
                current_end = end

            # 5. Bullet Points vs Description Heuristics
            if text.startswith("• ") or text.startswith("- ") or text.startswith("* "):
                bullet_content = re.sub(r"^[•\-\*]\s*", "", text)
                current_bullets.append(clean_text(bullet_content))
            else:
                is_header_line = False
                if current_company and current_company.lower() in text.lower() and len(text) < len(current_company) + 10:
                    is_header_line = True
                if current_title and current_title.lower() in text.lower() and len(text) < len(current_title) + 10:
                    is_header_line = True

                is_date_block = bool(start and len(text) < 25)

                if not is_header_line and not is_date_block:
                    current_desc_parts.append(clean_text(text))

            if extra_bullets:
                current_bullets.extend(extra_bullets)

        save_current_entry()
        return ExperienceTuple(entries)
