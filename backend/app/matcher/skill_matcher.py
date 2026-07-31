from typing import List, Set, Dict
from backend.app.analyzer.models import Resume
from backend.app.matcher.models import ParsedJobDescription, SkillMatchDetails
from backend.app.matcher.utils import normalize_skill


class SkillMatcher:
    """Evaluates candidate skills against job description required and preferred skills."""

    def match(self, resume: Resume, jd: ParsedJobDescription) -> SkillMatchDetails:
        """Compares skills between Resume and ParsedJobDescription."""
        # 1. Collect and normalize candidate skills from resume.skills and project technologies
        candidate_skills_raw: List[str] = list(resume.skills or [])
        if resume.projects:
            for proj in resume.projects:
                if proj.technologies:
                    candidate_skills_raw.extend(proj.technologies)

        # Map normalized key -> display name (retaining first clean representation)
        candidate_skills_map: Dict[str, str] = {}
        for skill in candidate_skills_raw:
            norm = normalize_skill(skill)
            if norm and norm not in candidate_skills_map:
                candidate_skills_map[norm] = skill.strip()

        candidate_norms: Set[str] = set(candidate_skills_map.keys())

        # 2. Normalize required and preferred JD skills
        req_skills_map: Dict[str, str] = {}
        for s in jd.required_skills:
            norm = normalize_skill(s)
            if norm and norm not in req_skills_map:
                req_skills_map[norm] = s.strip()

        pref_skills_map: Dict[str, str] = {}
        for s in jd.preferred_skills:
            norm = normalize_skill(s)
            if norm and norm not in pref_skills_map:
                pref_skills_map[norm] = s.strip()

        # 3. Categorize matched, missing, extra
        required_matched_norms = candidate_norms.intersection(set(req_skills_map.keys()))
        required_missing_norms = set(req_skills_map.keys()) - candidate_norms

        preferred_matched_norms = candidate_norms.intersection(set(pref_skills_map.keys()))
        preferred_missing_norms = set(pref_skills_map.keys()) - candidate_norms

        all_jd_skill_norms = set(req_skills_map.keys()).union(set(pref_skills_map.keys()))
        extra_norms = candidate_norms - all_jd_skill_norms

        # Display names
        required_matched = [req_skills_map[n] for n in sorted(required_matched_norms)]
        required_missing = [req_skills_map[n] for n in sorted(required_missing_norms)]
        preferred_matched = [pref_skills_map[n] for n in sorted(preferred_matched_norms)]
        preferred_missing = [pref_skills_map[n] for n in sorted(preferred_missing_norms)]
        extra_skills = [candidate_skills_map[n] for n in sorted(extra_norms)]

        # 4. Score calculation
        total_req = len(req_skills_map)
        total_pref = len(pref_skills_map)

        if total_req == 0 and total_pref == 0:
            score = 100.0
        elif total_pref == 0:
            req_ratio = len(required_matched) / total_req
            score = req_ratio * 100.0
        elif total_req == 0:
            pref_ratio = len(preferred_matched) / total_pref
            score = pref_ratio * 100.0
        else:
            req_ratio = len(required_matched) / total_req
            pref_ratio = len(preferred_matched) / total_pref
            # Weighted: 75% required, 25% preferred
            score = (req_ratio * 0.75 + pref_ratio * 0.25) * 100.0

        return SkillMatchDetails(
            required_matched=required_matched,
            required_missing=required_missing,
            preferred_matched=preferred_matched,
            preferred_missing=preferred_missing,
            extra_skills=extra_skills,
            score=round(score, 2),
        )
