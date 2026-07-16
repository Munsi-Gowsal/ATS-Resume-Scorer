import os
from typing import Dict, Any, Optional
import fitz  # PyMuPDF
from app.parser.models import DocumentMetadata


class MetadataExtractor:
    """Extracts document-level metadata properties from a PyMuPDF Document."""

    @staticmethod
    def extract(doc: fitz.Document) -> DocumentMetadata:
        """Extracts and formats metadata from an open PyMuPDF Document.
        
        Args:
            doc: Open fitz.Document object.
            
        Returns:
            A DocumentMetadata dataclass.
        """
        raw_metadata: Dict[str, Any] = doc.metadata or {}

        def clean_field(field_key: str) -> Optional[str]:
            val = raw_metadata.get(field_key)
            if isinstance(val, str):
                cleaned = val.strip()
                return cleaned if cleaned else None
            return None

        # Fetch file size via system calls if path is available
        file_size_bytes = 0
        if doc.name:
            try:
                if os.path.exists(doc.name):
                    file_size_bytes = os.path.getsize(doc.name)
            except Exception:
                pass

        # If we reached this point, the document has been successfully opened
        # so is_corrupted is False. We check is_encrypted directly.
        return DocumentMetadata(
            title=clean_field("title"),
            author=clean_field("author"),
            creator=clean_field("creator"),
            producer=clean_field("producer"),
            page_count=len(doc),
            file_size_bytes=file_size_bytes,
            is_encrypted=doc.is_encrypted,
            is_corrupted=False
        )
