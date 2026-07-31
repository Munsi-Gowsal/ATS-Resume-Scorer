import os
import sys
import time
import asyncio
import tempfile
import tracemalloc
import statistics
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor

import fitz  # PyMuPDF
from fastapi.testclient import TestClient
import httpx

from app.parser.parser import ResumeParser
from backend.app.analyzer.analyzer import ResumeAnalyzer
from backend.app.matcher import JobMatcher, ParsedJobDescription
from backend.app.api.dependencies import parse_job_description_from_text
from backend.main import app

# Constants for benchmarking
NUM_RESUMES_100 = 100
NUM_RESUMES_500 = 500
NUM_MATCH_JDS = 100
CONCURRENT_REQUESTS = 100

def create_benchmark_pdf(dest_path: Path) -> int:
    """Creates a sample PDF on disk to use for benchmarks."""
    doc = fitz.open()
    page = doc.new_page()
    page.insert_text((50, 50), "John Doe", fontsize=16, fontname="helvetica-bold")
    page.insert_text((50, 70), "john.doe@example.com | (555) 123-4567 | San Francisco, CA", fontsize=10, fontname="helvetica")
    page.insert_text((50, 100), "SUMMARY", fontsize=12, fontname="helvetica-bold")
    page.insert_text((50, 115), "Experienced Software Engineer skilled in Python, FastAPI, and AWS.", fontsize=10, fontname="helvetica")
    page.insert_text((50, 140), "SKILLS", fontsize=12, fontname="helvetica-bold")
    page.insert_text((50, 155), "Python, FastAPI, AWS, Docker, PostgreSQL, React, Node", fontsize=10, fontname="helvetica")
    page.insert_text((50, 180), "EXPERIENCE", fontsize=12, fontname="helvetica-bold")
    page.insert_text((50, 195), "Senior Software Engineer at Tech Corp Inc., 2020 - Present", fontsize=11, fontname="helvetica-bold")
    page.insert_text((50, 210), "• Built scalable REST APIs using Python and FastAPI.", fontsize=10, fontname="helvetica")
    page.insert_text((50, 225), "• Deployed Docker containers onto AWS ECS cluster.", fontsize=10, fontname="helvetica")
    page.insert_text((50, 250), "EDUCATION", fontsize=12, fontname="helvetica-bold")
    page.insert_text((50, 265), "Stanford University - B.S. in Computer Science", fontsize=11, fontname="helvetica-bold")
    doc.save(str(dest_path))
    doc.close()
    return dest_path.stat().st_size

# Benchmark metrics helper
class BenchmarkMetrics:
    def __init__(self, name: str):
        self.name = name
        self.start_time = 0.0
        self.end_time = 0.0
        self.latencies = []
        self.peak_memory = 0.0

    def start(self):
        tracemalloc.start()
        tracemalloc.reset_peak()
        self.start_time = time.perf_counter()

    def record_lap(self, lap_start: float):
        self.latencies.append(time.perf_counter() - lap_start)

    def stop(self, iterations: int):
        self.end_time = time.perf_counter()
        _, peak = tracemalloc.get_traced_memory()
        tracemalloc.stop()
        
        self.total_time = self.end_time - self.start_time
        self.avg_latency = self.total_time / iterations
        self.throughput = iterations / self.total_time
        self.peak_memory_mb = peak / (1024 * 1024)

    def print_results(self):
        print(f"\n=== Benchmark: {self.name} ===")
        print(f"Total Time:     {self.total_time:.4f} seconds")
        print(f"Avg Latency:    {self.avg_latency * 1000:.2f} ms")
        print(f"Throughput:     {self.throughput:.2f} iterations/sec")
        print(f"Peak Memory:    {self.peak_memory_mb:.2f} MB")
        if self.latencies:
            print(f"P50 Latency:    {statistics.median(self.latencies) * 1000:.2f} ms")
            print(f"P95 Latency:    {statistics.quantiles(self.latencies, n=20)[18] * 1000:.2f} ms")

# ==========================================
# 1. Parsing Resumes Benchmark
# ==========================================
def run_parsing_benchmark(pdf_path: Path, count: int) -> BenchmarkMetrics:
    metrics = BenchmarkMetrics(f"Parsing {count} Resumes")
    metrics.start()
    
    for _ in range(count):
        lap_start = time.perf_counter()
        parsed_doc = ResumeParser.parse(pdf_path)
        _ = ResumeAnalyzer.analyze(parsed_doc)
        metrics.record_lap(lap_start)
        
    metrics.stop(count)
    return metrics

# ==========================================
# 2. Matching JDs Benchmark
# ==========================================
def run_matching_benchmark(pdf_path: Path, count: int) -> BenchmarkMetrics:
    metrics = BenchmarkMetrics(f"Matching {count} Job Descriptions")
    parsed_doc = ResumeParser.parse(pdf_path)
    resume = ResumeAnalyzer.analyze(parsed_doc)
    
    # Pre-parse a sample JD text
    jd_text = "Software Engineer. Requirements: Python, FastAPI, Docker, AWS. 3+ years experience. Bachelor degree."
    parsed_jd = parse_job_description_from_text(jd_text)
    matcher = JobMatcher()
    
    metrics.start()
    for _ in range(count):
        lap_start = time.perf_counter()
        _ = matcher.match(resume, parsed_jd)
        metrics.record_lap(lap_start)
        
    metrics.stop(count)
    return metrics

# ==========================================
# 3. Concurrent API Requests Benchmark
# ==========================================
async def run_concurrent_api_benchmark(pdf_path: Path, count: int) -> BenchmarkMetrics:
    metrics = BenchmarkMetrics(f"Concurrent API Requests ({count} requests)")
    pdf_bytes = pdf_path.read_bytes()
    
    # Prepare HTTP client for ASGI app
    async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://test") as client:
        # Define worker tasks
        async def make_request():
            lap_start = time.perf_counter()
            response = await client.post(
                "/match",
                files={"file": ("resume.pdf", pdf_bytes, "application/pdf")},
                data={"jd_text": "Python dev, FastAPI, AWS, Docker. 5 years experience."}
            )
            metrics.record_lap(lap_start)
            assert response.status_code == 200

        metrics.start()
        # Trigger all requests concurrently
        tasks = [make_request() for _ in range(count)]
        await asyncio.gather(*tasks)
        metrics.stop(count)
        
    return metrics

def main():
    print("Initializing benchmark environments...")
    with tempfile.TemporaryDirectory() as tmp_dir:
        pdf_path = Path(tmp_dir) / "benchmark.pdf"
        size = create_benchmark_pdf(pdf_path)
        print(f"Generated sample PDF for benchmark. Size: {size} bytes")
        
        # 1. Benchmark: Parse 100 Resumes
        m_parse_100 = run_parsing_benchmark(pdf_path, NUM_RESUMES_100)
        m_parse_100.print_results()
        
        # 2. Benchmark: Parse 500 Resumes
        m_parse_500 = run_parsing_benchmark(pdf_path, NUM_RESUMES_500)
        m_parse_500.print_results()
        
        # 3. Benchmark: Match 100 JDs
        m_match_100 = run_matching_benchmark(pdf_path, NUM_MATCH_JDS)
        m_match_100.print_results()
        
        # 4. Benchmark: Concurrent API Requests
        print("\nStarting concurrent API requests test...")
        m_concurrent = asyncio.run(run_concurrent_api_benchmark(pdf_path, CONCURRENT_REQUESTS))
        m_concurrent.print_results()

if __name__ == "__main__":
    main()
