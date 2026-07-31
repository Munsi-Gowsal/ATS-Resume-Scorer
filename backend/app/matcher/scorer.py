class Scorer:
    """Calculates weighted overall score from component match scores."""

    SKILL_WEIGHT: float = 0.40
    EXPERIENCE_WEIGHT: float = 0.30
    EDUCATION_WEIGHT: float = 0.15
    KEYWORD_WEIGHT: float = 0.15

    def compute_overall_score(
        self,
        skill_score: float,
        experience_score: float,
        education_score: float,
        keyword_score: float,
    ) -> float:
        """Calculates 0-100 overall weighted score."""
        overall = (
            (skill_score * self.SKILL_WEIGHT)
            + (experience_score * self.EXPERIENCE_WEIGHT)
            + (education_score * self.EDUCATION_WEIGHT)
            + (keyword_score * self.KEYWORD_WEIGHT)
        )
        return round(min(100.0, max(0.0, overall)), 2)
