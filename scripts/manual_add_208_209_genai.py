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
                "section": "B",
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

    # ROOM 208
    grid_208 = [
        ["23FE10CAI00296", "23FE10CAI00311", "23FE10CAI00334", "23FE10CAI00336", "23FE10CAI00367", "23FE10CAI00373"],
        ["23FE10CAI00377", "23FE10CAI00379", "23FE10CAI00386", "23FE10CAI00396", "23FE10CAI00403", "23FE10CAI00454"],
        ["23FE10CAI00460", "23FE10CAI00470", "23FE10CAI00471", "23FE10CAI00472", "23FE10CAI00476", "23FE10CAI00478"],
        ["23FE10CAI00493", "23FE10CAI00500", "23FE10CAI00518", "23FE10CAI00017", "23FE10CAI00046", "23FE10CAI00068"],
        ["23FE10CAI00077", "23FE10CAI00093", "23FE10CAI00099", "23FE10CAI00106", "23FE10CAI00107", "23FE10CAI00122"]
    ]
    process_room(students, "208 (AB3)", grid_208, genai_code, genai_name, exam_date, 30)

    # ROOM 209
    grid_209 = [
        ["23FE10CAI00123", "23FE10CAI00130", "23FE10CAI00152", "23FE10CAI00185", "23FE10CAI00215", "23FE10CAI00222"],
        ["23FE10CAI00236", "23FE10CAI00254", "23FE10CAI00263", "23FE10CAI00268", "23FE10CAI00294", "23FE10CAI00304"],
        ["23FE10CAI00316", "23FE10CAI00331", "23FE10CAI00338", "23FE10CAI00344", "23FE10CAI00346", "23FE10CAI00358"],
        ["23FE10CAI00360", "23FE10CAI00361", "23FE10CAI00384", "23FE10CAI00394", "23FE10CAI00397", "23FE10CAI00409"],
        ["23FE10CAI00410", "23FE10CAI00416", "23FE10CAI00417", "23FE10CAI00418", "23FE10CAI00427", "23FE10CAI00435"]
    ]
    process_room(students, "209 (AB3)", grid_209, genai_code, genai_name, exam_date, 30)

    # Save
    with open(JSON_PATH, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=4)

    print("Success! Manual Data written for GENAI.")

if __name__ == "__main__":
    run()
