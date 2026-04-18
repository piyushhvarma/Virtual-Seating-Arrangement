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

    # ROOM 214
    grid_214 = [
        [("23FE10CAI00310","D"), ("23FE10CAI00319","D"), ("23FE10CAI00357","D"), ("23FE10CAI00371","D"), ("23FE10CAI00390","D"), ("23FE10CAI00392","D")],
        [("23FE10CAI00412","D"), ("23FE10CAI00425","D"), ("23FE10CAI00440","D"), ("23FE10CAI00516","D"), ("23FE10CAI00523","D"), ("23FE10CAI00524","D")],
        [("23FE10CAI00535","D"), ("23FE10CAI00566","D"), ("23FE10CAI00613","D"), ("23FE10CAI00616","D"), ("23FE10CAI00010","D"), ("23FE10CAI00042","D")],
        [("23FE10CAI00044","D"), ("23FE10CAI00048","D"), ("23FE10CAI00070","D"), ("23FE10CAI00088","D"), ("23FE10CAI00101","D"), ("23FE10CAI00112","D")],
        [("23FE10CAI00114","D"), ("23FE10CAI00129","D"), ("23FE10CAI00140","D"), ("23FE10CAI00141","D"), ("23FE10CAI00183","D"), ("23FE10CAI00190","D")]
    ]
    process_room(students, "214 (AB3)", grid_214, aics_code, aics_name)

    # ROOM 216
    grid_216 = [
        [("23FE10CAI00203","D"), ("23FE10CAI00207","D"), ("23FE10CAI00209","D"), ("23FE10CAI00212","D"), ("23FE10CAI00234","D"), ("23FE10CAI00237","D")],
        [("23FE10CAI00251","D"), ("23FE10CAI00261","D"), ("23FE10CAI00290","D"), ("23FE10CAI00328","D"), ("23FE10CAI00348","D"), ("23FE10CAI00349","D")],
        [("23FE10CAI00398","D"), ("23FE10CAI00432","D"), ("23FE10CAI00437","D"), ("23FE10CAI00459","D"), ("23FE10CAI00463","D"), ("23FE10CAI00482","D")],
        [("23FE10CAI00487","D"), ("23FE10CAI00504","D"), ("23FE10CAI00536","D"), ("23FE10CAI00543","D"), ("23FE10CAI00570","D"), ("23FE10CAI00612","D")],
        [("23FE10CAI00002","A"), ("23FE10CAI00006","A"), ("23FE10CAI00055","A"), ("23FE10CAI00117","A"), ("23FE10CAI00125","A"), ("23FE10CAI00126","A")]
    ]
    process_room(students, "216 (AB3)", grid_216, aics_code, aics_name)

    # Save
    with open(JSON_PATH, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=4)

    print("Success! Manual Data written.")

if __name__ == "__main__":
    run()
