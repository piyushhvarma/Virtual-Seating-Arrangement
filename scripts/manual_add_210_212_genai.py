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

    # ROOM 210
    grid_210 = [
        # COL 1 (Mixed Sec B/C)
        [("23FE10CAI00456", "B"), ("23FE10CAI00458", "B"), ("23FE10CAI00488", "B"), ("23FE10CAI00491", "B"), ("23FE10CAI00502", "C"), ("23FE10CAI00508", "C")],
        # COL 2 (Sec C)
        [("23FE10CAI00509", "C"), ("23FE10CAI00517", "C"), ("23FE10CAI00526", "C"), ("23FE10CAI00565", "C"), ("23FE10CAI00597", "C"), ("23FE10CAI00001", "C")],
        # COL 3 (Sec C)
        [("23FE10CAI00021", "C"), ("23FE10CAI00022", "C"), ("23FE10CAI00058", "C"), ("23FE10CAI00074", "C"), ("23FE10CAI00076", "C"), ("23FE10CAI00081", "C")],
        # COL 4 (Sec C)
        [("23FE10CAI00082", "C"), ("23FE10CAI00138", "C"), ("23FE10CAI00142", "C"), ("23FE10CAI00186", "C"), ("23FE10CAI00200", "C"), ("23FE10CAI00204", "C")],
        # COL 5 (Sec C)
        [("23FE10CAI00218", "C"), ("23FE10CAI00233", "C"), ("23FE10CAI00241", "C"), ("23FE10CAI00255", "C"), ("23FE10CAI00256", "C"), ("23FE10CAI00259", "C")]
    ]
    process_room(students, "210 (AB3)", grid_210, genai_code, genai_name, exam_date, 30)

    # ROOM 212
    grid_212 = [
        # COL 1 (Sec C)
        [("23FE10CAI00269", "C"), ("23FE10CAI00272", "C"), ("23FE10CAI00297", "C"), ("23FE10CAI00312", "C"), ("23FE10CAI00314", "C"), ("23FE10CAI00320", "C")],
        # COL 2 (Sec C)
        [("23FE10CAI00333", "C"), ("23FE10CAI00335", "C"), ("23FE10CAI00343", "C"), ("23FE10CAI00345", "C"), ("23FE10CAI00347", "C"), ("23FE10CAI00366", "C")],
        # COL 3 (Sec C)
        [("23FE10CAI00372", "C"), ("23FE10CAI00381", "C"), ("23FE10CAI00383", "C"), ("23FE10CAI00389", "C"), ("23FE10CAI00391", "C"), ("23FE10CAI00401", "C")],
        # COL 4 (Sec C)
        [("23FE10CAI00408", "C"), ("23FE10CAI00429", "C"), ("23FE10CAI00431", "C"), ("23FE10CAI00438", "C"), ("23FE10CAI00444", "C"), ("23FE10CAI00457", "C")],
        # COL 5 (Sec C)
        [("23FE10CAI00462", "C"), ("23FE10CAI00473", "C"), ("23FE10CAI00474", "C"), ("23FE10CAI00477", "C"), ("23FE10CAI00497", "C"), ("23FE10CAI00503", "C")]
    ]
    process_room(students, "212 (AB3)", grid_212, genai_code, genai_name, exam_date, 30)

    # Save
    with open(JSON_PATH, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=4)

    print("Success! Manual Data written for GENAI Rooms 210 and 212.")

if __name__ == "__main__":
    run()
