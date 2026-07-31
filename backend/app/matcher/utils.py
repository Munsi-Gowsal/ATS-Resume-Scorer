import re
from datetime import datetime
from typing import List, Set, Optional, Dict, Tuple
from backend.app.analyzer.models import ExperienceEntry, EducationEntry


# Canonical Skill Aliases (mapped to canonical lower-case key)
SKILL_ALIASES: Dict[str, str] = {
    "node.js": "nodejs",
    "nodejs": "nodejs",
    "node js": "nodejs",
    "node": "nodejs",
    "react.js": "react",
    "reactjs": "react",
    "react js": "react",
    "react": "react",
    "aws": "aws",
    "amazon web services": "aws",
    "amazon web service": "aws",
    "gcp": "gcp",
    "google cloud": "gcp",
    "google cloud platform": "gcp",
    "azure": "azure",
    "microsoft azure": "azure",
    "kubernetes": "kubernetes",
    "k8s": "kubernetes",
    "docker": "docker",
    "python": "python",
    "python3": "python",
    "javascript": "javascript",
    "js": "javascript",
    "typescript": "typescript",
    "ts": "typescript",
    "golang": "go",
    "go": "go",
    "postgres": "postgresql",
    "postgresql": "postgresql",
    "mongo": "mongodb",
    "mongodb": "mongodb",
}

# Standard English Stop Words
STOP_WORDS: Set[str] = {
    "a", "about", "above", "after", "again", "against", "all", "am", "an", "and",
    "any", "are", "aren't", "as", "at", "be", "because", "been", "before", "being",
    "below", "between", "both", "but", "by", "can", "can't", "cannot", "could",
    "did", "didn't", "do", "does", "doesn't", "doing", "don't", "down", "during",
    "each", "few", "for", "from", "further", "had", "hadn't", "has", "hasn't",
    "have", "haven't", "having", "he", "he'd", "he'll", "he's", "her", "here",
    "here's", "hers", "herself", "him", "himself", "his", "how", "how's", "i",
    "i'd", "i'll", "i'm", "i've", "if", "in", "into", "is", "isn't", "it", "it's",
    "its", "itself", "let's", "me", "more", "most", "mustn't", "my", "myself",
    "no", "nor", "not", "of", "off", "on", "once", "only", "or", "other", "ought",
    "our", "ours", "ourselves", "out", "over", "own", "same", "shan't", "she",
    "she'd", "she'll", "she's", "should", "shouldn't", "so", "some", "such",
    "than", "that", "that's", "the", "their", "theirs", "them", "themselves",
    "then", "there", "there's", "these", "they", "they'd", "they'll", "they're",
    "they've", "this", "those", "through", "to", "too", "under", "until", "up",
    "very", "was", "wasn't", "we", "we'd", "we'll", "we're", "we've", "were",
    "weren't", "what", "what's", "when", "when's", "where", "where's", "which",
    "while", "who", "who's", "whom", "why", "why's", "with", "won't", "would",
    "wouldn't", "you", "you'd", "you'll", "you're", "you've", "your", "yours",
    "yourself", "yourselves", "work", "worked", "working", "experience", "year",
    "years", "role", "team", "project", "projects", "company", "candidate", "resume",
    "job", "description", "required", "preferred", "responsibilities", "requirements"
}


# Degree level mapping
DEGREE_HIERARCHY: Dict[str, int] = {
    "phd": 5,
    "doctorate": 5,
    "ph.d.": 5,
    "doctor of philosophy": 5,
    "master": 4,
    "masters": 4,
    "ms": 4,
    "m.s.": 4,
    "ma": 4,
    "m.a.": 4,
    "m.tech": 4,
    "mtech": 4,
    "mba": 4,
    "graduate": 4,
    "bachelor": 3,
    "bachelors": 3,
    "bs": 3,
    "b.s.": 3,
    "ba": 3,
    "b.a.": 3,
    "b.tech": 3,
    "btech": 3,
    "undergraduate": 3,
    "associate": 2,
    "associates": 2,
    "as": 2,
    "a.s.": 2,
    "high school": 1,
    "diploma": 1,
    "ged": 1,
}


def normalize_skill(skill: str) -> str:
    """Normalizes skill strings to a canonical lower-case key for comparison."""
    if not skill:
        return ""
    clean = skill.strip().lower()
    if clean in SKILL_ALIASES:
        return SKILL_ALIASES[clean]
    # General normalization: strip version numbers or dots if appropriate
    # e.g., python3.9 -> python, reactjs -> react
    clean_no_punct = re.sub(r'[\.\-\_\s]+', '', clean)
    if clean_no_punct in SKILL_ALIASES:
        return SKILL_ALIASES[clean_no_punct]
    return clean


def parse_degree_rank(degree: Optional[str]) -> int:
    """Parses a degree string and returns its hierarchy rank (1-5). Returns 0 if unknown."""
    if not degree:
        return 0
    d_lower = degree.lower()
    for key, rank in DEGREE_HIERARCHY.items():
        if key in d_lower:
            return rank
    return 0


def _parse_year_month(date_str: str) -> Optional[Tuple[int, int]]:
    """Attempts to parse year and month from a date string."""
    if not date_str:
        return None
    d_clean = date_str.strip().lower()
    if "present" in d_clean or "current" in d_clean or "now" in d_clean:
        now = datetime.now()
        return now.year, now.month

    # Try 4-digit year pattern
    year_match = re.search(r'\b(19\d\d|20\d\d)\b', date_str)
    if not year_match:
        return None
    year = int(year_match.group(1))

    # Try month extraction
    month = 1
    month_names = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"]
    for idx, m_name in enumerate(month_names, 1):
        if m_name in d_clean:
            month = idx
            break

    return year, month


def calculate_experience_years(experiences: List[ExperienceEntry]) -> float:
    """Calculates cumulative years of experience from experience entries."""
    if not experiences:
        return 0.0

    total_months = 0.0
    for exp in experiences:
        start = exp.start_date
        end = exp.end_date or "Present"

        start_ym = _parse_year_month(start) if start else None
        end_ym = _parse_year_month(end) if end else None

        if start_ym and end_ym:
            s_year, s_month = start_ym
            e_year, e_month = end_ym
            diff = (e_year - s_year) * 12 + (e_month - s_month)
            if diff > 0:
                total_months += diff
            else:
                total_months += 6.0  # default minimum 6 months if dates match
        elif start_ym:
            total_months += 12.0  # estimate 1 year if only start date present
        else:
            # If no dates available but bullet points or description present, assign 1 year default per entry
            if exp.title or exp.company or exp.description or exp.bullet_points:
                total_months += 12.0

    return round(total_months / 12.0, 1)


def extract_keywords(text: Optional[str]) -> Set[str]:
    """Extracts normalized keyword tokens from text, ignoring stop words and short numbers."""
    if not text:
        return set()

    # Tokenize words, allowing hyphens and pluses (e.g. c++, c#, ci/cd)
    tokens = re.findall(r'\b[a-zA-Z0-9+#.-]{2,}\b', text.lower())
    keywords: Set[str] = set()

    for token in tokens:
        token_clean = token.strip(".-_")
        if not token_clean:
            continue
        if token_clean in STOP_WORDS:
            continue
        if token_clean.isdigit():
            continue
        keywords.add(token_clean)

    return keywords
