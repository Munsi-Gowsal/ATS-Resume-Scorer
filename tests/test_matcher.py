import pytest
from backend.app.analyzer.models import (
    Resume,
    EducationEntry,
    ExperienceEntry,
    ProjectEntry,
)
from backend.app.matcher import (
    JobMatcher,
    ParsedJobDescription,
    MatchResult,
    SkillMatcher,
    ExperienceMatcher,
    EducationMatcher,
    KeywordMatcher,
    GapAnalyzer,
    Scorer,
)
from backend.app.matcher.utils import normalize_skill, calculate_experience_years, extract_keywords


def test_skill_normalization_and_aliases():
    assert normalize_skill("Python") == "python"
    assert normalize_skill("python") == "python"
    assert normalize_skill("Node.js") == "nodejs"
    assert normalize_skill("NodeJS") == "nodejs"
    assert normalize_skill("node.js") == "nodejs"
    assert normalize_skill("React.js") == "react"
    assert normalize_skill("React") == "react"
    assert normalize_skill("AWS") == "aws"
    assert normalize_skill("Amazon Web Services") == "aws"


def test_perfect_match():
    resume = Resume(
        name="Jane Doe",
        skills=["Python", "React.js", "AWS", "Docker", "Kubernetes"],
        experience=[
            ExperienceEntry(
                title="Senior Software Engineer",
                company="Tech Corp",
                start_date="Jan 2018",
                end_date="Dec 2023",
                description="Built cloud infrastructure using Python, AWS, Docker, and Kubernetes."
            )
        ],
        education=[
            EducationEntry(
                degree="Master of Science",
                field_of_study="Computer Science",
                school="MIT"
            )
        ],
        summary="Experienced Senior Software Engineer specializing in Python, React, AWS, Docker, Kubernetes."
    )

    jd = ParsedJobDescription(
        title="Senior Software Engineer",
        company="Tech Corp",
        required_skills=["Python", "AWS", "Docker"],
        preferred_skills=["React", "Kubernetes"],
        required_experience_years=5.0,
        required_degree="Master",
        required_field_of_study="Computer Science",
        required_keywords=["Python", "AWS", "Docker", "Kubernetes", "Software"]
    )

    matcher = JobMatcher()
    result = matcher.match(resume, jd)

    assert isinstance(result, MatchResult)
    assert result.overall_score == 100.0
    assert result.skill_score == 100.0
    assert result.experience_score == 100.0
    assert result.education_score == 100.0
    assert result.keyword_score == 100.0
    assert len(result.missing_skills) == 0
    assert len(result.strengths) > 0


def test_partial_match():
    resume = Resume(
        skills=["Python", "NodeJS"],
        experience=[
            ExperienceEntry(
                title="Junior Developer",
                company="Startup Inc",
                start_date="Jan 2022",
                end_date="Dec 2023",
                description="Python backend web development."
            )
        ],
        education=[
            EducationEntry(
                degree="Bachelor of Science",
                field_of_study="Computer Science"
            )
        ],
        summary="Junior web developer skilled in Python and NodeJS."
    )

    jd = ParsedJobDescription(
        title="Senior Backend Engineer",
        required_skills=["Python", "AWS", "Docker", "Kubernetes"],
        preferred_skills=["Node.js", "Redis"],
        required_experience_years=5.0,
        required_degree="Master",
        required_field_of_study="Computer Science"
    )

    matcher = JobMatcher()
    result = matcher.match(resume, jd)

    assert 0.0 < result.overall_score < 100.0
    assert "AWS" in result.missing_skills or "Docker" in result.missing_skills
    assert len(result.weaknesses) > 0
    assert len(result.recommendations) > 0
    assert any("Kubernetes" in rec or "AWS" in rec or "Docker" in rec for rec in result.recommendations)


def test_poor_match():
    resume = Resume(
        skills=["Graphic Design", "Photoshop"],
        experience=[
            ExperienceEntry(
                title="Graphic Designer",
                company="Creative Agency",
                start_date="Jan 2023",
                end_date="Dec 2023"
            )
        ],
        education=[
            EducationEntry(
                degree="High School Diploma",
                field_of_study="Art"
            )
        ]
    )

    jd = ParsedJobDescription(
        title="Principal DevOps Engineer",
        required_skills=["Kubernetes", "Terraform", "AWS", "Python"],
        required_experience_years=10.0,
        required_degree="Bachelor",
        required_field_of_study="Computer Science"
    )

    matcher = JobMatcher()
    result = matcher.match(resume, jd)

    assert result.overall_score < 40.0
    assert len(result.missing_skills) >= 4
    assert len(result.recommendations) > 0


def test_duplicate_skills_deduplication():
    resume = Resume(
        skills=["Python", "python", "PYTHON", "Node.js", "NodeJS", "node.js"],
        projects=[
            ProjectEntry(
                title="Project 1",
                technologies=["AWS", "Amazon Web Services", "aws"]
            )
        ]
    )

    jd = ParsedJobDescription(
        required_skills=["python", "nodejs", "aws"]
    )

    skill_matcher = SkillMatcher()
    details = skill_matcher.match(resume, jd)

    assert len(details.required_matched) == 3
    assert len(details.required_missing) == 0
    assert details.score == 100.0


def test_empty_resume():
    resume = Resume()
    jd = ParsedJobDescription(
        required_skills=["Python", "AWS"],
        required_experience_years=3.0,
        required_degree="Bachelor"
    )

    matcher = JobMatcher()
    result = matcher.match(resume, jd)

    assert isinstance(result, MatchResult)
    assert result.overall_score >= 0.0
    assert len(result.missing_skills) == 2


def test_empty_job_description():
    resume = Resume(
        skills=["Python", "Django"],
        experience=[
            ExperienceEntry(title="Software Engineer", start_date="2020", end_date="2023")
        ]
    )
    jd = ParsedJobDescription()

    matcher = JobMatcher()
    result = matcher.match(resume, jd)

    assert isinstance(result, MatchResult)
    assert result.overall_score == 100.0
    assert result.skill_score == 100.0
    assert result.experience_score == 100.0
    assert result.education_score == 100.0
    assert result.keyword_score == 100.0


def test_unicode_and_special_characters():
    resume = Resume(
        skills=["C++", "C#", "Pythön", "Döcker"],
        summary="Experiência em desenvolvimento de software com C++ e C#."
    )

    jd = ParsedJobDescription(
        title="Desenvolvedor C++ / C#",
        required_skills=["C++", "C#", "Docker"],
        description="Desenvolvimento em C++ e C# com suporte a Döcker."
    )

    matcher = JobMatcher()
    result = matcher.match(resume, jd)

    assert isinstance(result, MatchResult)
    assert result.overall_score > 70.0


def test_large_document():
    # Build large resume with 100 skills and 20 experience entries
    skills = [f"Skill_{i}" for i in range(100)]
    experiences = [
        ExperienceEntry(
            title=f"Engineer {i}",
            company=f"Company {i}",
            start_date="2020",
            end_date="2021",
            description=f"Developed large scale microservices with Skill_{i} and Skill_{i+1}."
        )
        for i in range(20)
    ]

    resume = Resume(
        skills=skills,
        experience=experiences,
        summary="A vast summary containing " + " ".join(skills)
    )

    jd = ParsedJobDescription(
        title="Senior Architect",
        required_skills=[f"Skill_{i}" for i in range(50)],
        preferred_skills=[f"Skill_{i}" for i in range(50, 80)],
        required_experience_years=10.0,
        description="Detailed job specification requesting " + " ".join(skills)
    )

    matcher = JobMatcher()
    result = matcher.match(resume, jd)

    assert isinstance(result, MatchResult)
    assert result.skill_score == 100.0
    assert len(result.matched_skills) == 80


def test_education_matcher_rank_hierarchy():
    resume_phd = Resume(
        education=[EducationEntry(degree="Ph.D. in Physics", field_of_study="Physics")]
    )
    jd_bachelor = ParsedJobDescription(
        required_degree="Bachelor",
        required_field_of_study="Physics"
    )

    edu_matcher = EducationMatcher()
    details = edu_matcher.match(resume_phd, jd_bachelor)

    assert details.meets_minimum is True
    assert details.degree_matched is True
    assert details.score == 100.0


def test_experience_years_calculation():
    exp1 = ExperienceEntry(start_date="Jan 2020", end_date="Dec 2022")  # 3 years
    exp2 = ExperienceEntry(start_date="Jan 2023", end_date="Present")   # > 1 year
    years = calculate_experience_years([exp1, exp2])
    assert years >= 4.0


def test_keyword_extractor():
    text = "The candidate has experience with Python, AWS, and Docker in software development!"
    kw = extract_keywords(text)
    assert "python" in kw
    assert "aws" in kw
    assert "docker" in kw
    assert "the" not in kw
    assert "with" not in kw


def test_gap_analyzer_recommendations():
    skill_matcher = SkillMatcher()
    exp_matcher = ExperienceMatcher()
    edu_matcher = EducationMatcher()
    kw_matcher = KeywordMatcher()
    gap_analyzer = GapAnalyzer()

    resume = Resume(skills=["Python"])
    jd = ParsedJobDescription(
        required_skills=["Python", "Kubernetes", "AWS"],
        preferred_skills=["Docker"]
    )

    s_det = skill_matcher.match(resume, jd)
    exp_det = exp_matcher.match(resume, jd)
    edu_det = edu_matcher.match(resume, jd)
    kw_det = kw_matcher.match(resume, jd)

    strengths, weaknesses, recs = gap_analyzer.analyze(s_det, exp_det, edu_det, kw_det)

    assert any("Kubernetes" in r for r in recs)
    assert any("AWS" in r for r in recs)
    assert any("Docker" in r for r in recs)
