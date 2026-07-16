from pathlib import Path
from typing import Union, Optional

from app.parser.reader import PDFReader
from app.parser.extractor import TextExtractor
from app.parser.metadata import MetadataExtractor
from app.parser.normalizer import DocumentNormalizer
from app.parser.models import ParsedDocument, ResumeBlock
from app.parser.validators import DocumentValidator


class ResumeParser:
    """Orchestrates the PDF parsing pipeline to extract structured models from native files.
    
    Validates limits, extracts raw layout text and styling attributes, normalizes characters,
    and returns a structured ParsedDocument.
    """

    @classmethod
    def parse(
        cls,
        file_path: Union[str, Path],
        max_bytes: Optional[int] = None,
        max_pages: Optional[int] = None
    ) -> ParsedDocument:
        """Parses a digital native PDF resume.
        
        Args:
            file_path: Filesystem path to the PDF document.
            max_bytes: Optional maximum allowed file size boundary.
            max_pages: Optional maximum allowed pages boundary.
            
        Returns:
            A ParsedDocument object containing document metadata and layout blocks.
            
        Raises:
            PDFNotFoundError: If the path does not exist.
            EmptyPDFError: If the file has 0 bytes.
            InvalidPDFSignatureError: If the file does not have standard %PDF signature.
            EncryptedPDFError: If the file is password encrypted.
            CorruptedPDFError: If the PDF structure is broken.
            MaxFileSizeExceededError: If size exceeds max_bytes.
            MaxPageLimitExceededError: If page count exceeds max_pages.
        """
        # 1. Instantiate reader (implicitly runs basic structural diagnostic checks)
        reader = PDFReader(file_path)

        # 2. Open PDF document under strict validations
        # Set constraints on the reader's validator dynamically before opening
        reader._validator.max_bytes = max_bytes
        reader._validator.max_pages = max_pages

        doc = reader.open_document()
        try:
            # 3. Extract document-level metadata
            metadata = MetadataExtractor.extract(doc)

            # 4. Extract raw layout text and structural block properties
            extractor = TextExtractor(doc)
            raw_blocks = extractor.extract_blocks()
            raw_text = extractor.extract_raw_text()

            # 5. Normalize styling text structures and compile layout blocks
            cleaned_blocks = []
            for block in raw_blocks:
                cleaned_block_text = DocumentNormalizer.normalize_block_text(block.text)

                # Reconstruct block with standardized strings
                cleaned_block = ResumeBlock(
                    text=cleaned_block_text,
                    page_number=block.page_number,
                    x0=block.x0,
                    y0=block.y0,
                    x1=block.x1,
                    y1=block.y1,
                    font_name=block.font_name,
                    font_size=block.font_size,
                    is_bold=block.is_bold,
                    is_italic=block.is_italic
                )

                if cleaned_block.text:
                    cleaned_blocks.append(cleaned_block)

            cleaned_text = DocumentNormalizer.normalize_text(raw_text)

            return ParsedDocument(
                metadata=metadata,
                blocks=cleaned_blocks,
                raw_text=raw_text,
                cleaned_text=cleaned_text
            )

        finally:
            # Ensure native C handles are securely closed
            doc.close()
