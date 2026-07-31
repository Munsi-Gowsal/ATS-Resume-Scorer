from __future__ import annotations
import re
from typing import Union, Sequence
from app.parser.models import ParsedDocument, ResumeBlock
from backend.app.analyzer.regex_patterns import SECTION_PATTERNS, HEADING_PATTERN
from backend.app.analyzer.utils import sort_blocks_reading_order, clean_heading


class SectionDetector:
    """Classifies document text blocks into logical resume sections using visual and structural features."""

    @staticmethod
    def _split_merged_header_blocks(blocks: Sequence[ResumeBlock]) -> list[ResumeBlock]:
        """Splits blocks that start with a section header followed immediately by body content."""
        split_blocks: list[ResumeBlock] = []
        for block in blocks:
            text = block.text.strip()
            if not text:
                continue

            matched_sec: str | None = None
            header_text: str | None = None
            remaining_text: str | None = None

            for sec_name, pattern in SECTION_PATTERNS.items():
                pattern_str = pattern.pattern.strip("^$")
                m = re.match(rf"^({pattern_str})\b[:\-\s]*(.+)$", text, re.IGNORECASE)
                if m:
                    matched_sec = sec_name
                    header_text = m.group(1).strip()
                    remaining_text = m.group(2).strip()
                    break

            if matched_sec and remaining_text and header_text:
                height = block.y1 - block.y0
                b_header = ResumeBlock(
                    text=header_text,
                    page_number=block.page_number,
                    x0=block.x0,
                    y0=block.y0,
                    x1=block.x1,
                    y1=block.y0 + (height * 0.3),
                    font_name=block.font_name,
                    font_size=block.font_size,
                    is_bold=block.is_bold,
                    is_italic=block.is_italic,
                )
                b_content = ResumeBlock(
                    text=remaining_text,
                    page_number=block.page_number,
                    x0=block.x0,
                    y0=block.y0 + (height * 0.3),
                    x1=block.x1,
                    y1=block.y1,
                    font_name=block.font_name,
                    font_size=block.font_size,
                    is_bold=False,
                    is_italic=block.is_italic,
                )
                split_blocks.append(b_header)
                split_blocks.append(b_content)
            else:
                split_blocks.append(block)

        return split_blocks

    @staticmethod
    def detect_sections(
        document_or_blocks: Union[ParsedDocument, Sequence[ResumeBlock]]
    ) -> dict[str, list[ResumeBlock]]:
        """Segments a ParsedDocument or list of ResumeBlocks into logical resume sections.

        Detects: summary, skills, experience, education, projects, certifications, languages.
        Default section prior to first heading is 'contact'.
        """
        sections: dict[str, list[ResumeBlock]] = {
            "contact": [],
            "summary": [],
            "skills": [],
            "experience": [],
            "education": [],
            "projects": [],
            "certifications": [],
            "languages": [],
        }

        if isinstance(document_or_blocks, ParsedDocument):
            raw_blocks = document_or_blocks.blocks
        else:
            raw_blocks = list(document_or_blocks)

        if not raw_blocks:
            return sections

        # Sort blocks into reading order to handle single-column, multi-column, and reordered layouts
        sorted_blocks = sort_blocks_reading_order(raw_blocks)
        processed_blocks = SectionDetector._split_merged_header_blocks(sorted_blocks)

        # Style & Font metrics
        font_sizes = [b.font_size for b in processed_blocks if b.font_size > 0]
        avg_font_size = (sum(font_sizes) / len(font_sizes)) if font_sizes else 10.0
        has_bold_elements = any(b.is_bold for b in processed_blocks)
        is_uniform_styling = len(set(font_sizes)) <= 1 and not has_bold_elements

        current_section = "contact"

        for block in processed_blocks:
            text_stripped = block.text.strip()
            if not text_stripped:
                continue

            clean_text = clean_heading(text_stripped)

            matched_section: str | None = None
            for sec_name, pattern in SECTION_PATTERNS.items():
                if pattern.match(clean_text) or pattern.match(text_stripped):
                    matched_section = sec_name
                    break

            is_header = False
            if matched_section:
                word_count = len(text_stripped.split())
                if word_count <= 5:
                    if is_uniform_styling:
                        is_header = True
                    else:
                        is_bold = block.is_bold
                        is_upper = text_stripped.isupper() and any(c.isalpha() for c in text_stripped)
                        is_larger = block.font_size > (avg_font_size + 0.5)
                        is_heading_rx = bool(HEADING_PATTERN.match(text_stripped))

                        if is_bold or is_upper or is_larger or is_heading_rx:
                            is_header = True

            if is_header and matched_section:
                current_section = matched_section
            else:
                sections[current_section].append(block)

        return sections
