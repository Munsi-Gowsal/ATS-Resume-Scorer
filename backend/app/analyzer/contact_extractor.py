import re
from typing import List, Optional, Tuple
from app.parser.models import ResumeBlock, ParsedDocument
from backend.app.analyzer.regex_patterns import (
    EMAIL_PATTERN,
    PHONE_PATTERN,
    LINKEDIN_PATTERN,
    GITHUB_PATTERN,
    URL_PATTERN,
    LOCATION_PATTERN,
)
from backend.app.analyzer.utils import clean_text

class ContactExtractor:
    """Extracts contact details and candidate name from a resume."""

    @staticmethod
    def extract_name(blocks: List[ResumeBlock]) -> Optional[str]:
        """Heuristic-based name extractor.
        
        Scans the top blocks of page 1 to find the candidate's name by looking 
        for the most prominent text (largest font size, bold) that doesn't contain 
        contact info or headings.
        """
        # Focus on the first page, and only the first 10 blocks (where names typically reside)
        p1_blocks = [b for b in blocks if b.page_number == 1][:10]
        if not p1_blocks:
            return None

        candidates: List[Tuple[ResumeBlock, float, bool]] = []
        
        # Blacklist keywords that cannot be names
        blacklist = {
            "resume", "curriculum", "vitae", "cv", "portfolio", "page",
            "education", "experience", "skills", "projects", "contact",
            "summary", "about", "profile", "engineer", "developer", "analyst"
        }

        for block in p1_blocks:
            text = block.text.strip()
            if not text:
                continue

            # Skip blocks containing contact information
            if EMAIL_PATTERN.search(text) or PHONE_PATTERN.search(text):
                continue
            if LINKEDIN_PATTERN.search(text) or GITHUB_PATTERN.search(text):
                continue
            
            # Skip blocks that match blacklist keywords
            text_lower = text.lower()
            if any(word in text_lower for word in blacklist):
                continue
            
            # Words count check (names are usually 2 to 4 words)
            words = text.split()
            if len(words) < 2 or len(words) > 4:
                continue
                
            # Must contain alphabetical characters and start with uppercase
            if not all(w[0].isupper() or w[0] in "'\"-" for w in words if w):
                continue
            if any(c.isdigit() for c in text):
                continue

            candidates.append((block, block.font_size, block.is_bold))

        if candidates:
            # Sort by font size descending, then by bold status descending
            candidates.sort(key=lambda item: (-item[1], -item[2]))
            return clean_text(candidates[0][0].text)

        # Fallback: take the first block on page 1 that isn't contact info and has >= 2 words
        for block in p1_blocks:
            text = block.text.strip()
            if not text:
                continue
            if EMAIL_PATTERN.search(text) or PHONE_PATTERN.search(text):
                continue
            if LINKEDIN_PATTERN.search(text) or GITHUB_PATTERN.search(text):
                continue
            words = text.split()
            if len(words) >= 2 and len(words) <= 5 and not any(c.isdigit() for c in text):
                return clean_text(text)

        return None

    @staticmethod
    def extract_emails(text: str) -> List[str]:
        """Finds all email addresses and returns them deduplicated in order."""
        emails = EMAIL_PATTERN.findall(text)
        seen = set()
        unique_emails = []
        for email in emails:
            email_lower = email.lower().strip()
            if email_lower not in seen:
                seen.add(email_lower)
                unique_emails.append(email)
        return unique_emails

    @staticmethod
    def extract_phones(text: str) -> List[str]:
        """Finds all phone numbers and returns them deduplicated in order."""
        phones = PHONE_PATTERN.findall(text)
        seen = set()
        unique_phones = []
        for phone in phones:
            # Clean and normalize phone number representation (remove spaces, dots, dashes for comparison)
            normalized = re.sub(r"\D", "", phone)
            # Skip if too short (e.g. less than 7 digits)
            if len(normalized) < 7:
                continue
            if normalized not in seen:
                seen.add(normalized)
                unique_phones.append(clean_text(phone))
        return unique_phones

    @staticmethod
    def extract_linkedin_urls(text: str) -> List[str]:
        """Extracts LinkedIn profile URLs."""
        matches = LINKEDIN_PATTERN.findall(text)
        seen = set()
        urls = []
        for username in matches:
            username_clean = username.lower().strip()
            if username_clean not in seen:
                seen.add(username_clean)
                urls.append(f"https://www.linkedin.com/in/{username}")
        return urls

    @staticmethod
    def extract_github_urls(text: str) -> List[str]:
        """Extracts GitHub profile URLs."""
        matches = GITHUB_PATTERN.findall(text)
        seen = set()
        urls = []
        for username in matches:
            username_clean = username.lower().strip()
            if username_clean not in seen:
                seen.add(username_clean)
                urls.append(f"https://github.com/{username}")
        return urls

    @staticmethod
    def extract_portfolio_urls(text: str) -> List[str]:
        """Extracts other portfolio/personal website links.
        
        Excludes emails, LinkedIn, GitHub, and common email/social domains.
        """
        # Strip emails first to avoid matching email domains or user names as URLs
        text_without_emails = EMAIL_PATTERN.sub(" ", text)
        matches = URL_PATTERN.findall(text_without_emails)
        
        # Blacklisted domains to avoid extracting email providers or common sites as portfolios
        blacklist_domains = {
            "gmail.com", "yahoo.com", "hotmail.com", "outlook.com", "icloud.com",
            "linkedin.com", "github.com", "google.com", "facebook.com", 
            "twitter.com", "x.com", "instagram.com", "youtube.com"
        }

        seen = set()
        urls = []
        for domain in matches:
            domain_lower = domain.lower().strip()
            
            # Check if domain or its parent domain is blacklisted
            is_blacklisted = False
            for blacklisted in blacklist_domains:
                if domain_lower == blacklisted or domain_lower.endswith("." + blacklisted):
                    is_blacklisted = True
                    break
            
            if not is_blacklisted and domain_lower not in seen:
                seen.add(domain_lower)
                # Reconstruct full URL if matches found in raw text
                # We can search for the full URL segment in the original text
                url_match = re.search(rf"(https?://\S*{re.escape(domain)}\S*)", text, re.IGNORECASE)
                if url_match:
                    full_url = url_match.group(1).rstrip(".,;:")
                    urls.append(full_url)
                else:
                    urls.append(f"https://{domain}")
        return urls

    @staticmethod
    def extract_location(contact_blocks: List[ResumeBlock]) -> Optional[str]:
        """Finds candidate location (City, State/Country) from contact blocks."""
        for block in contact_blocks:
            match = LOCATION_PATTERN.search(block.text)
            if match:
                # Returns e.g. "San Francisco, CA"
                return clean_text(match.group(0))
        return None
