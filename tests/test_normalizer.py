import pytest
from app.parser.normalizer import DocumentNormalizer


def test_unicode_normalization():
    # Test normalization of ligatures (fi, fl) and non-breaking spaces
    raw = "fi\u00a0fl"  # 'fi' ligature with non-breaking space and 'fl'
    normalized = DocumentNormalizer.normalize_text(raw)
    assert normalized == "fi fl"


def test_dash_standardization():
    # Test en-dash, em-dash, and unicode minus sign are standardized to standard hyphen
    raw = "2020\u20132024 \u2014 experience \u2212 5 years"
    normalized = DocumentNormalizer.normalize_text(raw)
    assert normalized == "2020-2024 - experience - 5 years"


def test_bullet_standardization():
    # Test various bullet marks are converted to standard bullet character
    raw_bullets = [
        "\u2022 Skill A",  # standard bullet
        "\u25cf Skill B",  # black circle
        "\uf0b7 Skill C",  # wingdings bullet
        "\u2713 Skill D",  # check mark
    ]
    for bullet_str in raw_bullets:
        normalized = DocumentNormalizer.normalize_text(bullet_str)
        assert normalized.startswith("• ")


def test_smart_quotes():
    # Test smart quotes normalization
    raw = "\u201cHello\u201d \u2018World\u2019"
    normalized = DocumentNormalizer.normalize_text(raw)
    assert normalized == '"Hello" \'World\''


def test_whitespace_compaction():
    # Test removal of duplicate horizontal space and vertical space
    raw = "Line 1   with   spaces\n\n\n\nLine 2"
    normalized = DocumentNormalizer.normalize_text(raw)
    assert normalized == "Line 1 with spaces\n\nLine 2"


def test_normalize_block_text():
    # Test flattening of newlines inside a bounding box text block
    raw = "Python\nDeveloper\n\twith SQL experience"
    normalized = DocumentNormalizer.normalize_block_text(raw)
    assert normalized == "Python Developer with SQL experience"
