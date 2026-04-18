import json
import os

JSON_PATH = os.path.join("src", "data", "students.json")

def process_room(students_db, room_name, grid):
    rows_count = 11
    cols_count = 9
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
                "totalStudentsInRoom": 95,
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

    grid_lhc005 = [
        # COL A1 (SAOM SEC-B)
        [("23FE10CAI00370","B",saom_code,saom_name), ("23FE10CAI00376","B",saom_code,saom_name), ("23FE10CAI00384","B",saom_code,saom_name), ("23FE10CAI00407","B",saom_code,saom_name), ("23FE10CAI00410","B",saom_code,saom_name),
         ("23FE10CAI00417","B",saom_code,saom_name), ("23FE10CAI00418","B",saom_code,saom_name), ("23FE10CAI00456","B",saom_code,saom_name), ("23FE10CAI00458","B",saom_code,saom_name), ("23FE10CAI00502","B",saom_code,saom_name), ("23FE10CAI00508","B",saom_code,saom_name)],
         
        # COL A2 (SAOM SEC-B)
        [("23FE10CAI00526","B",saom_code,saom_name), ("23FE10CAI00529","B",saom_code,saom_name), ("23FE10CAI00556","B",saom_code,saom_name), ("23FE10CAI00565","B",saom_code,saom_name), ("23FE10CAI00575","B",saom_code,saom_name),
         ("23FE10CAI00590","B",saom_code,saom_name), ("23FE10CAI00597","B",saom_code,saom_name), ("23FE10CAI00608","B",saom_code,saom_name), ("23FE10CAI00022","B",saom_code,saom_name), ("23FE10CAI00074","B",saom_code,saom_name), ("23FE10CAI00142","B",saom_code,saom_name)],
         
        # COL A3 (SAOM SEC-B)
        [("23FE10CAI00200","B",saom_code,saom_name), ("23FE10CAI00233","B",saom_code,saom_name), ("23FE10CAI00241","B",saom_code,saom_name), ("23FE10CAI00255","B",saom_code,saom_name), ("23FE10CAI00256","B",saom_code,saom_name),
         ("23FE10CAI00259","B",saom_code,saom_name), ("23FE10CAI00269","B",saom_code,saom_name), ("23FE10CAI00297","B",saom_code,saom_name), ("23FE10CAI00320","B",saom_code,saom_name), ("23FE10CAI00322","B",saom_code,saom_name), ("23FE10CAI00325","B",saom_code,saom_name)],
         
        # COL B1 (SAOM SEC-B)
        [("23FE10CAI00335","B",saom_code,saom_name), ("23FE10CAI00343","B",saom_code,saom_name), ("23FE10CAI00347","B",saom_code,saom_name), ("23FE10CAI00366","B",saom_code,saom_name), ("23FE10CAI00372","B",saom_code,saom_name),
         ("23FE10CAI00389","B",saom_code,saom_name), ("23FE10CAI00408","B",saom_code,saom_name), ("23FE10CAI00444","B",saom_code,saom_name), ("23FE10CAI00457","B",saom_code,saom_name), ("23FE10CAI00462","B",saom_code,saom_name), ("23FE10CAI00473","B",saom_code,saom_name)],
         
        # COL B2 (Mixed SAOM SEC-B & SEC-C)
        [("23FE10CAI00474","B",saom_code,saom_name), ("23FE10CAI00497","B",saom_code,saom_name), ("23FE10CAI00511","B",saom_code,saom_name), ("23FE10CAI00515","B",saom_code,saom_name), ("23FE10CAI00528","B",saom_code,saom_name),
         ("23FE10CAI00546","B",saom_code,saom_name), ("23FE10CAI00559","B",saom_code,saom_name), ("23FE10CAI00576","B",saom_code,saom_name), ("23FE10CAI00036","C",saom_code,saom_name), ("23FE10CAI00039","C",saom_code,saom_name), ("23FE10CAI00059","C",saom_code,saom_name)],
         
        # COL B3 (SAOM SEC-C)
        [("23FE10CAI00061","C",saom_code,saom_name), ("23FE10CAI00069","C",saom_code,saom_name), ("23FE10CAI00127","C",saom_code,saom_name), ("23FE10CAI00134","C",saom_code,saom_name), ("23FE10CAI00155","C",saom_code,saom_name),
         ("23FE10CAI00157","C",saom_code,saom_name), ("23FE10CAI00205","C",saom_code,saom_name), ("23FE10CAI00231","C",saom_code,saom_name), ("23FE10CAI00232","C",saom_code,saom_name), ("23FE10CAI00266","C",saom_code,saom_name), ("23FE10CAI00282","C",saom_code,saom_name)],
         
        # COL C1 (SAOM SEC-C)
        [("23FE10CAI00289","C",saom_code,saom_name), ("23FE10CAI00329","C",saom_code,saom_name), ("23FE10CAI00351","C",saom_code,saom_name), ("23FE10CAI00362","C",saom_code,saom_name), ("23FE10CAI00452","C",saom_code,saom_name),
         ("23FE10CAI00483","C",saom_code,saom_name), ("23FE10CAI00485","C",saom_code,saom_name), ("23FE10CAI00492","C",saom_code,saom_name), ("23FE10CAI00545","C",saom_code,saom_name), ("23FE10CAI00557","C",saom_code,saom_name), ("23FE10CAI00560","C",saom_code,saom_name)],
         
        # COL C2 (SAOM SEC-C)
        [("23FE10CAI00572","C",saom_code,saom_name), ("23FE10CAI00584","C",saom_code,saom_name), ("23FE10CAI00586","C",saom_code,saom_name), ("23FE10CAI00015","C",saom_code,saom_name), ("23FE10CAI00024","C",saom_code,saom_name),
         ("23FE10CAI00072","C",saom_code,saom_name), ("23FE10CAI00083","C",saom_code,saom_name), ("23FE10CAI00085","C",saom_code,saom_name), ("23FE10CAI00102","C",saom_code,saom_name), ("23FE10CAI00105","C",saom_code,saom_name), ("23FE10CAI00124","C",saom_code,saom_name)],
         
        # COL C3 (Mixed SAOM SEC-C & AICS SEC-B)
        [("23FE10CAI00136","C",saom_code,saom_name), ("23FE10CAI00139","C",saom_code,saom_name), ("23FE10CAI00538","B",aics_code,aics_name), ("23FE10CAI00547","B",aics_code,aics_name), ("23FE10CAI00548","B",aics_code,aics_name),
         ("23FE10CAI00562","B",aics_code,aics_name), ("23FE10CAI00610","B",aics_code,aics_name)]
    ]
    
    process_room(students, "LHC-005", grid_lhc005)

    # Save
    with open(JSON_PATH, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=4)

    print("Success! Manual Data written.")

if __name__ == "__main__":
    run()
