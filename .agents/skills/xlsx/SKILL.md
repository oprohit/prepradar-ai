---
name: xlsx
description: Use when creating, reading, editing, analyzing, or formatting Excel spreadsheets (.xlsx, .csv) using local Python utilities (openpyxl, pandas) with zero external API dependencies.
---

# Spreadsheet Processing & Analysis

Create, read, manipulate, and analyze `.xlsx` and `.csv` files locally using pre-installed Python libraries (`openpyxl`, `pandas`). Deliver formatted data exports, calculated summaries, and tabular reports with zero cloud dependencies and zero cost.

---

## 1. Verified Local Python Tooling

- **`openpyxl`**: Fine-grained cell formatting, font styling, formulas, sheet management, and colors.
- **`pandas`**: High-performance bulk data reading, manipulation, filtering, aggregation, and export.

---

## 2. Standard Workflows

### A. Bulk Data Analysis & CSV/XLSX Conversion
```python
import pandas as pd

def process_and_export_data(input_csv: str, output_xlsx: str):
    df = pd.read_csv(input_csv)
    # Perform aggregation or data cleaning
    summary = df.groupby("category").agg({"amount": "sum", "id": "count"}).reset_index()
    summary.to_excel(output_xlsx, index=False, sheet_name="Summary")
```

### B. Formatted Workbook Generation with Formulas
```python
import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side

def create_styled_sheet(output_file: str):
    wb = openpyxl.Workbook()
    ws = wb.active
    ws.title = "Financial Metrics"

    # Styling definitions
    header_font = Font(name="Arial", size=11, bold=True, color="FFFFFF")
    header_fill = PatternFill(start_color="1E293B", end_color="1E293B", fill_type="solid")
    center = Alignment(horizontal="center", vertical="center")

    headers = ["Metric", "Target", "Actual", "Variance"]
    ws.append(headers)

    for col_num, header in enumerate(headers, 1):
        cell = ws.cell(row=1, column=col_num)
        cell.font = header_font
        cell.fill = header_fill
        cell.alignment = center

    # Data rows
    ws.append(["Q1 Revenue", 50000, 54000, "=C2-B2"])
    ws.append(["Q2 Revenue", 60000, 61500, "=C3-B3"])
    ws.append(["Total", "=SUM(B2:B3)", "=SUM(C2:C3)", "=C4-B4"])

    # Auto-adjust column widths
    for col in ws.columns:
        max_len = max(len(str(cell.value or '')) for cell in col)
        col_letter = openpyxl.utils.get_column_letter(col[0].column)
        ws.column_dimensions[col_letter].width = max(max_len + 4, 12)

    wb.save(output_file)
```

---

## 3. Best Practices & Invariants

1. **Use Formulas Over Hardcoded Totals**: Write `=SUM(A1:A10)`, allowing values to recalculate dynamically when edited.
2. **Column Widths & Readability**: Always auto-fit column widths so cell text is never truncated (`###` errors in Excel).
3. **Local File Integrity**: Execute script locally; confirm output file exists and is readable.
4. **Zero Paid Cost**: Never use paid cloud spreadsheet APIs or converters.
