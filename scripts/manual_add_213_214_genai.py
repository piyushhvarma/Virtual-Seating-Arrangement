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

    # ROOM 213 (Mixed Sec C/D)
    grid_213 = [
        # COL 1 (Sec C)
        [("23FE10CAI00511", "C"), ("23FE10CAI00515", "C"), ("23FE10CAI00528", "C"), ("23FE10CAI00538", "C"), ("23FE10CAI00546", "C"), ("23FE10CAI00547", "C")],
        # COL 2 (Mixed Sec C/D)
        [("23FE10CAI00559", "C"), ("23FE10CAI00562", "C"), ("23FE10CAI00576", "C"), ("23FE10CAI00610", "C"), ("23FE10CAI00016", "D"), ("23FE10CAI00025", "D")],
        # COL 3 (Sec D)
        [("23FE10CAI00026", "D"), ("23FE10CAI00028", "D"), ("23FE10CAI00036", "D"), ("23FE10CAI00039", "D"), ("23FE10CAI00041", "D"), ("23FE10CAI00059", "D")],
        # COL 4 (Sec D)
        [("23FE10CAI00061", "D"), ("23FE10CAI00069", "D"), ("23FE10CAI00087", "D"), ("23FE10CAI00110", "D"), ("23FE10CAI00113", "D"), ("23FE10CAI00127", "D")],
        # COL 5 (Sec D)
        [("23FE10CAI00155", "D"), ("23FE10CAI00157", "D"), ("23FE10CAI00162", "D"), ("23FE10CAI00167", "D"), ("23FE10CAI00177", "D"), ("23FE10CAI00181", "D")]
    ]
    process_room(students, "213 (AB3)", grid_213, genai_code, genai_name, exam_date, 30)

    # ROOM 214 (Sec D)
    grid_214 = [
        # COL 1 (Sec D)
        [("23FE10CAI00197", "D"), ("23FE10CAI00202", "D"), ("23FE10CAI00205", "D"), ("23FE10CAI00232", "D"), ("23FE10CAI00266", "D"), ("23FE10CAI00276", "D")],
        # COL 2 (Sec D)
        [("23FE10CAI00281", "D"), ("23FE10CAI00289", "D"), ("23FE10CAI00291", "D"), ("23FE10CAI00302", "D"), ("23FE10CAI00329", "D"), ("23FE10CAI00351", "D")],
        # COL 3 (Sec D)
        [("23FE10CAI00362", "D"), ("23FE10CAI00374", "D"), ("23FE10CAI00421", "D"), ("23FE10CAI00430", "D"), ("23FE10CAI00439", "D"), ("23FE10CAI00443", "D")],
        # COL 4 (Sec D)
        [("23FE10CAI00480", "D"), ("23FE10CAI00483", "D"), ("23FE10CAI00485", "D"), ("23FE10CAI00492", "D"), ("23FE10CAI00531", "D"), ("23FE10CAI00545", "D")],
        # COL 5 (Sec D)
        [("23FE10CAI00557", "D"), ("23FE10CAI00560", "D"), ("23FE10CAI00572", "D"), ("23FE10CAI00580", "D"), ("23FE10CAI00584", "D"), ("23FE10CAI00586", "D")]
    ]
    process_room(students, "214 (AB3)", grid_214, genai_code, genai_name, exam_date, 30)

    # Save
    with open(JSON_PATH, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=4)

    print("Success! Manual Data written for GENAI Rooms 213 and 214.")

if __name__ == "__main__":
    run()
