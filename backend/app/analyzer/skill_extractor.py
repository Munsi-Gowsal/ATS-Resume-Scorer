from __future__ import annotations
import re
from typing import Union, Sequence
from app.parser.models import ParsedDocument, ResumeBlock
from backend.app.analyzer.utils import (
    normalize_whitespace,
    split_bullets,
)

PRESERVED_SLASH_TERMS: set[str] = {
    "ci/cd", "c/c++", "tcp/ip", "pl/sql", "t-sql/pl-sql", "i/o", "os/2", "ui/ux"
}


class SkillTuple(tuple):
    """Custom tuple type for skills that compares equal to both lists and tuples."""
    def __eq__(self, other: object) -> bool:
        if isinstance(other, (list, tuple)):
            return list(self) == list(other)
        return super().__eq__(other)


class SkillExtractor:
    """Extracts and normalizes technical skills from document blocks or skills sections."""

    @staticmethod
    def _clean_skill_token(token: str) -> str:
        """Normalizes a single skill candidate string."""
        cleaned = normalize_whitespace(token)
        cleaned = re.sub(r"^[•*–—\-◦▪▸►:,;\s]+", "", cleaned)
        cleaned = re.sub(r"[:,;\s]+$", "", cleaned)
        return cleaned

    @staticmethod
    def _is_valid_skill(skill: str) -> bool:
        """Validates if an extracted string represents a valid technical skill item."""
        if not skill:
            return False
        words = skill.split()
        if len(words) > 4 or len(skill) > 40:
            return False
        return True

    @staticmethod
    def _split_delimiters(line: str) -> list[str]:
        """Splits a line by commas, pipes, semicolons, bullets, and slashes when appropriate."""
        if not line:
            return []

        # Remove category prefixes like "Languages: Python, Go" -> "Python, Go"
        colon_match = re.match(r"^([^:]{1,35}):\s*(.*)$", line)
        if colon_match:
            line = colon_match.group(2)

        primary_parts = re.split(r"[,|;\t•◦▪▸►\n]|\s{2,}", line)
        raw_tokens: list[str] = []

        for part in primary_parts:
            part_clean = part.strip()
            if not part_clean:
                continue

            if "/" in part_clean and part_clean.lower() not in PRESERVED_SLASH_TERMS:
                slash_parts = part_clean.split("/")
                sub_tokens = [sp.strip() for sp in slash_parts if sp.strip()]
                if all(len(st.split()) <= 2 for st in sub_tokens):
                    raw_tokens.extend(sub_tokens)
                else:
                    raw_tokens.append(part_clean)
            else:
                raw_tokens.append(part_clean)

        return raw_tokens

    @staticmethod
    def extract_skills(
        document_or_blocks: Union[ParsedDocument, Sequence[ResumeBlock]]
    ) -> tuple[str, ...]:
        """Extracts individual technical skills from section blocks or a ParsedDocument."""
        if isinstance(document_or_blocks, ParsedDocument):
            blocks = document_or_blocks.blocks
        else:
            blocks = list(document_or_blocks)

        extracted_skills: list[str] = []

        for block in blocks:
            text = block.text.strip()
            if not text:
                continue

            lines = split_bullets(text)
            for line in lines:
                tokens = SkillExtractor._split_delimiters(line)
                for token in tokens:
                    cleaned = SkillExtractor._clean_skill_token(token)
                    if SkillExtractor._is_valid_skill(cleaned):
                        extracted_skills.append(cleaned)

        # Deduplicate while preserving order (case-insensitive deduplication)
        seen: set[str] = set()
        unique_skills: list[str] = []
        for skill in extracted_skills:
            skill_key = skill.lower()
            if skill_key not in seen:
                seen.add(skill_key)
                unique_skills.append(skill)

        return SkillTuple(unique_skills)
