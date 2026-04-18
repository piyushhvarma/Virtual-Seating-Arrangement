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

def run():
    with open(JSON_PATH, "r", encoding="utf-8") as f:
        data = json.load(f)
    
    students = data["students"]

    # ROOM 218
    grid_218 = [
        [("23FE10CAI00417","B"), ("23FE10CAI00418","B"), ("23FE10CAI00427","B"), ("23FE10CAI00434","B"), ("23FE10CAI00435","B"), ("23FE10CAI00456","B")],
        [("23FE10CAI00458","C"), ("23FE10CAI00488","C"), ("23FE10CAI00491","C"), ("23FE10CAI00502","C"), ("23FE10CAI00508","C"), ("23FE10CAI00509","C")],
        [("23FE10CAI00517","C"), ("23FE10CAI00526","C"), ("23FE10CAI00565","C"), ("23FE10CAI00575","C"), ("23FE10CAI00579","C"), ("23FE10CAI00597","C")],
        [("23FE10CAI00608","C"), ("23FE10CAI00008","C"), ("23FE10CAI00021","C"), ("23FE10CAI00022","C"), ("23FE10CAI00058","C"), ("23FE10CAI00074","C")],
        [("23FE10CAI00076","C"), ("23FE10CAI00081","C"), ("23FE10CAI00082","C"), ("23FE10CAI00142","C"), ("23FE10CAI00186","C"), ("23FE10CAI00200","C")]
    ]
    process_room(students, "218 (AB3)", grid_218, "AIM3241", "Natural Language Processing")

    # ROOM 219
    grid_219 = [
        [("23FE10CAI00204","C"), ("23FE10CAI00218","C"), ("23FE10CAI00233","C"), ("23FE10CAI00238","C"), ("23FE10CAI00241","C"), ("23FE10CAI00255","C")],
        [("23FE10CAI00256","C"), ("23FE10CAI00269","C"), ("23FE10CAI00272","C"), ("23FE10CAI00297","C"), ("23FE10CAI00314","C"), ("23FE10CAI00322","C")],
        [("23FE10CAI00325","C"), ("23FE10CAI00333","C"), ("23FE10CAI00343","C"), ("23FE10CAI00345","C"), ("23FE10CAI00347","C"), ("23FE10CAI00366","C")],
        [("23FE10CAI00381","C"), ("23FE10CAI00389","C"), ("23FE10CAI00391","C"), ("23FE10CAI00401","C"), ("23FE10CAI00415","C"), ("23FE10CAI00429","C")],
        [("23FE10CAI00431","C"), ("23FE10CAI00438","C"), ("23FE10CAI00444","C"), ("23FE10CAI00457","C"), ("23FE10CAI00462","C"), ("23FE10CAI00473","C")]
    ]
    process_room(students, "219 (AB3)", grid_219, "AIM3241", "Natural Language Processing")

    # Save
    with open(JSON_PATH, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=4)

    print("Success! Manual Data written.")

if __name__ == "__main__":
    run()
