from typing import List, Set
from backend.app.analyzer.models import Resume
from backend.app.matcher.models import ParsedJobDescription, ExperienceMatchDetails
from backend.app.matcher.utils import calculate_experience_years, extract_keywords


class ExperienceMatcher:
    """Evaluates candidate work experience against job description requirements."""

    def match(self, resume: Resume, jd: ParsedJobDescription) -> ExperienceMatchDetails:
        """Compares experience years, job titles, target companies, and recency."""
        available_years = calculate_experience_years(resume.experience or [])
        required_years = jd.required_experience_years or 0.0

        title_matches: List[str] = []
        company_matches: List[str] = []
        recent_experience_matched = False

        # Extract target title keywords
        jd_title_keywords = extract_keywords(jd.title) if jd.title else set()

        if resume.experience:
            # 1. Check title matches and company matches across all experience entries
            for exp in resume.experience:
                if exp.title and jd_title_keywords:
                    exp_title_keywords = extract_keywords(exp.title)
                    if exp_title_keywords.intersection(jd_title_keywords):
                        if exp.title not in title_matches:
                            title_matches.append(exp.title)

                if jd.company and exp.company:
                    if jd.company.lower() in exp.company.lower() or exp.company.lower() in jd.company.lower():
                        if exp.company not in company_matches:
                            company_matches.append(exp.company)

            # 2. Recency check on most recent role (first experience entry)
            most_recent = resume.experience[0]
            if most_recent.title and jd_title_keywords:
                recent_keywords = extract_keywords(most_recent.title)
                if recent_keywords.intersection(jd_title_keywords):
                    recent_experience_matched = True

        # 3. Calculate experience score
        # Base years score (up to 70% weight)
        if required_years <= 0:
            years_score = 100.0
        else:
            ratio = available_years / required_years
            years_score = min(100.0, ratio * 100.0)

        # Title match score (20% weight)
        title_score = 100.0 if title_matches or not jd.title else 40.0

        # Recency score (10% weight)
        recency_score = 100.0 if recent_experience_matched or not jd.title else 50.0

        if required_years <= 0 and not jd.title:
            score = 100.0
        else:
            score = (years_score * 0.70) + (title_score * 0.20) + (recency_score * 0.10)

        return ExperienceMatchDetails(
            required_years=required_years,
            available_years=available_years,
            title_matches=title_matches,
            company_matches=company_matches,
            recent_experience_matched=recent_experience_matched,
            score=round(min(100.0, max(0.0, score)), 2),
        )
