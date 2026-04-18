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

    grid_219 = [
        [("23FE10CAI00099","B"), ("23FE10CAI00106","B"), ("23FE10CAI00107","B"), ("23FE10CAI00123","B"), ("23FE10CAI00130","B"), ("23FE10CAI00152","B")],
        [("23FE10CAI00215","B"), ("23FE10CAI00254","B"), ("23FE10CAI00263","B"), ("23FE10CAI00294","B"), ("23FE10CAI00300","B"), ("23FE10CAI00307","B")],
        [("23FE10CAI00316","B"), ("23FE10CAI00331","B"), ("23FE10CAI00338","B"), ("23FE10CAI00344","B"), ("23FE10CAI00346","B"), ("23FE10CAI00358","B")],
        [("23FE10CAI00361","B"), ("23FE10CAI00393","B"), ("23FE10CAI00394","B"), ("23FE10CAI00397","B"), ("23FE10CAI00409","B"), ("23FE10CAI00416","B")],
        [("23FE10CAI00427","B"), ("23FE10CAI00434","B"), ("23FE10CAI00435","B"), ("23FE10CAI00488","B"), ("23FE10CAI00491","B"), ("23FE10CAI00509","B")]
    ]
    process_room(students, "219 (AB3)", grid_219, aics_code, aics_name)

    grid_220 = [
        [("23FE10CAI00517","B"), ("23FE10CAI00579","B"), ("23FE10CAI00001","B"), ("23FE10CAI00008","B"), ("23FE10CAI00021","B"), ("23FE10CAI00058","B")],
        [("23FE10CAI00076","B"), ("23FE10CAI00081","B"), ("23FE10CAI00082","B"), ("23FE10CAI00138","B"), ("23FE10CAI00186","B"), ("23FE10CAI00204","B")],
        [("23FE10CAI00218","B"), ("23FE10CAI00238","B"), ("23FE10CAI00272","B"), ("23FE10CAI00312","B"), ("23FE10CAI00314","B"), ("23FE10CAI00333","B")],
        [("23FE10CAI00345","B"), ("23FE10CAI00381","B"), ("23FE10CAI00383","B"), ("23FE10CAI00391","B"), ("23FE10CAI00401","B"), ("23FE10CAI00415","B")],
        [("23FE10CAI00429","B"), ("23FE10CAI00431","B"), ("23FE10CAI00438","B"), ("23FE10CAI00477","B"), ("23FE10CAI00503","B"), ("23FE10CAI00506","B")]
    ]
    process_room(students, "220 (AB3)", grid_220, aics_code, aics_name)

    # Save
    with open(JSON_PATH, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=4)

    print("Success! Manual Data written.")

if __name__ == "__main__":
    run()
