from __future__ import annotations
import re
from typing import TypeVar, Iterable, Sequence
from app.parser.models import ResumeBlock
from backend.app.analyzer.regex_patterns import (
    DATE_RANGE_PATTERN,
    DATE_PATTERN,
    WHITESPACE_PATTERN,
    BULLET_PATTERN,
)

T = TypeVar("T")


def normalize_whitespace(text: str) -> str:
    """Normalizes all leading, trailing, and internal whitespace into single spaces."""
    if not text:
        return ""
    return WHITESPACE_PATTERN.sub(" ", text).strip()


def deduplicate_preserve_order(items: Iterable[T]) -> list[T]:
    """Deduplicates items from an iterable while strictly preserving initial insertion order."""
    seen: set[T] = set()
    result: list[T] = []
    for item in items:
        if item not in seen:
            seen.add(item)
            result.append(item)
    return result


def normalize_url(url: str) -> str:
    """Normalizes URL by ensuring https scheme, stripping trailing slashes and spaces."""
    if not url:
        return ""
    cleaned = url.strip()
    if not cleaned:
        return ""
    if not cleaned.startswith(("http://", "https://")):
        cleaned = "https://" + cleaned
    return cleaned.rstrip("/")


def split_bullets(text: str) -> list[str]:
    """Splits block text into clean, non-empty bullet points."""
    if not text:
        return []
    lines = text.splitlines()
    bullets: list[str] = []
    for line in lines:
        cleaned_line = BULLET_PATTERN.sub("", line).strip()
        if cleaned_line:
            bullets.append(cleaned_line)
    return bullets


def clean_heading(heading: str) -> str:
    """Cleans section heading text by removing trailing colons, dashes, and extra whitespace."""
    if not heading:
        return ""
    cleaned = BULLET_PATTERN.sub("", heading).strip()
    cleaned = re.sub(r"[:\-–—]+$", "", cleaned).strip()
    return normalize_whitespace(cleaned).lower()


def group_blocks_by_page(blocks: Sequence[ResumeBlock]) -> dict[int, list[ResumeBlock]]:
    """Groups a sequence of ResumeBlocks by page number."""
    blocks_by_page: dict[int, list[ResumeBlock]] = {}
    for block in blocks:
        blocks_by_page.setdefault(block.page_number, []).append(block)
    return blocks_by_page


def sort_blocks_reading_order(blocks: list[ResumeBlock]) -> list[ResumeBlock]:
    """Sorts resume text blocks into a natural, column-aware reading order."""
    if not blocks:
        return []

    blocks_by_page = group_blocks_by_page(blocks)
    sorted_all_blocks: list[ResumeBlock] = []

    for page_num in sorted(blocks_by_page.keys()):
        page_blocks = blocks_by_page[page_num]
        if not page_blocks:
            continue

        x0s = [b.x0 for b in page_blocks]
        x1s = [b.x1 for b in page_blocks]
        page_x0 = min(x0s)
        page_x1 = max(x1s)
        page_width = page_x1 - page_x0

        if page_width <= 50:
            sorted_all_blocks.extend(sorted(page_blocks, key=lambda b: (b.y0, b.x0)))
            continue

        page_mid = page_x0 + (page_width / 2.0)
        tolerance = max(20.0, page_width * 0.08)

        y_sorted_blocks = sorted(page_blocks, key=lambda b: b.y0)

        def is_spanning(b: ResumeBlock) -> bool:
            return b.x0 < (page_mid - tolerance) and b.x1 > (page_mid + tolerance)

        bands: list[list[ResumeBlock]] = []
        current_band: list[ResumeBlock] = []

        for block in y_sorted_blocks:
            if is_spanning(block):
                if current_band:
                    bands.append(current_band)
                    current_band = []
                bands.append([block])
            else:
                current_band.append(block)

        if current_band:
            bands.append(current_band)

        page_sorted_blocks: list[ResumeBlock] = []
        for band in bands:
            if len(band) <= 1:
                page_sorted_blocks.extend(band)
                continue

            left_count = sum(1 for b in band if b.x1 <= page_mid + tolerance)
            right_count = sum(1 for b in band if b.x0 >= page_mid - tolerance)

            if left_count > 0 and right_count > 0 and (left_count + right_count) >= len(band) * 0.7:
                left_col = []
                right_col = []
                for b in band:
                    center_x = (b.x0 + b.x1) / 2.0
                    if center_x < page_mid:
                        left_col.append(b)
                    else:
                        right_col.append(b)

                left_sorted = sorted(left_col, key=lambda b: (b.y0, b.x0))
                right_sorted = sorted(right_col, key=lambda b: (b.y0, b.x0))

                page_sorted_blocks.extend(left_sorted)
                page_sorted_blocks.extend(right_sorted)
            else:
                page_sorted_blocks.extend(sorted(band, key=lambda b: (b.y0, b.x0)))

        sorted_all_blocks.extend(page_sorted_blocks)

    return sorted_all_blocks


def clean_text(text: str) -> str:
    """Basic text cleanup utility."""
    return normalize_whitespace(text)


def extract_dates(text: str) -> tuple[str | None, str | None]:
    """Extracts start and end dates from a given text block."""
    if not text:
        return None, None

    range_match = DATE_RANGE_PATTERN.search(text)
    if range_match:
        start_m = range_match.group(1) or ""
        start_y = range_match.group(2)
        start_date = f"{start_m.strip()} {start_y}".strip() if start_y else None

        end_m = range_match.group(3) or ""
        end_y = range_match.group(4)
        end_p = range_match.group(5)

        if end_y:
            end_date = f"{end_m.strip()} {end_y}".strip()
        elif end_p:
            end_date = end_p.strip().capitalize()
        else:
            end_date = None

        return start_date, end_date

    matches = DATE_PATTERN.findall(text)
    if matches:
        clean_matches = []
        for m in matches:
            if isinstance(m, tuple):
                m_str = " ".join([part for part in m if part]).strip()
                if m_str:
                    clean_matches.append(m_str)
            elif isinstance(m, str) and m:
                clean_matches.append(m)

        if len(clean_matches) >= 2:
            return clean_matches[0], clean_matches[1]
        elif len(clean_matches) == 1:
            return clean_matches[0], None

    return None, None
