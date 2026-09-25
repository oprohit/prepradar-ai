---
name: pdf
description: Use when processing, reading, extracting text/tables, creating, splitting, merging, or modifying PDF documents using local Python utilities (pypdf, PyMuPDF, reportlab) without paid cloud APIs.
---

# PDF Processing & Generation

Handle PDF documents completely locally using Python's pre-installed libraries (`pypdf`, `pymupdf`, `reportlab`). Perform text extraction, merging, splitting, and programmatic report generation at $0 cost with zero external API dependencies.

---

## 1. Verified Local Python Tooling

The local workspace has verified pre-installed libraries:
- **`pypdf`**: Lightweight inspection, page rotation, splitting, and merging.
- **`fitz` (`pymupdf`)**: High-performance text extraction, visual layout inspection, and rendering.
- **`reportlab`**: Programmatic PDF report and document generation from scratch.

---

## 2. Standard Workflows

### A. Extract Text from PDF
```python
import fitz # PyMuPDF

def extract_pdf_text(pdf_path: str) -> str:
    doc = fitz.open(pdf_path)
    text = ""
    for page_num, page in enumerate(doc):
        text += f"\n--- Page {page_num + 1} ---\n"
        text += page.get_text()
    return text
```

### B. Merge Multiple PDFs
```python
from pypdf import PdfWriter

def merge_pdfs(input_paths: list[str], output_path: str):
    writer = PdfWriter()
    for path in input_paths:
        writer.append(path)
    with open(output_path, "wb") as f:
        writer.write(f)
```

### C. Generate Formatted PDF Report
```python
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas

def generate_pdf_report(filename: str, title: str, content_lines: list[str]):
    c = canvas.Canvas(filename, pagesize=letter)
    width, height = letter

    # Title
    c.setFont("Helvetica-Bold", 18)
    c.drawString(50, height - 50, title)

    # Content
    c.setFont("Helvetica", 11)
    y = height - 80
    for line in content_lines:
        if y < 50:
            c.showPage()
            c.setFont("Helvetica", 11)
            y = height - 50
        c.drawString(50, y, line)
        y -= 18

    c.save()
```

---

## 3. Invariants & Verification

1. **Local-Only**: Always execute via local Python subprocess (`python script.py`). Never send documents to third-party cloud OCR or PDF converters.
2. **Deterministic Output**: Verify that output files are written to disk and non-empty.
3. **Secret Protection**: Never include raw sensitive keys or tokens in generated PDFs.
