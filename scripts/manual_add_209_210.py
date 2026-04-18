import json
import os

JSON_PATH = os.path.join("src", "data", "students.json")

def process_room(students_db, room_name, grid):
    rows_count = 6
    cols_count = 5
    missing = added = 0
    
    for col_idx, col_data in enumerate(grid):
        for row_idx, (reg, sec, subject_code, subject_name) in enumerate(col_data):
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
    
    saom_code = "AIM3242"
    saom_name = "Sentiment Analysis and Opinion Mining"
    
    aics_code = "AIM3243"
    aics_name = "AI in Cyber Security"

    # ROOM 209 (All SEC D, SAOM)
    grid_209 = [
        [("23FE10CAI00596","D",saom_code,saom_name), ("23FE10CAI00609","D",saom_code,saom_name), ("23FE10CAI00012","D",saom_code,saom_name), ("23FE10CAI00030","D",saom_code,saom_name), ("23FE10CAI00063","D",saom_code,saom_name), ("23FE10CAI00078","D",saom_code,saom_name)],
        [("23FE10CAI00094","D",saom_code,saom_name), ("23FE10CAI00098","D",saom_code,saom_name), ("23FE10CAI00160","D",saom_code,saom_name), ("23FE10CAI00170","D",saom_code,saom_name), ("23FE10CAI00184","D",saom_code,saom_name), ("23FE10CAI00193","D",saom_code,saom_name)],
        [("23FE10CAI00208","D",saom_code,saom_name), ("23FE10CAI00242","D",saom_code,saom_name), ("23FE10CAI00277","D",saom_code,saom_name), ("23FE10CAI00285","D",saom_code,saom_name), ("23FE10CAI00353","D",saom_code,saom_name), ("23FE10CAI00354","D",saom_code,saom_name)],
        [("23FE10CAI00356","D",saom_code,saom_name), ("23FE10CAI00388","D",saom_code,saom_name), ("23FE10CAI00400","D",saom_code,saom_name), ("23FE10CAI00426","D",saom_code,saom_name), ("23FE10CAI00445","D",saom_code,saom_name), ("23FE10CAI00451","D",saom_code,saom_name)],
        [("23FE10CAI00455","D",saom_code,saom_name), ("23FE10CAI00461","D",saom_code,saom_name), ("23FE10CAI00475","D",saom_code,saom_name), ("23FE10CAI00499","D",saom_code,saom_name), ("23FE10CAI00512","D",saom_code,saom_name), ("23FE10CAI00519","D",saom_code,saom_name)]
    ]
    process_room(students, "209 (AB3)", grid_209)

    # ROOM 210 (Mixed SAOM and AICS)
    grid_210 = [
        [("23FE10CAI00525","D",saom_code,saom_name), ("23FE10CAI00555","D",saom_code,saom_name), ("23FE10CAI00614","D",saom_code,saom_name), ("23FE10CAI00617","D",saom_code,saom_name), ("23FE10CAI00003","C",aics_code,aics_name), ("23FE10CAI00016","C",aics_code,aics_name)],
        [("23FE10CAI00025","C",aics_code,aics_name), ("23FE10CAI00026","C",aics_code,aics_name), ("23FE10CAI00027","C",aics_code,aics_name), ("23FE10CAI00028","C",aics_code,aics_name), ("23FE10CAI00041","C",aics_code,aics_name), ("23FE10CAI00054","C",aics_code,aics_name)],
        [("23FE10CAI00087","C",aics_code,aics_name), ("23FE10CAI00110","C",aics_code,aics_name), ("23FE10CAI00111","C",aics_code,aics_name), ("23FE10CAI00113","C",aics_code,aics_name), ("23FE10CAI00137","C",aics_code,aics_name), ("23FE10CAI00162","C",aics_code,aics_name)],
        [("23FE10CAI00167","C",aics_code,aics_name), ("23FE10CAI00177","C",aics_code,aics_name), ("23FE10CAI00181","C",aics_code,aics_name), ("23FE10CAI00194","C",aics_code,aics_name), ("23FE10CAI00197","C",aics_code,aics_name), ("23FE10CAI00202","C",aics_code,aics_name)],
        [("23FE10CAI00210","C",aics_code,aics_name), ("23FE10CAI00228","C",aics_code,aics_name), ("23FE10CAI00250","C",aics_code,aics_name), ("23FE10CAI00276","C",aics_code,aics_name), ("23FE10CAI00281","C",aics_code,aics_name), ("23FE10CAI00291","C",aics_code,aics_name)]
    ]
    process_room(students, "210 (AB3)", grid_210)

    # Save
    with open(JSON_PATH, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=4)

    print("Success! Manual Data written.")

if __name__ == "__main__":
    run()
