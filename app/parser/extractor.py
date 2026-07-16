from typing import List, Tuple, Dict, Any
import fitz  # PyMuPDF
from app.parser.models import ResumeBlock


class TextExtractor:
    """Extracts structural text blocks with styling metadata (font size, weight, slant, bbox) from a PDF page."""

    def __init__(self, doc: fitz.Document):
        self.doc = doc

    def extract_blocks(self) -> List[ResumeBlock]:
        """Iterates through PDF pages, extracting styled text blocks.
        
        Uses PyMuPDF's `"dict"` extraction layout mode to inspect font attributes
        and spatial locations page by page.
        """
        extracted_blocks: List[ResumeBlock] = []

        for page_idx, page in enumerate(self.doc):
            page_num = page_idx + 1
            # Retrieve detailed structural layout representation of the page
            page_dict = page.get_text("dict")
            blocks = page_dict.get("blocks", [])

            for block in blocks:
                # Type 0 is text. Type 1 is image (skipped)
                if block.get("type") != 0:
                    continue

                block_text_parts: List[str] = []
                span_styles: List[Dict[str, Any]] = []

                for line in block.get("lines", []):
                    for span in line.get("spans", []):
                        text = span.get("text", "")
                        if not text:
                            continue
                        
                        block_text_parts.append(text)
                        
                        # Inspect PyMuPDF style flags
                        # bit 1 (value 2) = italic, bit 2 (value 4) = bold
                        flags = span.get("flags", 0)
                        font_name = span.get("font", "").lower()
                        
                        is_bold = bool(flags & 4) or "bold" in font_name
                        is_italic = bool(flags & 2) or any(style in font_name for style in ["italic", "oblique"])

                        span_styles.append({
                            "text_len": len(text),
                            "font_name": span.get("font", "unknown"),
                            "font_size": span.get("size", 0.0),
                            "is_bold": is_bold,
                            "is_italic": is_italic
                        })

                full_text = " ".join(block_text_parts).strip()
                if not full_text:
                    continue

                # Determine dominant style metrics for the block based on the longest text span
                dominant_style = self._get_dominant_style(span_styles)
                bbox = block.get("bbox", (0.0, 0.0, 0.0, 0.0))

                extracted_blocks.append(ResumeBlock(
                    text=full_text,
                    page_number=page_num,
                    x0=bbox[0],
                    y0=bbox[1],
                    x1=bbox[2],
                    y1=bbox[3],
                    font_name=dominant_style.get("font_name", "unknown"),
                    font_size=dominant_style.get("font_size", 0.0),
                    is_bold=dominant_style.get("is_bold", False),
                    is_italic=dominant_style.get("is_italic", False)
                ))

        return extracted_blocks

    def extract_raw_text(self) -> str:
        """Extracts plain, page-by-page raw text stream from the document."""
        raw_text_parts: List[str] = []
        for page in self.doc:
            raw_text_parts.append(page.get_text("text"))
        return "\n".join(raw_text_parts)

    def _get_dominant_style(self, span_styles: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Identifies the style attributes of the dominant text span in a block.
        
        Dominance is defined by the absolute character count of the span text.
        """
        if not span_styles:
            return {"font_name": "unknown", "font_size": 0.0, "is_bold": False, "is_italic": False}

        # Aggregate lengths per style footprint to find the dominant style
        style_aggregation: Dict[Tuple[str, float, bool, bool], int] = {}
        for style in span_styles:
            key = (style["font_name"], style["font_size"], style["is_bold"], style["is_italic"])
            style_aggregation[key] = style_aggregation.get(key, 0) + style["text_len"]

        # Return the key (style metrics) with the maximum character count
        dominant_key = max(style_aggregation, key=style_aggregation.get)  # type: ignore
        return {
            "font_name": dominant_key[0],
            "font_size": dominant_key[1],
            "is_bold": dominant_key[2],
            "is_italic": dominant_key[3]
        }
