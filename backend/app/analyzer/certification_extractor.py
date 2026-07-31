from __future__ import annotations
import re
from typing import Union, Sequence
from app.parser.models import ParsedDocument, ResumeBlock
from backend.app.analyzer.models import CertificationEntry
from backend.app.analyzer.regex_patterns import URL_PATTERN
from backend.app.analyzer.utils import extract_dates, clean_text, normalize_url

ISSUER_KEYWORDS = {
    "amazon", "google", "microsoft", "cisco", "oracle", "scrum alliance",
    "coursera", "udemy", "red hat", "comptia", "salesforce", "pmi", "pmp"
}


class CertificationTuple(tuple):
    """Custom tuple type for CertificationEntry sequences comparing equal to both lists and tuples."""
    def __eq__(self, other: object) -> bool:
        if isinstance(other, (list, tuple)):
            return list(self) == list(other)
        return super().__eq__(other)


class CertificationExtractor:
    """Extracts structured CertificationEntry objects from document blocks or certification sections."""

    @staticmethod
    def extract_certifications(
        document_or_blocks: Union[ParsedDocument, Sequence[ResumeBlock]]
    ) -> tuple[CertificationEntry, ...]:
        """Parses certification blocks and maps them to a tuple of CertificationEntry dataclasses."""
        if isinstance(document_or_blocks, ParsedDocument):
            certification_blocks = document_or_blocks.blocks
        else:
            certification_blocks = list(document_or_blocks)

        entries: list[CertificationEntry] = []
        if not certification_blocks:
            return CertificationTuple(entries)

        for block in certification_blocks:
            text = block.text.strip()
            if not text:
                continue

            text = re.sub(r"^[•\-\*]\s*", "", text).strip()

            # 1. Extract Verification Link
            link: str | None = None
            url_match = URL_PATTERN.search(text)
            if url_match:
                full_url_match = re.search(
                    rf"(https?://\S*{re.escape(url_match.group(1))}\S*)", text, re.IGNORECASE
                )
                raw_url = (
                    full_url_match.group(1).rstrip(".,;:")
                    if full_url_match
                    else url_match.group(0)
                )
                link = normalize_url(raw_url)
                text = text.replace(url_match.group(0), "").strip()

            # 2. Extract Date
            start, end = extract_dates(text)
            date_str = start or end
            if date_str:
                date_match = re.search(
                    r"\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s*\d{4}\b|\b\d{4}\b",
                    text,
                    re.IGNORECASE,
                )
                if date_match:
                    text = text.replace(date_match.group(0), "").strip()

            # 3. Extract Certification Name and Issuing Organization
            name: str | None = None
            issuing_org: str | None = None

            parts = re.split(r"\s+[-–—]\s+|,", text)
            parts = [clean_text(p) for p in parts if clean_text(p)]

            if len(parts) >= 2:
                name = parts[0]
                issuing_org = parts[1]

                name_lower = name.lower()
                org_lower = issuing_org.lower()

                is_name_issuer = any(kw in name_lower for kw in ISSUER_KEYWORDS)
                is_org_issuer = any(kw in org_lower for kw in ISSUER_KEYWORDS)

                if is_name_issuer and not is_org_issuer:
                    name, issuing_org = issuing_org, name
            elif len(parts) == 1:
                name = parts[0]
                name_lower = name.lower()
                for issuer in ISSUER_KEYWORDS:
                    if issuer in name_lower:
                        if issuer == "amazon":
                            issuing_org = "Amazon Web Services"
                        elif issuer == "pmi":
                            issuing_org = "Project Management Institute"
                        else:
                            issuing_org = issuer.title()
                        break

            if name:
                name = re.sub(r"\s+[-–—|]\s*$", "", name).strip()
            if issuing_org:
                issuing_org = re.sub(r"^\s*[-–—|]\s+", "", issuing_org).strip()

            if name:
                entries.append(
                    CertificationEntry(
                        name=name,
                        issuing_organization=issuing_org,
                        date=date_str,
                        link=link,
                    )
                )

        return CertificationTuple(entries)
