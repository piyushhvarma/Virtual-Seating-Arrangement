import json
import os

JSON_PATH = os.path.join("src", "data", "students.json")

def process_room(students_db, room_name, grid, subject_code, subject_name, exam_date, total_students):
    rows_count = 6
    cols_count = 5
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
    
    genai_code = "AIM3245"
    genai_name = "Generative AI"
    exam_date = "02-05-2026"

    # ROOM 207
    grid_207 = [
        # COL 1 (Sec A)
        [("23FE10CAI00507", "A"), ("23FE10CAI00520", "A"), ("23FE10CAI00533", "A"), ("23FE10CAI00544", "A"), ("23FE10CAI00549", "A"), ("23FE10CAI00561", "A")],
        # COL 2 (Sec A)
        [("23FE10CAI00573", "A"), ("23FE10CAI00585", "A"), ("23FE10CAI00605", "A"), ("23FE10CAI00018", "A"), ("23FE10CAI00032", "A"), ("23FE10CAI00062", "A")],
        # COL 3 (Sec A)
        [("23FE10CAI00073", "A"), ("23FE10CAI00092", "A"), ("23FE10CAI00115", "A"), ("23FE10CAI00131", "A"), ("23FE10CAI00149", "A"), ("23FE10CAI00156", "A")],
        # COL 4 (Sec A)
        [("23FE10CAI00173", "A"), ("23FE10CAI00198", "A"), ("23FE10CAI00211", "A"), ("23FE10CAI00213", "A"), ("23FE10CAI00219", "A"), ("23FE10CAI00223", "A")],
        # COL 5 (Mixed A/B)
        [("23FE10CAI00243", "A"), ("23FE10CAI00245", "A"), ("23FE10CAI00257", "B"), ("23FE10CAI00264", "B"), ("23FE10CAI00271", "B"), ("23FE10CAI00279", "B")]
    ]
    process_room(students, "207 (AB3)", grid_207, genai_code, genai_name, exam_date, 30)

    # Save
    with open(JSON_PATH, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=4)

    print("Success! Manual Data written for GENAI Room 207.")

if __name__ == "__main__":
    run()
