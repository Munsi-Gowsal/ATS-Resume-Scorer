import re

# Email Pattern
EMAIL_PATTERN = re.compile(
    r"[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+"
)
EMAIL_REGEX = EMAIL_PATTERN

# Phone Pattern (International and local formats)
PHONE_PATTERN = re.compile(
    r"(?:\+?\d{1,4}[-.\s]*)?\(?\d{3}\)?[-.\s]*\d{3}[-.\s]*\d{4}"
    r"|(?:\+?\d{1,3}[-.\s]*)?\d{5}[-.\s]*\d{5}"
)
PHONE_REGEX = PHONE_PATTERN

# LinkedIn Pattern
LINKEDIN_PATTERN = re.compile(
    r"(?:https?://)?(?:www\.)?linkedin\.com/in/([a-zA-Z0-9-_]+)",
    re.IGNORECASE,
)
LINKEDIN_REGEX = LINKEDIN_PATTERN

# GitHub Pattern
GITHUB_PATTERN = re.compile(
    r"(?:https?://)?(?:www\.)?github\.com/([a-zA-Z0-9-_]+)",
    re.IGNORECASE,
)
GITHUB_REGEX = GITHUB_PATTERN

# General URL Pattern
URL_PATTERN = re.compile(
    r"(?:https?://)?(?:www\.)?([a-zA-Z0-9-]+\.[a-zA-Z]{2,})(?:/[a-zA-Z0-9-_./~%#?&=+]*)?",
    re.IGNORECASE,
)
URLS_PATTERN = URL_PATTERN
URL_REGEX = URL_PATTERN

# Portfolio Link Pattern
PORTFOLIO_PATTERN = re.compile(
    r"(?:https?://)?(?:www\.)?(?:[a-zA-Z0-9-_]+\.)?(?:portfolio|behance|dribbble|github\.io|gitlab\.io|me|dev|design|io|com)(?:/[a-zA-Z0-9-_./~%#?&=+]*)?",
    re.IGNORECASE,
)
PORTFOLIO_REGEX = PORTFOLIO_PATTERN

# Location Pattern
LOCATION_PATTERN = re.compile(
    r"\b(\w[\w\s]{1,20}),\s*([A-Z]{2}|\w[\w\s]{2,20})\b"
)

# Section Headings Patterns
HEADING_PATTERN = re.compile(
    r"^(?:summary|profile|objective|about\s*me|experience|work\s*experience|employment|education|academic|skills|competencies|projects|certifications|licenses|languages)\b",
    re.IGNORECASE,
)
HEADINGS_PATTERN = HEADING_PATTERN

SECTION_PATTERNS = {
    "summary": re.compile(
        r"^(?:summary|profile|objective|about\s*me|executive\s*summary|professional\s*summary|professional\s*profile)$",
        re.IGNORECASE,
    ),
    "experience": re.compile(
        r"^(?:experience|work\s*experience|professional\s*experience|employment\s*history|work\s*history|career\s*history|professional\s*background)$",
        re.IGNORECASE,
    ),
    "education": re.compile(
        r"^(?:education|academic\s*background|academic\s*history|qualifications|academic\s*qualifications)$",
        re.IGNORECASE,
    ),
    "skills": re.compile(
        r"^(?:skills|core\s*competencies|technical\s*skills|expertise|areas\s*of\s*expertise|skills\s*&\s*expertise|technologies)$",
        re.IGNORECASE,
    ),
    "projects": re.compile(
        r"^(?:projects|personal\s*projects|academic\s*projects|key\s*projects)$",
        re.IGNORECASE,
    ),
    "certifications": re.compile(
        r"^(?:certifications|licenses|certificates|professional\s*certifications|courses)$",
        re.IGNORECASE,
    ),
    "languages": re.compile(
        r"^(?:languages|language\s*proficiency|languages\s*spoken)$",
        re.IGNORECASE,
    ),
}

# Date and Year Patterns
MONTH_PART = r"(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?|0?[1-9]|1[0-2])"
YEAR_PART = r"(?:19|20)\d{2}"
PRESENT_PART = r"(?:present|current|now|active)"

YEAR_PATTERN = re.compile(r"\b(?:19|20)\d{2}\b")
YEARS_PATTERN = YEAR_PATTERN

DATE_PATTERN = re.compile(
    rf"\b(?:{MONTH_PART}[-/\s,]+)?({YEAR_PART})\b|\b{PRESENT_PART}\b",
    re.IGNORECASE,
)
DATES_PATTERN = DATE_PATTERN

DATE_RANGE_PATTERN = re.compile(
    rf"\b({MONTH_PART}[-/\s,]+)?({YEAR_PART})\s*[-–—to\s]+\s*(?:({MONTH_PART}[-/\s,]+)?({YEAR_PART})|({PRESENT_PART}))\b",
    re.IGNORECASE,
)

# Bullet Points Pattern
BULLET_PATTERN = re.compile(r"^[\s•*–—\-◦▪▸►]+\s*")
BULLETS_PATTERN = BULLET_PATTERN

# Whitespace Pattern
WHITESPACE_PATTERN = re.compile(r"\s+")
WHITESPACE_REGEX = WHITESPACE_PATTERN

# Education Specifics
DEGREE_PATTERN = re.compile(
    r"\b(B\.?[S|A]\.?|M\.?[S|A]\.?|Ph\.?D\.?|M\.?B\.?A\.?|Bachelor(?:s)?|Master(?:s)?|Doctor(?:ate)?|Associate(?:s)?)\b",
    re.IGNORECASE,
)

GPA_PATTERN = re.compile(
    r"\bgpa\s*[:\-]?\s*([0-4]\.\d{1,2})(?:\s*/\s*[0-4]\.\d{1,2})?\b",
    re.IGNORECASE,
)

SCHOOL_KEYWORDS = re.compile(
    r"\b(?:university|college|institute|polytechnic|academy|school)\b",
    re.IGNORECASE,
)

# Experience Specifics
COMPANY_SUFFIX_PATTERN = re.compile(
    r"\b(?:Inc\.?|L\.?L\.?C\.?|Corp\.?|Corporation|Ltd\.?|Limited|Co\.?|Company|S\.?A\.?|Pvt\.?|Private|Group|Systems|Solutions)\b",
    re.IGNORECASE,
)

JOB_TITLE_KEYWORDS = re.compile(
    r"\b(?:software\s*engineer|developer|programmer|architect|manager|lead|analyst|consultant|intern|specialist|administrator|director|vice\s*president|vp|engineer)\b",
    re.IGNORECASE,
)

# Language Proficiency Matcher
PROFICIENCY_PATTERN = re.compile(
    r"\b(native|fluent|bilingual|conversational|intermediate|elementary|advanced|professional|full\s*professional|limited\s*working|c1|c2|b1|b2|a1|a2)\b",
    re.IGNORECASE,
)
