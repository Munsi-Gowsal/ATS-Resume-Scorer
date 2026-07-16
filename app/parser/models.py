from dataclasses import dataclass
from typing import List, Optional


@dataclass(frozen=True)
class ResumeBlock:
    """Represents a single structural text block extracted from a PDF document.
    
    Exposes precise spatial coordinates (bounding box) and font/styling metrics
    to support layout-aware analysis (e.g. distinguishing headers from normal text).
    """
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


@dataclass(frozen=True)
class DocumentMetadata:
    """Represents standard metadata attributes of the uploaded PDF file."""
    title: Optional[str]
    author: Optional[str]
    creator: Optional[str]
    producer: Optional[str]
    page_count: int
    file_size_bytes: int
    is_encrypted: bool
    is_corrupted: bool


@dataclass(frozen=True)
class ParsedDocument:
    """The structured result of parsing a PDF document."""
    metadata: DocumentMetadata
    blocks: List[ResumeBlock]
    raw_text: str
    cleaned_text: str
