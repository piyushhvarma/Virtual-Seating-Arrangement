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

    # ROOM 218 (Mixed Sec E/F)
    grid_218 = [
        # COL 1 (Sec E)
        [("23FE10CAI00047", "E"), ("23FE10CAI00053", "E"), ("23FE10CAI00075", "E"), ("23FE10CAI00108", "E"), ("23FE10CAI00109", "E"), ("23FE10CAI00119", "E")],
        # COL 2 (Sec E)
        [("23FE10CAI00153", "E"), ("23FE10CAI00159", "E"), ("23FE10CAI00166", "E"), ("23FE10CAI00172", "E"), ("23FE10CAI00175", "E"), ("23FE10CAI00180", "E")],
        # COL 3 (Sec E)
        [("23FE10CAI00220", "E"), ("23FE10CAI00225", "E"), ("23FE10CAI00227", "E"), ("23FE10CAI00239", "E"), ("23FE10CAI00253", "E"), ("23FE10CAI00258", "E")],
        # COL 4 (Sec E)
        [("23FE10CAI00286", "E"), ("23FE10CAI00292", "E"), ("23FE10CAI00303", "E"), ("23FE10CAI00309", "E"), ("23FE10CAI00310", "E"), ("23FE10CAI00319", "E")],
        # COL 5 (Mixed Sec E/F)
        [("23FE10CAI00337", "E"), ("23FE10CAI00371", "E"), ("23FE10CAI00375", "F"), ("23FE10CAI00387", "F"), ("23FE10CAI00390", "F"), ("23FE10CAI00392", "F")]
    ]
    process_room(students, "218 (AB3)", grid_218, genai_code, genai_name, exam_date, 30)

    # ROOM 219 (Sec F)
    grid_219 = [
        # COL 1 (Sec F)
        [("23FE10CAI00412", "F"), ("23FE10CAI00423", "F"), ("23FE10CAI00424", "F"), ("23FE10CAI00425", "F"), ("23FE10CAI00440", "F"), ("23FE10CAI00441", "F")],
        # COL 2 (Sec F)
        [("23FE10CAI00446", "F"), ("23FE10CAI00464", "F"), ("23FE10CAI00467", "F"), ("23FE10CAI00510", "F"), ("23FE10CAI00523", "F"), ("23FE10CAI00524", "F")],
        # COL 3 (Sec F)
        [("23FE10CAI00535", "F"), ("23FE10CAI00540", "F"), ("23FE10CAI00541", "F"), ("23FE10CAI00566", "F"), ("23FE10CAI00578", "F"), ("23FE10CAI00592", "F")],
        # COL 4 (Sec F)
        [("23FE10CAI00594", "F"), ("23FE10CAI00596", "F"), ("23FE10CAI00609", "F"), ("23FE10CAI00616", "F"), ("23FE10CAI00010", "F"), ("23FE10CAI00012", "F")],
        # COL 5 (Sec F)
        [("23FE10CAI00030", "F"), ("23FE10CAI00042", "F"), ("23FE10CAI00044", "F"), ("23FE10CAI00063", "F"), ("23FE10CAI00070", "F"), ("23FE10CAI00088", "F")]
    ]
    process_room(students, "219 (AB3)", grid_219, genai_code, genai_name, exam_date, 30)

    # Save
    with open(JSON_PATH, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=4)

    print("Success! Manual Data written for GENAI Rooms 218 and 219.")

if __name__ == "__main__":
    run()
