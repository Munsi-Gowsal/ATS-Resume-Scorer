from typing import Optional
from backend.app.analyzer.models import Resume
from backend.app.matcher.models import ParsedJobDescription, EducationMatchDetails
from backend.app.matcher.utils import parse_degree_rank, extract_keywords


class EducationMatcher:
    """Evaluates candidate education background against job description requirements."""

    def match(self, resume: Resume, jd: ParsedJobDescription) -> EducationMatchDetails:
        """Compares degree rank, major / field of study, and institution matching."""
        required_degree = jd.required_degree
        req_rank = parse_degree_rank(required_degree)

        highest_candidate_degree: Optional[str] = None
        highest_candidate_rank = 0
        candidate_majors = []
        candidate_schools = []

        if resume.education:
            for edu in resume.education:
                if edu.degree:
                    rank = parse_degree_rank(edu.degree)
                    if rank > highest_candidate_rank:
                        highest_candidate_rank = rank
                        highest_candidate_degree = edu.degree
                    elif highest_candidate_degree is None:
                        highest_candidate_degree = edu.degree

                if edu.field_of_study:
                    candidate_majors.append(edu.field_of_study)
                if edu.school:
                    candidate_schools.append(edu.school)

        # 1. Degree level match & minimum qualification
        if req_rank == 0:
            degree_matched = True
            meets_minimum = True
        else:
            degree_matched = highest_candidate_rank >= req_rank
            meets_minimum = degree_matched

        # 2. Major / Field of study match
        major_matched = True
        if jd.required_field_of_study:
            major_matched = False
            req_major_kw = extract_keywords(jd.required_field_of_study)
            for c_major in candidate_majors:
                c_major_kw = extract_keywords(c_major)
                if c_major_kw.intersection(req_major_kw):
                    major_matched = True
                    break

        # 3. Institution match (optional enhancement check)
        institution_matched = False

        # 4. Score calculation
        if req_rank == 0 and not jd.required_field_of_study:
            score = 100.0
        else:
            if not meets_minimum:
                # Partial score if candidate has some degree below required
                base_score = (highest_candidate_rank / req_rank) * 60.0 if req_rank > 0 else 50.0
            else:
                base_score = 80.0

            major_bonus = 20.0 if major_matched else 0.0
            score = base_score + major_bonus

        return EducationMatchDetails(
            meets_minimum=meets_minimum,
            degree_matched=degree_matched,
            major_matched=major_matched,
            institution_matched=institution_matched,
            candidate_highest_degree=highest_candidate_degree,
            required_degree=required_degree,
            score=round(min(100.0, max(0.0, score)), 2),
        )
