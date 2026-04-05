import pdfplumber
import os
import json
import re
import glob
import pandas as pd

def load_master_mapping(excel_path="Program Elective Allocation.xlsx"):
    mapping = {}
    if not os.path.exists(excel_path):
        print(f"Warning: {excel_path} not found. Names will be omitted.")
        return mapping
        
    try:
        # Pass skiprows=1 to skip the first header line if the columns are in the second row
        # However, it's safer to just load and find 'Registration No'
        df = pd.read_excel(excel_path)
        # Find the actual row containing columns 
        # (Assuming 'Registration No' is the column name in row 1, meaning index 0)
        # Actually our test showed the first dict record had subheaders, so the header is at row 0 (default).
        # We'll just iterate records.
        records = df.to_dict(orient="records")
        for rec in records:
            reg = str(rec.get("Registration No", "")).strip().upper()
            if reg and reg != "NAN" and "Registration No" not in reg:
                name = str(rec.get("Student Name", "Student")).strip()
                sec = str(rec.get("Core Section", "")).strip()
                if name == "nan": name = "Student"
                if sec == "nan": sec = ""
                mapping[reg] = { "name": name, "section": sec }
        print(f"Successfully loaded {len(mapping)} master records from Excel.")
    except Exception as e:
        print(f"Error loading Excel mapping: {e}")
        
    return mapping

def parse_seating_pdfs(pdf_dir=".", output_json="src/data/students.json"):
    pdf_files = glob.glob(os.path.join(pdf_dir, "SeatingPlan-*.pdf"))
    
    if not pdf_files:
        print("No PDF files found matching pattern SeatingPlan-*.pdf")
        return

    master_mapping = load_master_mapping()

    # Master structure
    output_data = {
        "examMeta": {
            "title": "MTE FEB 2026 – B.Tech AIML",
            "department": "AI & Machine Learning",
            "season": "Mid-Term Examination"
        },
        "students": {}
    }

    reg_regex = re.compile(r"^23FE10CAI\d{5}$", re.IGNORECASE)
    room_section_re = re.compile(r"SECTION:\s*(.*?)\s*ROOM NO:\s*(.*)", re.IGNORECASE)

    for pdf_path in pdf_files:
        basename = os.path.basename(pdf_path)
        parts = basename.replace(".pdf", "").split("-")
        subject_code = parts[1] if len(parts) > 1 else "Unknown"
        subject_name = parts[2] if len(parts) > 2 else "Unknown"

        print(f"Processing: {basename}...")

        try:
            with pdfplumber.open(pdf_path) as pdf:
                for page_num, page in enumerate(pdf.pages):
                    tables = page.extract_tables()
                    for table_idx, table in enumerate(tables):
                        room = "Unknown"
                        pdf_section = "Unknown"
                        for row in table[:6]:
                            for cell in row:
                                if cell and type(cell) == str:
                                    text = cell.replace('\n', ' ')
                                    match = room_section_re.search(text)
                                    if match:
                                        pdf_section = match.group(1).strip()
                                        room = match.group(2).strip()

                        data_rows = []
                        valid_columns = 0
                        for row in table:
                            has_reg = any(cell and reg_regex.match(str(cell).strip()) for cell in row)
                            if has_reg:
                                data_rows.append(row)
                                valid_columns = max(valid_columns, len(row))
                        
                        if not data_rows:
                            continue
                            
                        normalized_grid = []
                        for row in data_rows:
                            padded = list(row) + [None] * (valid_columns - len(row))
                            normalized_grid.append(padded)

                        rows_count = len(normalized_grid)
                        cols_count = valid_columns
                        
                        total_students = sum(
                            1 for r in normalized_grid for c in r if c and reg_regex.match(str(c).strip())
                        )

                        for r_idx, row in enumerate(normalized_grid):
                            for c_idx, cell in enumerate(row):
                                if cell:
                                    reg_no = str(cell).strip().upper()
                                    if reg_regex.match(reg_no):
                                        seat_index = c_idx * rows_count + r_idx
                                        
                                        # Use master lookup if available
                                        mapped_name = master_mapping.get(reg_no, {}).get("name", "Student")
                                        mapped_sec = master_mapping.get(reg_no, {}).get("section", pdf_section)
                                        # If excel parsing fails section mapping, fallback to pdf_section
                                        if not mapped_sec: mapped_sec = pdf_section
                                        
                                        exam_entry = {
                                            "name": mapped_name,
                                            "section": mapped_sec,
                                            "subjectCode": subject_code,
                                            "subject": subject_name,
                                            "room": room,
                                            "seatIndex": seat_index,
                                            "totalStudentsInRoom": total_students,
                                            "rows": rows_count,
                                            "cols": cols_count,
                                            "examDate": "20-02-2026",
                                            "examTime": "01:30 PM – 03:00 PM"
                                        }
                                        
                                        if reg_no not in output_data["students"]:
                                            output_data["students"][reg_no] = []
                                            
                                        output_data["students"][reg_no].append(exam_entry)
                                        
        except Exception as e:
            print(f"Error extracting from {basename}: {e}")

    os.makedirs(os.path.dirname(output_json), exist_ok=True)
    with open(output_json, "w", encoding="utf-8") as f:
        json.dump(output_data, f, indent=4)
        
    print(f"Successfully processed PDFs. Embedded multiple exams array data for {len(output_data['students'])} unique student records into {output_json}.")

if __name__ == "__main__":
    parse_seating_pdfs()
