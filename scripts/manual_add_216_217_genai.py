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

    # ROOM 216 (Mixed Sec D/E)
    grid_216 = [
        # COL 1 (Sec D)
        [("23FE10CAI00587", "D"), ("23FE10CAI00007", "D"), ("23FE10CAI00011", "D"), ("23FE10CAI00015", "D"), ("23FE10CAI00024", "D"), ("23FE10CAI00072", "D")],
        # COL 2 (Sec D)
        [("23FE10CAI00083", "D"), ("23FE10CAI00085", "D"), ("23FE10CAI00086", "D"), ("23FE10CAI00100", "D"), ("23FE10CAI00105", "D"), ("23FE10CAI00124", "D")],
        # COL 3 (Sec D)
        [("23FE10CAI00139", "D"), ("23FE10CAI00144", "D"), ("23FE10CAI00145", "D"), ("23FE10CAI00154", "D"), ("23FE10CAI00163", "D"), ("23FE10CAI00188", "D")],
        # COL 4 (Sec E)
        [("23FE10CAI00189", "E"), ("23FE10CAI00199", "E"), ("23FE10CAI00260", "E"), ("23FE10CAI00265", "E"), ("23FE10CAI00267", "E"), ("23FE10CAI00270", "E")],
        # COL 5 (Sec E)
        [("23FE10CAI00275", "E"), ("23FE10CAI00284", "E"), ("23FE10CAI00295", "E"), ("23FE10CAI00298", "E"), ("23FE10CAI00299", "E"), ("23FE10CAI00313", "E")]
    ]
    process_room(students, "216 (AB3)", grid_216, genai_code, genai_name, exam_date, 30)

    # ROOM 217 (Sec E)
    grid_217 = [
        # COL 1 (Sec E)
        [("23FE10CAI00315", "E"), ("23FE10CAI00318", "E"), ("23FE10CAI00323", "E"), ("23FE10CAI00340", "E"), ("23FE10CAI00378", "E"), ("23FE10CAI00380", "E")],
        # COL 2 (Sec E)
        [("23FE10CAI00399", "E"), ("23FE10CAI00402", "E"), ("23FE10CAI00411", "E"), ("23FE10CAI00414", "E"), ("23FE10CAI00419", "E"), ("23FE10CAI00448", "E")],
        # COL 3 (Sec E)
        [("23FE10CAI00453", "E"), ("23FE10CAI00465", "E"), ("23FE10CAI00481", "E"), ("23FE10CAI00495", "E"), ("23FE10CAI00513", "E"), ("23FE10CAI00522", "E")],
        # COL 4 (Sec E)
        [("23FE10CAI00527", "E"), ("23FE10CAI00539", "E"), ("23FE10CAI00552", "E"), ("23FE10CAI00563", "E"), ("23FE10CAI00571", "E"), ("23FE10CAI00574", "E")],
        # COL 5 (Sec E)
        [("23FE10CAI00577", "E"), ("23FE10CAI00591", "E"), ("23FE10CAI00014", "E"), ("23FE10CAI00019", "E"), ("23FE10CAI00020", "E"), ("23FE10CAI00045", "E")]
    ]
    process_room(students, "217 (AB3)", grid_217, genai_code, genai_name, exam_date, 30)

    # Save
    with open(JSON_PATH, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=4)

    print("Success! Manual Data written for GENAI Rooms 216 and 217.")

if __name__ == "__main__":
    run()
