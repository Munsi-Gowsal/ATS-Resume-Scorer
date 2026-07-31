from typing import List, Set
from backend.app.analyzer.models import Resume
from backend.app.matcher.models import ParsedJobDescription, KeywordMatchDetails
from backend.app.matcher.utils import extract_keywords


class KeywordMatcher:
    """Evaluates keyword overlap between full resume text and job description."""

    def match(self, resume: Resume, jd: ParsedJobDescription) -> KeywordMatchDetails:
        """Extracts and compares keywords, returning overlap details and sub-score."""
        # 1. Build full resume text representation
        resume_parts: List[str] = []
        if resume.summary:
            resume_parts.append(resume.summary)
        if resume.skills:
            resume_parts.extend(resume.skills)
        if resume.experience:
            for exp in resume.experience:
                if exp.title:
                    resume_parts.append(exp.title)
                if exp.description:
                    resume_parts.append(exp.description)
                if exp.bullet_points:
                    resume_parts.extend(exp.bullet_points)
        if resume.projects:
            for proj in resume.projects:
                if proj.title:
                    resume_parts.append(proj.title)
                if proj.description:
                    resume_parts.append(proj.description)
                if proj.bullet_points:
                    resume_parts.extend(proj.bullet_points)

        resume_full_text = " ".join(resume_parts)
        candidate_keywords = extract_keywords(resume_full_text)

        # 2. Build full job description keyword set
        jd_parts: List[str] = []
        if jd.title:
            jd_parts.append(jd.title)
        if jd.description:
            jd_parts.append(jd.description)
        if jd.raw_text:
            jd_parts.append(jd.raw_text)
        if jd.required_keywords:
            jd_parts.extend(jd.required_keywords)

        jd_full_text = " ".join(jd_parts)
        jd_keywords = extract_keywords(jd_full_text)

        # Also explicitly add jd.required_keywords if provided
        if jd.required_keywords:
            for rk in jd.required_keywords:
                jd_keywords.update(extract_keywords(rk))

        if not jd_keywords:
            return KeywordMatchDetails(
                matched_keywords=[],
                missing_keywords=[],
                score=100.0,
            )

        # 3. Intersect and diff
        matched_kw_set = candidate_keywords.intersection(jd_keywords)
        missing_kw_set = jd_keywords - candidate_keywords

        matched_keywords = sorted(list(matched_kw_set))
        missing_keywords = sorted(list(missing_kw_set))

        # 4. Score calculation
        score = (len(matched_keywords) / len(jd_keywords)) * 100.0

        return KeywordMatchDetails(
            matched_keywords=matched_keywords,
            missing_keywords=missing_keywords,
            score=round(min(100.0, max(0.0, score)), 2),
        )
