# AI Resume Intelligence

A high-performance, deterministic REST API built with **FastAPI**, **PyMuPDF**, and **Pydantic** for PDF resume parsing, structural content analysis, job description parsing, and candidate-to-job matching.

---

## Architecture Overview

```
                          ┌──────────────────────────┐
                          │   HTTP Client / Frontend │
                          └─────────────┬────────────┘
                                        │
                                        ▼
                          ┌──────────────────────────┐
                          │    FastAPI API Layer     │
                          │   (backend/app/api)      │
                          └─────────────┬────────────┘
                                        │
          ┌─────────────────────────────┼─────────────────────────────┐
          ▼                             ▼                             ▼
┌───────────────────┐         ┌───────────────────┐         ┌───────────────────┐
│   ResumeParser    │         │  ResumeAnalyzer   │         │    JobMatcher     │
│   (app/parser)    │────────►│(backend/app/analy)│────────►│(backend/app/match)│
└───────────────────┘         └───────────────────┘         └───────────────────┘
```

The system is structured into four core layers:
1. **Parser (`app/parser`)**: Low-level layout extraction using PyMuPDF. Extracts spatial bounding boxes, font attributes (size, weight, slant), and layout blocks.
2. **Analyzer (`backend/app/analyzer`)**: High-level semantic segmentation (sections, skills, work experience, education, projects, contact info).
3. **Matcher (`backend/app/matcher`)**: Deterministic scoring engine evaluating candidate-to-job match ratios across skills, experience years, education rank, and keyword overlap.
4. **API (`backend/app/api`)**: FastAPI endpoints providing REST access to parsing, analysis, and matching services.

---

## Features

- **Layout-Aware PDF Extraction**: Inspects font sizes, styles, and coordinates to preserve document layout order.
- **Section Detection**: Classifies blocks into Summary, Skills, Experience, Education, Projects, Certifications, and Languages.
- **Deterministic Matcher**: Bounded 0–100 scoring based on skills, work history, degree rank, and keyword density.
- **Hardened Upload Security**: Filename path traversal sanitization, chunked read memory limits (10 MB cap), and exception trace masking.
- **High Concurrency Optimization**: Offloads CPU-bound parsing routines onto worker threads.

---

## Installation & Local Setup

### Prerequisites
- **Python 3.9+** (Python 3.11 recommended)
- **pip** and **virtualenv**
- **Docker** & **docker-compose** (optional for containerized setup)

### Virtual Environment Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-org/ai-resume-intelligence.git
   cd ai-resume-intelligence
   ```

2. **Create and activate a Python virtual environment:**
   ```bash
   python3 -m venv venv
   source venv/bin/activate
   ```

3. **Install pinned dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

---

## Running Locally

To run the development server with hot reloading:

```bash
source venv/bin/activate
PYTHONPATH=. uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
```

Access the interactive API documentation at:
- **Swagger UI**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **ReDoc**: [http://localhost:8000/redoc](http://localhost:8000/redoc)

---

## Docker Usage

### Build the Image
```bash
docker build --no-cache -t ai-resume-intelligence:latest -f docker/Dockerfile .
```

### Run the Container
```bash
docker run -d --name ai-resume-backend -p 8000:8000 ai-resume-intelligence:latest
```

### Verify Container Health
```bash
curl http://localhost:8000/health
```

### Docker Compose
```bash
docker-compose -f docker/docker-compose.yml up -d
```

---

## Running Tests & Benchmarks

### Standard Test Suite
Run unit, integration, and fuzz testing:
```bash
source venv/bin/activate
PYTHONPATH=. pytest
```

### Run Fuzzing Tests Specifically
```bash
source venv/bin/activate
PYTHONPATH=. pytest tests/test_fuzz.py
```

### Performance Benchmarks
Run latency, throughput, and memory profiling:
```bash
source venv/bin/activate
PYTHONPATH=. python tests/benchmark.py
```

---

## API Endpoints Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/health` | Application health check endpoint |
| `POST` | `/parse-resume` | Upload PDF resume → Returns `ParsedDocument` layout blocks |
| `POST` | `/analyze-resume` | Upload PDF resume → Returns structured `Resume` model |
| `POST` | `/parse-job-description` | Post text or file → Returns `ParsedJobDescription` model |
| `POST` | `/match` | Post resume PDF + JD → Returns `MatchResult` scoring and gap analysis |

---

## Environment Variables

Configuration parameters are loaded from `.env` or system environment variables:

| Variable | Default | Description |
| :--- | :--- | :--- |
| `PYTHONPATH` | `.` | Python module resolution root |
| `LOG_LEVEL` | `INFO` | Logging verbosity (`DEBUG`, `INFO`, `WARNING`, `ERROR`) |
| `APP_ENV` | `development` | Deployment environment (`development`, `staging`, `production`) |
| `PORT` | `8000` | Application HTTP server port |

---

## Deployment Instructions

### AWS / DigitalOcean / Fly.io Container Deployment
1. Build the Docker image using `docker/Dockerfile`.
2. Push the image to your container registry (ECR, Docker Hub).
3. Ensure `/tmp` is mounted as a writable volume (`tmpfs` or volume mount) if using a read-only filesystem.
4. Pass production environment variables via system secrets manager.

---

## Troubleshooting

### `ModuleNotFoundError: No module named 'backend'`
Ensure `PYTHONPATH=.` is exported or set in your environment:
```bash
export PYTHONPATH=.
```

### `ImportError: Cannot find module fastapi.testclient` (IDE / Pyright)
Ensure your IDE points to the project virtual environment (`./venv/bin/python`). `pyrightconfig.json` is pre-configured with:
```json
{
  "venvPath": ".",
  "venv": "venv",
  "extraPaths": [".", "backend"]
}
```
