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
                "examDate": "30-04-2026",
                "examTime": "TBD"
            }
            
            if reg not in students_db:
                missing += 1
                students_db[reg] = {"name": "Unknown", "exams": []}
                
            students_db[reg]["exams"].append(exam_record)
            added += 1
            
    print(f"Room {room_name}: Added {added} records, {missing} new students created.")

def map_manual_data():
    with open(JSON_PATH, "r", encoding="utf-8") as f:
        data = json.load(f)
    
    students = data["students"]

    # ROOM 213 (AB3)
    grid_213 = [
        [("23FE10CAI00118", "A"), ("23FE10CAI00120", "A"), ("23FE10CAI00133", "A"), ("23FE10CAI00135", "A"), ("23FE10CAI00150", "A"), ("23FE10CAI00151", "A")],
        [("23FE10CAI00158", "A"), ("23FE10CAI00174", "A"), ("23FE10CAI00187", "A"), ("23FE10CAI00195", "A"), ("23FE10CAI00214", "A"), ("23FE10CAI00221", "A")],
        [("23FE10CAI00224", "A"), ("23FE10CAI00244", "A"), ("23FE10CAI00247", "A"), ("23FE10CAI00249", "A"), ("23FE10CAI00273", "A"), ("23FE10CAI00324", "A")],
        [("23FE10CAI00327", "A"), ("23FE10CAI00350", "A"), ("23FE10CAI00368", "A"), ("23FE10CAI00395", "A"), ("23FE10CAI00405", "A"), ("23FE10CAI00420", "A")],
        [("23FE10CAI00447", "A"), ("23FE10CAI00468", "A"), ("23FE10CAI00469", "A"), ("23FE10CAI00484", "A"), ("23FE10CAI00501", "A"), ("23FE10CAI00507", "A")]
    ]
    process_room(students, "213 (AB3)", grid_213, "AIM3241", "Natural Language Processing")

    # ROOM 214 (AB3)
    grid_214 = [
        [("23FE10CAI00514", "A"), ("23FE10CAI00520", "A"), ("23FE10CAI00533", "A"), ("23FE10CAI00537", "A"), ("23FE10CAI00544", "A"), ("23FE10CAI00549", "A")],
        [("23FE10CAI00558", "A"), ("23FE10CAI00561", "A"), ("23FE10CAI00567", "A"), ("23FE10CAI00573", "A"), ("23FE10CAI00585", "A"), ("23FE10CAI00018", "A")],
        [("23FE10CAI00032", "A"), ("23FE10CAI00034", "A"), ("23FE10CAI00051", "A"), ("23FE10CAI00062", "A"), ("23FE10CAI00066", "A"), ("23FE10CAI00073", "A")],
        [("23FE10CAI00092", "A"), ("23FE10CAI00097", "A"), ("23FE10CAI00103", "A"), ("23FE10CAI00115", "A"), ("23FE10CAI00149", "A"), ("23FE10CAI00156", "A")],
        [("23FE10CAI00173", "A"), ("23FE10CAI00176", "A"), ("23FE10CAI00206", "A"), ("23FE10CAI00213", "A"), ("23FE10CAI00216", "B"), ("23FE10CAI00219", "B")]
    ]
    process_room(students, "214 (AB3)", grid_214, "AIM3241", "Natural Language Processing")

    # Save
    with open(JSON_PATH, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=4)

    print("Success! Manual Data written.")

if __name__ == "__main__":
    map_manual_data()
