from typing import List, Tuple
from backend.app.matcher.models import (
    SkillMatchDetails,
    ExperienceMatchDetails,
    EducationMatchDetails,
    KeywordMatchDetails,
)


class GapAnalyzer:
    """Performs deterministic gap analysis and generates strengths, weaknesses, and recommendations."""

    def analyze(
        self,
        skill_details: SkillMatchDetails,
        exp_details: ExperienceMatchDetails,
        edu_details: EducationMatchDetails,
        kw_details: KeywordMatchDetails,
    ) -> Tuple[List[str], List[str], List[str]]:
        """Analyzes sub-matcher details to return (strengths, weaknesses, recommendations)."""
        strengths: List[str] = []
        weaknesses: List[str] = []
        recommendations: List[str] = []

        # 1. Skill Gap Analysis
        if skill_details.required_matched:
            matched_str = ", ".join(skill_details.required_matched[:5])
            strengths.append(f"Matches required skills: {matched_str}.")

        if skill_details.required_missing:
            missing_str = ", ".join(skill_details.required_missing[:5])
            weaknesses.append(f"Missing required skills: {missing_str}.")
            for skill in skill_details.required_missing[:3]:
                recommendations.append(f"Add {skill} experience.")

        if skill_details.preferred_missing:
            for skill in skill_details.preferred_missing[:2]:
                if f"Add {skill} experience." not in recommendations:
                    recommendations.append(f"Include {skill} certification or projects.")

        # 2. Experience Gap Analysis
        if exp_details.available_years >= exp_details.required_years and exp_details.required_years > 0:
            strengths.append(
                f"Meets or exceeds experience requirement "
                f"({exp_details.available_years} years available vs {exp_details.required_years} years required)."
            )
        elif exp_details.required_years > 0:
            diff = round(exp_details.required_years - exp_details.available_years, 1)
            weaknesses.append(
                f"Experience gap of {diff} years "
                f"({exp_details.available_years} years available vs {exp_details.required_years} years required)."
            )
            recommendations.append(
                f"Highlight leadership or key project roles to offset the {diff} year experience gap."
            )

        if exp_details.recent_experience_matched:
            strengths.append("Recent work experience directly matches target role.")
        elif exp_details.title_matches:
            weaknesses.append("Recent role title does not directly match target role.")

        # 3. Education Gap Analysis
        if edu_details.meets_minimum and edu_details.required_degree:
            strengths.append(f"Meets education requirement ({edu_details.candidate_highest_degree}).")
        elif edu_details.required_degree and not edu_details.meets_minimum:
            weaknesses.append(
                f"Does not meet minimum education requirement "
                f"(Requires {edu_details.required_degree}, candidate has {edu_details.candidate_highest_degree or 'none'})."
            )
            recommendations.append(
                f"Mention equivalent professional certifications or relevant coursework for {edu_details.required_degree}."
            )

        if not edu_details.major_matched and edu_details.required_degree:
            weaknesses.append("Degree field of study does not match target requirement.")

        # 4. Keyword Gap Analysis
        if kw_details.missing_keywords:
            top_missing_kw = kw_details.missing_keywords[:3]
            kw_str = ", ".join(top_missing_kw)
            weaknesses.append(f"Missing key job keywords: {kw_str}.")
            for kw in top_missing_kw:
                rec = f"Mention {kw.capitalize()} in project bullet points."
                if rec not in recommendations:
                    recommendations.append(rec)

        # Default fallback strength if empty
        if not strengths:
            strengths.append("Candidate document successfully analyzed.")

        return strengths, weaknesses, recommendations
