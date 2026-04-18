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

    # ROOM 217
    grid_217 = [
        [("23FE10CAI00148","A"), ("23FE10CAI00151","A"), ("23FE10CAI00158","A"), ("23FE10CAI00191","A"), ("23FE10CAI00224","A"), ("23FE10CAI00244","A")],
        [("23FE10CAI00278","A"), ("23FE10CAI00283","A"), ("23FE10CAI00306","A"), ("23FE10CAI00317","A"), ("23FE10CAI00327","A"), ("23FE10CAI00342","A")],
        [("23FE10CAI00350","A"), ("23FE10CAI00365","A"), ("23FE10CAI00447","A"), ("23FE10CAI00468","A"), ("23FE10CAI00533","A"), ("23FE10CAI00537","A")],
        [("23FE10CAI00549","A"), ("23FE10CAI00558","A"), ("23FE10CAI00567","A"), ("23FE10CAI00029","A"), ("23FE10CAI00034","A"), ("23FE10CAI00051","A")],
        [("23FE10CAI00065","A"), ("23FE10CAI00071","A"), ("23FE10CAI00084","A"), ("23FE10CAI00097","A"), ("23FE10CAI00103","A"), ("23FE10CAI00131","A")]
    ]
    process_room(students, "217 (AB3)", grid_217, aics_code, aics_name)

    # ROOM 218
    grid_218 = [
        [("23FE10CAI00179","A"), ("23FE10CAI00206","A"), ("23FE10CAI00211","A"), ("23FE10CAI00216","A"), ("23FE10CAI00223","A"), ("23FE10CAI00243","A")],
        [("23FE10CAI00245","A"), ("23FE10CAI00252","A"), ("23FE10CAI00296","A"), ("23FE10CAI00334","A"), ("23FE10CAI00377","A"), ("23FE10CAI00386","A")],
        [("23FE10CAI00396","A"), ("23FE10CAI00436","A"), ("23FE10CAI00454","A"), ("23FE10CAI00460","A"), ("23FE10CAI00472","A"), ("23FE10CAI00476","A")],
        [("23FE10CAI00478","A"), ("23FE10CAI00486","A"), ("23FE10CAI00518","A"), ("23FE10CAI00530","A"), ("23FE10CAI00532","A"), ("23FE10CAI00542","A")],
        [("23FE10CAI00595","A"), ("23FE10CAI00023","A"), ("23FE10CAI00046","A"), ("23FE10CAI00068","A"), ("23FE10CAI00077","A"), ("23FE10CAI00093","B")]
    ]
    process_room(students, "218 (AB3)", grid_218, aics_code, aics_name)

    # Save
    with open(JSON_PATH, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=4)

    print("Success! Manual Data written.")

if __name__ == "__main__":
    run()
