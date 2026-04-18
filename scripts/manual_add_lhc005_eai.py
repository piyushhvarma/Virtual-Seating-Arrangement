import json
import os

JSON_PATH = os.path.join("src", "data", "students.json")

def process_room(students_db, room_name, grid, subject_code, subject_name, exam_date, total_students):
    rows_count = 10
    cols_count = 9
    missing = added = 0
    
    for col_idx, col_data in enumerate(grid):
        for row_idx, (reg, sec) in enumerate(col_data):
            seat_index = (col_idx * rows_count) + row_idx
            
            exam_record = {
                "name": students_db.get(reg, {}).get("name", "Unknown Name"),
                "section": sec,
                "subjectCode": subject_code,
                "subject": subject_name,
                "room": room_name,
                "seatIndex": seat_index,
                "totalStudentsInRoom": total_students,
                "rows": rows_count,
                "cols": cols_count,
                "examDate": exam_date,
                "examTime": "TBD"
            }
            
            if reg not in students_db:
                missing += 1
                students_db[reg] = {"name": "Unknown", "exams": []}
                
            students_db[reg]["exams"].append(exam_record)
            added += 1
            
    print(f"Room {room_name}: Added {added} records, {missing} new students created.")

def run():
    with open(JSON_PATH, "r", encoding="utf-8") as f:
        data = json.load(f)
    
    students = data["students"]
    
    eai_code = "AIM3244"
    eai_name = "Explainable AI"
    exam_date = "02-05-2026"

    # LHC-005 Matrix
    grid_lhc005 = [
        # COL A1 (Sec A)
        [("23FE10CAI00006","A"), ("23FE10CAI00055","A"), ("23FE10CAI00064","A"), ("23FE10CAI00104","A"), ("23FE10CAI00126","A"), ("23FE10CAI00224","A"), ("23FE10CAI00244","A"), ("23FE10CAI00249","A"), ("23FE10CAI00283","A"), ("23FE10CAI00326","A")],
        # COL A2 (Sec A)
        [("23FE10CAI00327","A"), ("23FE10CAI00350","A"), ("23FE10CAI00365","A"), ("23FE10CAI00368","A"), ("23FE10CAI00413","A"), ("23FE10CAI00514","A"), ("23FE10CAI00537","A"), ("23FE10CAI00558","A"), ("23FE10CAI00567","A"), ("23FE10CAI00029","A")],
        # COL A3 (Sec A)
        [("23FE10CAI00034","A"), ("23FE10CAI00051","A"), ("23FE10CAI00065","A"), ("23FE10CAI00066","A"), ("23FE10CAI00071","A"), ("23FE10CAI00084","A"), ("23FE10CAI00097","A"), ("23FE10CAI00103","A"), ("23FE10CAI00176","A"), ("23FE10CAI00179","A")],
        # COL B1 (Sec A)
        [("23FE10CAI00206","A"), ("23FE10CAI00216","A"), ("23FE10CAI00252","A"), ("23FE10CAI00274","A"), ("23FE10CAI00293","A"), ("23FE10CAI00332","A"), ("23FE10CAI00364","A"), ("23FE10CAI00433","A"), ("23FE10CAI00436","A"), ("23FE10CAI00486","A")],
        # COL B2 (Sec A)
        [("23FE10CAI00530","A"), ("23FE10CAI00532","A"), ("23FE10CAI00542","A"), ("23FE10CAI00595","A"), ("23FE10CAI00611","A"), ("23FE10CAI00009","A"), ("23FE10CAI00023","A"), ("23FE10CAI00146","A"), ("23FE10CAI00217","A"), ("23FE10CAI00226","A")],
        # COL B3 (Sec A)
        [("23FE10CAI00229","A"), ("23FE10CAI00300","A"), ("23FE10CAI00307","A"), ("23FE10CAI00370","A"), ("23FE10CAI00376","A"), ("23FE10CAI00393","A"), ("23FE10CAI00407","A"), ("23FE10CAI00434","A"), ("23FE10CAI00529","A"), ("23FE10CAI00556","A")],
        # COL C1 (Sec A)
        [("23FE10CAI00575","A"), ("23FE10CAI00579","A"), ("23FE10CAI00590","A"), ("23FE10CAI00608","A"), ("23FE10CAI00008","A"), ("23FE10CAI00238","A"), ("23FE10CAI00322","A"), ("23FE10CAI00325","A"), ("23FE10CAI00415","A"), ("23FE10CAI00506","A")],
        # COL C2 (Mixed Sec A/B)
        [("23FE10CAI00548","A"), ("23FE10CAI00003","B"), ("23FE10CAI00027","B"), ("23FE10CAI00054","B"), ("23FE10CAI00111","B"), ("23FE10CAI00134","B"), ("23FE10CAI00137","B"), ("23FE10CAI00194","B"), ("23FE10CAI00210","B"), ("23FE10CAI00228","B")],
        # COL C3 (Sec B)
        [("23FE10CAI00231","B"), ("23FE10CAI00250","B"), ("23FE10CAI00282","B"), ("23FE10CAI00330","B"), ("23FE10CAI00406","B"), ("23FE10CAI00452","B"), ("23FE10CAI00494","B"), ("23FE10CAI00505","B"), ("23FE10CAI00102","B"), ("23FE10CAI00136","B")]
    ]
    
    process_room(students, "LHC-005", grid_lhc005, eai_code, eai_name, exam_date, 90)

    # Save
    with open(JSON_PATH, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=4)

    print("Success! Manual Data written for LHC-005 EAI.")

if __name__ == "__main__":
    run()
