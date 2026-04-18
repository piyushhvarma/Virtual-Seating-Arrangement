import json
import os

JSON_PATH = os.path.join("src", "data", "students.json")

def run():
    with open(JSON_PATH, "r", encoding="utf-8") as f:
        data = json.load(f)
    
    students = data["students"]

    room_name = "220 (AB3)"
    rows_count = 6
    cols_count = 5
    
    # FORMAT: (reg, section)
    grid_220 = [
        [("23FE10CAI00477","C"), ("23FE10CAI00497","C"), ("23FE10CAI00503","C"), ("23FE10CAI00506","C"), ("23FE10CAI00511","C"), ("23FE10CAI00515","C")],
        [("23FE10CAI00538","C"), ("23FE10CAI00546","C"), ("23FE10CAI00547","C"), ("23FE10CAI00548","C"), ("23FE10CAI00559","C"), ("23FE10CAI00576","C")],
        [("23FE10CAI00610","C"), ("23FE10CAI00003","D"), ("23FE10CAI00026","D"), ("23FE10CAI00027","D"), ("23FE10CAI00036","D"), ("23FE10CAI00039","D")],
        [("23FE10CAI00041","D"), ("23FE10CAI00054","D"), ("23FE10CAI00059","D"), ("23FE10CAI00061","D"), ("23FE10CAI00069","D"), ("23FE10CAI00087","D")],
        [("23FE10CAI00110","D"), ("23FE10CAI00111","D"), ("23FE10CAI00127","D"), ("23FE10CAI00137","D"), ("23FE10CAI00157","D"), ("23FE10CAI00162","D")]
    ]
    
    missing = added = 0
    
    for col_idx, col_data in enumerate(grid_220):
        for row_idx, (reg, sec) in enumerate(col_data):
            seat_index = (col_idx * rows_count) + row_idx
            
            exam_record = {
                "name": students.get(reg, {}).get("name", "Unknown Name"),
                "section": sec,
                "subjectCode": "AIM3241",
                "subject": "Natural Language Processing",
                "room": room_name,
                "seatIndex": seat_index,
                "totalStudentsInRoom": 30,
                "rows": rows_count,
                "cols": cols_count,
                "examDate": "30-04-2026",
                "examTime": "TBD"
            }
            
            if reg not in students:
                missing += 1
                students[reg] = {"name": "Unknown", "exams": []}
                
            students[reg]["exams"].append(exam_record)
            added += 1
            
    print(f"Room {room_name}: Added {added} records, {missing} new students created.")

    # Save
    with open(JSON_PATH, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=4)

    print("Success! Manual Data written.")

if __name__ == "__main__":
    run()
