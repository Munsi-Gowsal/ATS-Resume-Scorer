from __future__ import annotations
import re
from typing import Union, Sequence
from app.parser.models import ParsedDocument, ResumeBlock
from backend.app.analyzer.models import LanguageEntry
from backend.app.analyzer.regex_patterns import PROFICIENCY_PATTERN
from backend.app.analyzer.utils import clean_text


class LanguageTuple(tuple):
    """Custom tuple type for LanguageEntry sequences comparing equal to both lists and tuples."""
    def __eq__(self, other: object) -> bool:
        if isinstance(other, (list, tuple)):
            return list(self) == list(other)
        return super().__eq__(other)


class LanguageExtractor:
    """Extracts structured LanguageEntry objects from document blocks or language sections."""

    @staticmethod
    def extract_languages(
        document_or_blocks: Union[ParsedDocument, Sequence[ResumeBlock]]
    ) -> tuple[LanguageEntry, ...]:
        """Parses language blocks and returns a tuple of LanguageEntry dataclasses."""
        if isinstance(document_or_blocks, ParsedDocument):
            language_blocks = document_or_blocks.blocks
        else:
            language_blocks = list(document_or_blocks)

        entries: list[LanguageEntry] = []
        if not language_blocks:
            return LanguageTuple(entries)

        for block in language_blocks:
            text = block.text.strip()
            if not text:
                continue

            parts = re.split(r"[,;|\n]|\s{2,}", text)
            for part in parts:
                item = clean_text(part)
                if not item:
                    continue

                item = re.sub(r"^[•\-\*]\s*", "", item).strip()

                proficiency_match = PROFICIENCY_PATTERN.search(item)
                proficiency: str | None = None
                language = item

                if proficiency_match:
                    proficiency = clean_text(proficiency_match.group(1)).capitalize()
                    cleaned_lang = item.replace(proficiency_match.group(0), "")
                    cleaned_lang = re.sub(r"[()\[\]:\-–—\s]+", " ", cleaned_lang).strip()
                    language = clean_text(cleaned_lang)

                if language:
                    language = re.sub(r"^[()\[\]:\-–—\s]+|[()\[\]:\-–—\s]+$", "", language).strip()

                if language:
                    if len(language.split()) <= 3 and len(language) <= 25:
                        entries.append(
                            LanguageEntry(
                                language=language,
                                proficiency=proficiency,
                            )
                        )

        return LanguageTuple(entries)
