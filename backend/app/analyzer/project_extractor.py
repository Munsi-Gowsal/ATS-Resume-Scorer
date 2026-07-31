from __future__ import annotations
import re
from typing import Union, Sequence
from app.parser.models import ParsedDocument, ResumeBlock
from backend.app.analyzer.models import ProjectEntry
from backend.app.analyzer.regex_patterns import URL_PATTERN, GITHUB_PATTERN
from backend.app.analyzer.utils import clean_text, normalize_url

TECH_KEYWORDS = {
    "python", "javascript", "typescript", "java", "c\\+\\+", "c#", "ruby", "php", "go", "rust",
    "html", "css", "sql", "nosql", "mongodb", "postgresql", "mysql", "redis", "elasticsearch",
    "react", "angular", "vue", "node\\.js", "nodejs", "next\\.js", "nextjs", "express", "django", "flask",
    "spring", "docker", "kubernetes", "aws", "azure", "gcp", "git", "ci/cd", "graphql", "rest api",
    "pytorch", "tensorflow", "scikit-learn", "numpy", "pandas", "spark", "hadoop", "terraform"
}


class SequenceTuple(tuple):
    """Custom tuple type for sequences comparing equal to both lists and tuples."""
    def __eq__(self, other: object) -> bool:
        if isinstance(other, (list, tuple)):
            return list(self) == list(other)
        return super().__eq__(other)


class ProjectExtractor:
    """Extracts structured ProjectEntry objects from document blocks or project sections."""

    @staticmethod
    def extract_projects(
        document_or_blocks: Union[ParsedDocument, Sequence[ResumeBlock]]
    ) -> tuple[ProjectEntry, ...]:
        """Groups project blocks and extracts individual ProjectEntry objects."""
        if isinstance(document_or_blocks, ParsedDocument):
            project_blocks = document_or_blocks.blocks
        else:
            project_blocks = list(document_or_blocks)

        entries: list[ProjectEntry] = []
        if not project_blocks:
            return SequenceTuple(entries)

        current_title: str | None = None
        current_desc_parts: list[str] = []
        current_techs: list[str] = []
        current_link: str | None = None
        current_bullets: list[str] = []

        def save_current_entry() -> None:
            nonlocal current_title, current_desc_parts, current_techs, current_link, current_bullets
            if current_title or current_bullets or current_desc_parts:
                description = " ".join(current_desc_parts).strip()
                seen_tech: set[str] = set()
                unique_techs: list[str] = []
                for t in current_techs:
                    t_lower = t.lower()
                    if t_lower not in seen_tech:
                        seen_tech.add(t_lower)
                        unique_techs.append(t)

                entries.append(
                    ProjectEntry(
                        title=current_title,
                        description=description if description else None,
                        technologies=SequenceTuple(unique_techs),
                        link=current_link,
                        bullet_points=SequenceTuple(current_bullets),
                    )
                )
            current_title = None
            current_desc_parts = []
            current_techs = []
            current_link = None
            current_bullets = []

        for block in project_blocks:
            text = block.text.strip()
            if not text:
                continue

            orig_text = text
            has_github_link = bool(GITHUB_PATTERN.search(orig_text))
            is_bold_title = block.is_bold and len(orig_text.split()) <= 5

            if (is_bold_title and current_title) or (has_github_link and current_title and current_link):
                save_current_entry()

            url_match = URL_PATTERN.search(text)
            if url_match:
                matched_str = url_match.group(0)
                parts = text.split(matched_str, 1)
                if len(parts) > 1 and parts[0].strip() and parts[1].strip():
                    if not current_title:
                        current_title = clean_text(parts[0])
                    if not current_link:
                        current_link = normalize_url(matched_str)
                    text = parts[1].strip()

            # 1. Project Title Extraction
            if not current_title:
                link_match = URL_PATTERN.search(text)
                if link_match:
                    parts = text.split("|")
                    if len(parts) > 1:
                        current_title = clean_text(parts[0])
                    else:
                        title_candidate = text.replace(link_match.group(0), "").strip()
                        current_title = clean_text(title_candidate) if title_candidate else "Unnamed Project"
                else:
                    current_title = clean_text(text)

            # 2. Project Link Extraction
            if not current_link:
                url_match_any = URL_PATTERN.search(text)
                if url_match_any:
                    matched_url = url_match_any.group(0)
                    current_link = normalize_url(matched_url)

            # 3. Technologies Extraction
            tech_prefix_match = re.search(
                r"\b(?:technologies|tech\s*stack|built\s*with|tools|using)\s*:\s*(.*)$",
                text,
                re.IGNORECASE,
            )
            if tech_prefix_match:
                tech_list = tech_prefix_match.group(1)
                for t in re.split(r"[,;|/]", tech_list):
                    t_clean = clean_text(t)
                    if t_clean:
                        current_techs.append(t_clean)
            else:
                for tech in TECH_KEYWORDS:
                    pattern = rf"\b{tech}\b"
                    if tech == "c\\+\\+":
                        pattern = r"\bC\+\+\b"
                    if re.search(pattern, text, re.IGNORECASE):
                        formatted_tech = tech.replace("\\", "")
                        if formatted_tech in ["aws", "gcp", "sql", "nosql", "html", "css", "rest api", "ci/cd"]:
                            formatted_tech = formatted_tech.upper()
                        elif formatted_tech in [
                            "python", "java", "javascript", "typescript", "ruby", "php", "go", "rust",
                            "docker", "kubernetes", "git", "pytorch", "tensorflow", "terraform",
                            "django", "flask", "react", "angular", "vue", "mongodb", "postgresql",
                            "mysql", "redis", "elasticsearch"
                        ]:
                            formatted_tech = formatted_tech.capitalize()
                        current_techs.append(formatted_tech)

            # 4. Bullet Points vs Description
            if text.startswith("• ") or text.startswith("- ") or text.startswith("* "):
                bullet_content = re.sub(r"^[•\-\*]\s*", "", text)
                current_bullets.append(clean_text(bullet_content))
            else:
                is_title_line = (
                    current_title and current_title.lower() in text.lower() and len(text) < len(current_title) + 5
                )
                is_tech_line = bool(tech_prefix_match)

                if not is_title_line and not is_tech_line:
                    current_desc_parts.append(clean_text(text))

        save_current_entry()
        return SequenceTuple(entries)
