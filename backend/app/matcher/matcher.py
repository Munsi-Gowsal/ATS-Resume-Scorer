from typing import Optional
from backend.app.analyzer.models import Resume
from backend.app.matcher.models import ParsedJobDescription, MatchResult
from backend.app.matcher.skill_matcher import SkillMatcher
from backend.app.matcher.experience_matcher import ExperienceMatcher
from backend.app.matcher.education_matcher import EducationMatcher
from backend.app.matcher.keyword_matcher import KeywordMatcher
from backend.app.matcher.gap_analyzer import GapAnalyzer
from backend.app.matcher.scorer import Scorer


class JobMatcher:
    """Orchestrates deterministic matching between a candidate Resume and a ParsedJobDescription."""

    def __init__(
        self,
        skill_matcher: Optional[SkillMatcher] = None,
        experience_matcher: Optional[ExperienceMatcher] = None,
        education_matcher: Optional[EducationMatcher] = None,
        keyword_matcher: Optional[KeywordMatcher] = None,
        gap_analyzer: Optional[GapAnalyzer] = None,
        scorer: Optional[Scorer] = None,
    ) -> None:
        self.skill_matcher = skill_matcher or SkillMatcher()
        self.experience_matcher = experience_matcher or ExperienceMatcher()
        self.education_matcher = education_matcher or EducationMatcher()
        self.keyword_matcher = keyword_matcher or KeywordMatcher()
        self.gap_analyzer = gap_analyzer or GapAnalyzer()
        self.scorer = scorer or Scorer()

    def match(self, resume: Resume, jd: ParsedJobDescription) -> MatchResult:
        """Executes full matching workflow and builds MatchResult."""
        # 1. Run sub-matchers
        skill_details = self.skill_matcher.match(resume, jd)
        experience_details = self.experience_matcher.match(resume, jd)
        education_details = self.education_matcher.match(resume, jd)
        keyword_details = self.keyword_matcher.match(resume, jd)

        # 2. Calculate overall weighted score
        overall_score = self.scorer.compute_overall_score(
            skill_score=skill_details.score,
            experience_score=experience_details.score,
            education_score=education_details.score,
            keyword_score=keyword_details.score,
        )

        # 3. Analyze gaps and generate recommendations
        strengths, weaknesses, recommendations = self.gap_analyzer.analyze(
            skill_details=skill_details,
            exp_details=experience_details,
            edu_details=education_details,
            kw_details=keyword_details,
        )

        # 4. Construct final MatchResult
        matched_skills = skill_details.required_matched + skill_details.preferred_matched
        missing_skills = skill_details.required_missing + skill_details.preferred_missing

        return MatchResult(
            overall_score=overall_score,
            skill_score=skill_details.score,
            experience_score=experience_details.score,
            education_score=education_details.score,
            keyword_score=keyword_details.score,
            matched_skills=matched_skills,
            missing_skills=missing_skills,
            matched_keywords=keyword_details.matched_keywords,
            missing_keywords=keyword_details.missing_keywords,
            strengths=strengths,
            weaknesses=weaknesses,
            recommendations=recommendations,
            skill_details=skill_details,
            experience_details=experience_details,
            education_details=education_details,
            keyword_details=keyword_details,
        )
