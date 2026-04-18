import json
import os

JSON_PATH = os.path.join("src", "data", "students.json")

def map_room(students_db, room_name, grid, subject_code, subject_name, section):
    rows_count = 6
    cols_count = 5
    missing = added = 0
    
    for col_idx, col_data in enumerate(grid):
        for row_idx, reg in enumerate(col_data):
            seat_index = (col_idx * rows_count) + row_idx
            
            exam_record = {
                "name": students_db.get(reg, {}).get("name", "Unknown Name"),
                "section": section,
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

def run():
    with open(JSON_PATH, "r", encoding="utf-8") as f:
        data = json.load(f)
    
    students = data["students"]

    # ROOM 216
    grid_216 = [
        ["23FE10CAI00223","23FE10CAI00243","23FE10CAI00245","23FE10CAI00264","23FE10CAI00271","23FE10CAI00274"],
        ["23FE10CAI00279","23FE10CAI00296","23FE10CAI00311","23FE10CAI00332","23FE10CAI00334","23FE10CAI00336"],
        ["23FE10CAI00364","23FE10CAI00367","23FE10CAI00377","23FE10CAI00386","23FE10CAI00396","23FE10CAI00433"],
        ["23FE10CAI00436","23FE10CAI00476","23FE10CAI00486","23FE10CAI00493","23FE10CAI00518","23FE10CAI00530"],
        ["23FE10CAI00532","23FE10CAI00542","23FE10CAI00611","23FE10CAI00009","23FE10CAI00023","23FE10CAI00046"]
    ]
    map_room(students, "216 (AB3)", grid_216, "AIM3241", "Natural Language Processing", "B")

    # ROOM 217
    grid_217 = [
        ["23FE10CAI00077","23FE10CAI00099","23FE10CAI00106","23FE10CAI00107","23FE10CAI00122","23FE10CAI00130"],
        ["23FE10CAI00185","23FE10CAI00215","23FE10CAI00217","23FE10CAI00222","23FE10CAI00226","23FE10CAI00229"],
        ["23FE10CAI00236","23FE10CAI00254","23FE10CAI00268","23FE10CAI00294","23FE10CAI00304","23FE10CAI00316"],
        ["23FE10CAI00331","23FE10CAI00344","23FE10CAI00346","23FE10CAI00361","23FE10CAI00370","23FE10CAI00376"],
        ["23FE10CAI00384","23FE10CAI00397","23FE10CAI00407","23FE10CAI00409","23FE10CAI00410","23FE10CAI00416"]
    ]
    map_room(students, "217 (AB3)", grid_217, "AIM3241", "Natural Language Processing", "B")

    # Save
    with open(JSON_PATH, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=4)

    print("Success! Manual Data written.")

if __name__ == "__main__":
    run()
