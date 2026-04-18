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
    
    sub_code = "AIM3242"
    sub_name = "Sentiment Analysis and Opinion Mining"

    # ROOM 207
    grid_207 = [
        [("23FE10CAI00144","C"), ("23FE10CAI00154","C"), ("23FE10CAI00163","C"), ("23FE10CAI00188","C"), ("23FE10CAI00248","C"), ("23FE10CAI00265","C")],
        [("23FE10CAI00270","C"), ("23FE10CAI00284","C"), ("23FE10CAI00295","C"), ("23FE10CAI00298","C"), ("23FE10CAI00299","C"), ("23FE10CAI00315","C")],
        [("23FE10CAI00323","C"), ("23FE10CAI00339","C"), ("23FE10CAI00340","C"), ("23FE10CAI00378","C"), ("23FE10CAI00380","C"), ("23FE10CAI00414","C")],
        [("23FE10CAI00428","C"), ("23FE10CAI00450","C"), ("23FE10CAI00453","C"), ("23FE10CAI00481","C"), ("23FE10CAI00495","C"), ("23FE10CAI00498","C")],
        [("23FE10CAI00513","C"), ("23FE10CAI00552","C"), ("23FE10CAI00571","C"), ("23FE10CAI00574","C"), ("23FE10CAI00591","C"), ("23FE10CAI00013","D")]
    ]
    process_room(students, "207 (AB3)", grid_207, sub_code, sub_name)

    # ROOM 208
    grid_208 = [
        [("23FE10CAI00014","D"), ("23FE10CAI00020","D"), ("23FE10CAI00031","D"), ("23FE10CAI00045","D"), ("23FE10CAI00047","D"), ("23FE10CAI00053","D")],
        [("23FE10CAI00108","D"), ("23FE10CAI00109","D"), ("23FE10CAI00159","D"), ("23FE10CAI00172","D"), ("23FE10CAI00225","D"), ("23FE10CAI00240","D")],
        [("23FE10CAI00309","D"), ("23FE10CAI00337","D"), ("23FE10CAI00359","D"), ("23FE10CAI00375","D"), ("23FE10CAI00387","D"), ("23FE10CAI00423","D")],
        [("23FE10CAI00424","D"), ("23FE10CAI00441","D"), ("23FE10CAI00446","D"), ("23FE10CAI00464","D"), ("23FE10CAI00467","D"), ("23FE10CAI00510","D")],
        [("23FE10CAI00540","D"), ("23FE10CAI00541","D"), ("23FE10CAI00564","D"), ("23FE10CAI00578","D"), ("23FE10CAI00592","D"), ("23FE10CAI00594","D")]
    ]
    process_room(students, "208 (AB3)", grid_208, sub_code, sub_name)

    # Save
    with open(JSON_PATH, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=4)

    print("Success! Manual Data written.")

if __name__ == "__main__":
    run()
