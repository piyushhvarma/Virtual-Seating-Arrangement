import json
import os

JSON_PATH = os.path.join("src", "data", "students.json")

def process_room(students_db, room_name, grid, subject_code, subject_name, exam_date, total_students):
    rows_count = 6
    cols_count = 5
    missing = added = 0
    
    for col_idx, col_data in enumerate(grid):
        for row_idx, reg in enumerate(col_data):
            seat_index = (col_idx * rows_count) + row_idx
            
            exam_record = {
                "name": students_db.get(reg, {}).get("name", "Unknown Name"),
                "section": "F",
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

    # ROOM 220 (Sec F)
    grid_220 = [
        # COL 1 (Sec F)
        ["23FE10CAI00094", "23FE10CAI00129", "23FE10CAI00140", "23FE10CAI00160", "23FE10CAI00170", "23FE10CAI00208"],
        # COL 2 (Sec F)
        ["23FE10CAI00209", "23FE10CAI00212", "23FE10CAI00242", "23FE10CAI00251", "23FE10CAI00277", "23FE10CAI00285"],
        # COL 3 (Sec F)
        ["23FE10CAI00328", "23FE10CAI00353", "23FE10CAI00354", "23FE10CAI00356", "23FE10CAI00388", "23FE10CAI00398"],
        # COL 4 (Sec F)
        ["23FE10CAI00400", "23FE10CAI00426", "23FE10CAI00437", "23FE10CAI00451", "23FE10CAI00455", "23FE10CAI00461"],
        # COL 5 (Sec F)
        ["23FE10CAI00475", "23FE10CAI00499", "23FE10CAI00504", "23FE10CAI00512", "23FE10CAI00519", "23FE10CAI00543"]
    ]
    process_room(students, "220 (AB3)", grid_220, genai_code, genai_name, exam_date, 30)

    # Save
    with open(JSON_PATH, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=4)

    print("Success! Manual Data written for GENAI Room 220.")

if __name__ == "__main__":
    run()
