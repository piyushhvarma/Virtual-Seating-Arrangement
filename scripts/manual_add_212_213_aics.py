import json
import os

JSON_PATH = os.path.join("src", "data", "students.json")

def process_room(students_db, room_name, grid, subject_code, subject_name):
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
                "totalStudentsInRoom": 30,
                "rows": rows_count,
                "cols": cols_count,
                "examDate": "28-04-2026",
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
    
    aics_code = "AIM3243"
    aics_name = "AI in Cyber Security"

    # ROOM 212
    grid_212 = [
        [("23FE10CAI00302","C"), ("23FE10CAI00330","C"), ("23FE10CAI00374","C"), ("23FE10CAI00406","C"), ("23FE10CAI00421","C"), ("23FE10CAI00430","C")],
        [("23FE10CAI00439","C"), ("23FE10CAI00443","C"), ("23FE10CAI00480","C"), ("23FE10CAI00494","C"), ("23FE10CAI00505","C"), ("23FE10CAI00531","C")],
        [("23FE10CAI00580","C"), ("23FE10CAI00587","C"), ("23FE10CAI00007","C"), ("23FE10CAI00011","C"), ("23FE10CAI00086","C"), ("23FE10CAI00100","C")],
        [("23FE10CAI00145","C"), ("23FE10CAI00189","C"), ("23FE10CAI00199","C"), ("23FE10CAI00260","C"), ("23FE10CAI00267","C"), ("23FE10CAI00275","C")],
        [("23FE10CAI00313","C"), ("23FE10CAI00318","C"), ("23FE10CAI00382","C"), ("23FE10CAI00399","C"), ("23FE10CAI00402","C"), ("23FE10CAI00411","C")]
    ]
    process_room(students, "212 (AB3)", grid_212, aics_code, aics_name)

    # ROOM 213
    grid_213 = [
        [("23FE10CAI00419","C"), ("23FE10CAI00448","C"), ("23FE10CAI00465","C"), ("23FE10CAI00522","C"), ("23FE10CAI00527","C"), ("23FE10CAI00539","C")],
        [("23FE10CAI00550","C"), ("23FE10CAI00563","C"), ("23FE10CAI00577","C"), ("23FE10CAI00582","C"), ("23FE10CAI00004","C"), ("23FE10CAI00019","C")],
        [("23FE10CAI00075","C"), ("23FE10CAI00119","C"), ("23FE10CAI00153","C"), ("23FE10CAI00166","D"), ("23FE10CAI00168","D"), ("23FE10CAI00175","D")],
        [("23FE10CAI00180","D"), ("23FE10CAI00196","D"), ("23FE10CAI00220","D"), ("23FE10CAI00227","D"), ("23FE10CAI00239","D"), ("23FE10CAI00253","D")],
        [("23FE10CAI00258","D"), ("23FE10CAI00262","D"), ("23FE10CAI00286","D"), ("23FE10CAI00288","D"), ("23FE10CAI00292","D"), ("23FE10CAI00303","D")]
    ]
    process_room(students, "213 (AB3)", grid_213, aics_code, aics_name)

    # Save
    with open(JSON_PATH, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=4)

    print("Success! Manual Data written.")

if __name__ == "__main__":
    run()
