# ADR 001: Selection of PDF Parsing Library

## Context and Problem Statement
For the AI Resume Intelligence Platform, we need to extract raw text, spatial coordinates, and font style properties (size, weight, italicization) from uploaded PDF resumes. This data is critical for reconstructing multi-column layouts and detecting visual sections (e.g., Headers, Subheaders, normal text) without immediately relying on expensive AI queries. We compared four popular Python PDF libraries: PyMuPDF (`fitz`), pdfplumber, pdfminer.six, and pypdf.

## Decision Drivers
* **Visual Metadata Extraction**: Ability to extract font sizes, bold/italic styles, and block-level bounding boxes.
* **Layout Resolution**: Ability to partition multi-column pages without interleaving texts.
* **Performance**: Speed and resource overhead when processing multi-page documents concurrently.
* **Accuracy**: Clean Unicode parsing and resolving glyph ligatures (e.g., "fi", "fl").

## Considered Options
1. **PyMuPDF (`fitz`)** (C-based engine)
2. **pdfplumber** (Pure Python, spatial-index wrapper of pdfminer)
3. **pdfminer.six** (Pure Python, complex text analyzer)
4. **pypdf** (Pure Python, basic document tools)

## Decision Outcome
Chosen Option: **PyMuPDF (`fitz`)**

### Reasons for Choice
* **Rich Layout Data**: Using `page.get_text("dict")` yields nested structures of pages, blocks, lines, and spans. Each span exposes exact font name, size, bounding box coordinates, and styling flags (bold/italic) which is unmatched by libraries like `pypdf`.
* **Execution Speed**: Because it wraps a native C library (MuPDF), PyMuPDF is 10–50x faster than pure-Python options like pdfminer.six, satisfying the platform's scaling driver.
* **Glyph Accuracy**: Resolves custom fonts and ligatures correctly where pure-Python libraries often drop characters or print replacement boxes.

### Rejected Options
* **pypdf**: Rejected because it cannot extract rich style metadata (font size, bold, italic) nor reliably distinguish columns.
* **pdfminer.six**: Rejected due to high configuration overhead (LAParams) and slow execution speed.
* **pdfplumber**: Rejected as the primary parser due to slower execution speed relative to PyMuPDF, but kept as a potential secondary tool if complex table extraction is required post-MVP.

## Trade-offs and Risks
* **License Model**: PyMuPDF is licensed under AGPL-3.0 / Commercial. For closed-source platforms, a commercial license from Artifex is required. We accept this constraint because the architectural requirements (font parsing and multi-column resolution) are critical to platform function.
* **C-Dependency**: It is a native wrapper, meaning pre-compiled binaries are required for target platforms.
