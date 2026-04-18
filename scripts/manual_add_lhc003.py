import json
import os

JSON_PATH = os.path.join("src", "data", "students.json")

def process_room(students_db, room_name, grid, subject_code, subject_name):
    rows_count = 11
    cols_count = 9
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
                "totalStudentsInRoom": 95,
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

    room_name = "LHC-003"
    
    grid = [
        # COL A1
        [("23FE10CAI00519","F"), ("23FE10CAI00536","F"), ("23FE10CAI00543","F"), ("23FE10CAI00555","F"), ("23FE10CAI00617","F"),
         ("23FE10CAI00265","E"), ("23FE10CAI00267","E"), ("23FE10CAI00275","E"), ("23FE10CAI00295","E"), ("23FE10CAI00298","E"), ("23FE10CAI00299","E")],
        
        # COL A2
        [("23FE10CAI00313","E"), ("23FE10CAI00315","E"), ("23FE10CAI00318","E"), ("23FE10CAI00323","E"), ("23FE10CAI00339","E"),
         ("23FE10CAI00340","E"), ("23FE10CAI00378","E"), ("23FE10CAI00380","E"), ("23FE10CAI00382","E"), ("23FE10CAI00414","E"), ("23FE10CAI00419","E")],
         
        # COL A3
        [("23FE10CAI00448","E"), ("23FE10CAI00450","E"), ("23FE10CAI00453","E"), ("23FE10CAI00481","E"), ("23FE10CAI00495","E"),
         ("23FE10CAI00498","E"), ("23FE10CAI00513","E"), ("23FE10CAI00527","E"), ("23FE10CAI00539","E"), ("23FE10CAI00550","E"), ("23FE10CAI00552","E")],
         
        # COL B1
        [("23FE10CAI00563","E"), ("23FE10CAI00571","E"), ("23FE10CAI00574","E"), ("23FE10CAI00577","E"), ("23FE10CAI00582","E"),
         ("23FE10CAI00591","E"), ("23FE10CAI00004","E"), ("23FE10CAI00013","E"), ("23FE10CAI00014","E"), ("23FE10CAI00020","E"), ("23FE10CAI00031","E")],
         
        # COL B2
        [("23FE10CAI00167","D"), ("23FE10CAI00177","D"), ("23FE10CAI00181","D"), ("23FE10CAI00194","D"), ("23FE10CAI00197","D"),
         ("23FE10CAI00202","D"), ("23FE10CAI00205","D"), ("23FE10CAI00210","D"), ("23FE10CAI00228","D"), ("23FE10CAI00231","D"), ("23FE10CAI00232","D")],
         
        # COL B3
        [("23FE10CAI00276","D"), ("23FE10CAI00281","D"), ("23FE10CAI00291","D"), ("23FE10CAI00302","D"), ("23FE10CAI00329","D"),
         ("23FE10CAI00330","D"), ("23FE10CAI00362","D"), ("23FE10CAI00406","D"), ("23FE10CAI00421","D"), ("23FE10CAI00430","D"), ("23FE10CAI00439","D")],
         
        # COL C1
        [("23FE10CAI00483","D"), ("23FE10CAI00492","D"), ("23FE10CAI00494","D"), ("23FE10CAI00505","D"), ("23FE10CAI00545","D"),
         ("23FE10CAI00557","D"), ("23FE10CAI00560","D"), ("23FE10CAI00572","D"), ("23FE10CAI00580","D"), ("23FE10CAI00584","D"), ("23FE10CAI00586","D")],
         
        # COL C2
        [("23FE10CAI00587","D"), ("23FE10CAI00007","D"), ("23FE10CAI00011","D"), ("23FE10CAI00015","D"), ("23FE10CAI00024","D"),
         ("23FE10CAI00072","D"), ("23FE10CAI00083","D"), ("23FE10CAI00085","D"), ("23FE10CAI00100","D"), ("23FE10CAI00136","D"), ("23FE10CAI00139","D")],
         
        # COL C3
        [("23FE10CAI00145","D"), ("23FE10CAI00154","D"), ("23FE10CAI00188","D"), ("23FE10CAI00189","D"), ("23FE10CAI00199","D"),
         ("23FE10CAI00248","D"), ("23FE10CAI00260","D")]
    ]
    
    process_room(students, room_name, grid, "AIM3241", "Natural Language Processing")

    # Save
    with open(JSON_PATH, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=4)

    print("Success! Manual Data written.")

if __name__ == "__main__":
    run()
