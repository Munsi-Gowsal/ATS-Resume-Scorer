import re
import unicodedata


class DocumentNormalizer:
    """Standardizes document text strings.
    
    Performs encoding normalization, bullet and dash formatting standardization,
    smart quotation correction, and whitespace compaction.
    """

    # Matches various bullet Unicode characters (including Private Use Area bullet fonts)
    BULLET_PATTERN = re.compile(
        r"[\u2022\u00b7\u25e6\u2023\u2043\u25cf\u25cb\u25aa\u25ab\u25aa\u25fc\u25fb\u25fe\u25fd\uf0b7\uf0d8\uf0fc\u2713\u2714]\s*"
    )

    # Matches various dash and hyphen symbols
    DASH_PATTERN = re.compile(r"[\u2010\u2011\u2012\u2013\u2014\u2015\u2212]")

    # Matches smart quotes
    SMART_OPEN_DOUBLE = re.compile(r"[\u201c\u201f\u00ab]")
    SMART_CLOSE_DOUBLE = re.compile(r"[\u201d\u00bb]")
    SMART_OPEN_SINGLE = re.compile(r"[\u2018\u201b\u2039]")
    SMART_CLOSE_SINGLE = re.compile(r"[\u2019\u203a]")

    @classmethod
    def normalize_text(cls, text: str) -> str:
        """Applies normalization heuristics to standardise text structure and characters.
        
        Args:
            text: Raw input string.
            
        Returns:
            A normalized, standardized string.
        """
        if not text:
            return ""

        # 1. Normalize Unicode form (resolves ligatures like 'fi'/'fl' to separate characters)
        text = unicodedata.normalize("NFKC", text)

        # 2. Standardize bullet characters to '• '
        text = cls.BULLET_PATTERN.sub("• ", text)

        # 3. Standardize horizontal dashes to standard ASCII hyphen '-'
        text = cls.DASH_PATTERN.sub("-", text)

        # 4. Standardize curly/smart quote formats
        text = cls.SMART_OPEN_DOUBLE.sub('"', text)
        text = cls.SMART_CLOSE_DOUBLE.sub('"', text)
        text = cls.SMART_OPEN_SINGLE.sub("'", text)
        text = cls.SMART_CLOSE_SINGLE.sub("'", text)

        # 5. Replace non-breaking spaces and zero-width spaces
        text = text.replace("\xa0", " ").replace("\u200b", "")

        # 6. Remove non-printable control characters, keeping newlines/tabs
        text = "".join(ch for ch in text if ord(ch) >= 32 or ch in "\n\t")

        # 7. Compress redundant horizontal whitespace (spaces/tabs) to a single space
        text = re.sub(r"[ \t]+", " ", text)

        # 8. Compress redundant vertical spacing (maximum of 2 consecutive newlines)
        text = re.sub(r"\n{3,}", "\n\n", text)

        return text.strip()

    @classmethod
    def normalize_block_text(cls, block_text: str) -> str:
        """Standardizes textual layout blocks by removing internal line breaks.
        
        Args:
            block_text: Bounding-box contained block text.
            
        Returns:
            A flattened, cleaned single-line string.
        """
        if not block_text:
            return ""

        # Run core normalization
        normalized = cls.normalize_text(block_text)

        # Flatten internal newlines/carriage returns to spaces
        flattened = re.sub(r"[\n\t\r]+", " ", normalized)

        # Compress spaces that were introduced by flattening newlines
        return re.sub(r" {2,}", " ", flattened).strip()
