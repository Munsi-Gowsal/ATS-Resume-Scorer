# ADR 002: Modular Clean Architecture for PDF Parser

## Context and Problem Statement
PDF parsing is a multi-step pipeline involving validation, reading raw bytes, extracting layout structures, cleaning texts, and formatting them into standard data transfer objects (DTOs). Packing all of these concerns into a single file results in high coupling, poor unit-testability, and high maintenance cost.

## Decision Drivers
* **Single Responsibility Principle (SRP)**: Each class/file should have exactly one reason to change.
* **Testability**: Independent unit testing of text formatting and validation rules without mock-heavy PDF dependencies.
* **Extensibility**: Ease of adding validation rules (size limits, page counts, language) and changing layout grouping rules without breaking I/O.

## Considered Options
1. **Monolithic Module**: A single `parser.py` file doing I/O, extraction, cleaning, and model output.
2. **Modular Architecture**: Separate files for `reader.py`, `extractor.py`, `normalizer.py`, `metadata.py`, `validators.py`, `models.py`, and `parser.py`.

## Decision Outcome
Chosen Option: **Modular Architecture**

### Reasons for Choice
* **Separation of Validation**: Decoupled validation (`validators.py`) ensures that checks like file format signatures, size boundaries, and integrity checks are written as small, discrete rules that can be updated independently of PyMuPDF logic.
* **Pure Text Normalization**: Renaming cleaner to `normalizer.py` and separating it ensures text standardization (dashes, quotes, bullet formats) runs as standard pure Python functions, which are easy to unit-test with mock strings.
* **Decoupled PyMuPDF Dependency**: Third-party library usage (`fitz`) is limited to `reader.py`, `extractor.py`, and `metadata.py`. `parser.py` acts as a facade orchestrator, while `models.py` defines the domain boundary.

## Trade-offs and Risks
* **File Proliferation**: We maintain 9 separate files (including `__init__.py`) instead of a single module. This requires slightly more upfront imports but is compensated by simplified file scope (each file stays under ~100 lines of readable code).
