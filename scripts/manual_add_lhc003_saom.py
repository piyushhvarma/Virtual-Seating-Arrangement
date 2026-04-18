import json
import os

JSON_PATH = os.path.join("src", "data", "students.json")

def process_room(students_db, room_name, grid, subject_code, subject_name):
    rows_count = 10
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
                "totalStudentsInRoom": 90,
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

    grid_lhc003 = [
        # COL A1
        [("23FE10CAI00040","A"), ("23FE10CAI00050","A"), ("23FE10CAI00057","A"), ("23FE10CAI00060","A"), ("23FE10CAI00064","A"),
         ("23FE10CAI00091","A"), ("23FE10CAI00096","A"), ("23FE10CAI00104","A"), ("23FE10CAI00118","A"), ("23FE10CAI00120","A")],
         
        # COL A2
        [("23FE10CAI00128","A"), ("23FE10CAI00133","A"), ("23FE10CAI00135","A"), ("23FE10CAI00150","A"), ("23FE10CAI00174","A"),
         ("23FE10CAI00187","A"), ("23FE10CAI00195","A"), ("23FE10CAI00214","A"), ("23FE10CAI00221","A"), ("23FE10CAI00247","A")],
         
        # COL A3
        [("23FE10CAI00249","A"), ("23FE10CAI00273","A"), ("23FE10CAI00301","A"), ("23FE10CAI00305","A"), ("23FE10CAI00324","A"),
         ("23FE10CAI00326","A"), ("23FE10CAI00352","A"), ("23FE10CAI00368","A"), ("23FE10CAI00395","A"), ("23FE10CAI00405","A")],
         
        # COL B1
        [("23FE10CAI00413","A"), ("23FE10CAI00420","A"), ("23FE10CAI00469","A"), ("23FE10CAI00484","A"), ("23FE10CAI00501","A"),
         ("23FE10CAI00507","A"), ("23FE10CAI00514","A"), ("23FE10CAI00520","A"), ("23FE10CAI00544","A"), ("23FE10CAI00561","A")],
         
        # COL B2
        [("23FE10CAI00573","A"), ("23FE10CAI00585","A"), ("23FE10CAI00605","A"), ("23FE10CAI00018","A"), ("23FE10CAI00032","A"),
         ("23FE10CAI00062","A"), ("23FE10CAI00066","A"), ("23FE10CAI00073","A"), ("23FE10CAI00092","A"), ("23FE10CAI00115","A")],
         
        # COL B3
        [("23FE10CAI00149","A"), ("23FE10CAI00156","A"), ("23FE10CAI00173","A"), ("23FE10CAI00176","A"), ("23FE10CAI00198","A"),
         ("23FE10CAI00213","A"), ("23FE10CAI00219","A"), ("23FE10CAI00257","A"), ("23FE10CAI00264","A"), ("23FE10CAI00271","A")],
         
        # COL C1
        [("23FE10CAI00274","A"), ("23FE10CAI00279","A"), ("23FE10CAI00293","A"), ("23FE10CAI00311","A"), ("23FE10CAI00332","A"),
         ("23FE10CAI00336","A"), ("23FE10CAI00364","A"), ("23FE10CAI00367","A"), ("23FE10CAI00373","A"), ("23FE10CAI00379","A")],
         
        # COL C2
        [("23FE10CAI00403","A"), ("23FE10CAI00433","B"), ("23FE10CAI00470","B"), ("23FE10CAI00471","B"), ("23FE10CAI00493","B"),
         ("23FE10CAI00500","B"), ("23FE10CAI00611","B"), ("23FE10CAI00009","B"), ("23FE10CAI00017","B"), ("23FE10CAI00122","B")],
         
        # COL C3
        [("23FE10CAI00146","B"), ("23FE10CAI00185","B"), ("23FE10CAI00217","B"), ("23FE10CAI00222","B"), ("23FE10CAI00226","B"),
         ("23FE10CAI00229","B"), ("23FE10CAI00236","B"), ("23FE10CAI00268","B"), ("23FE10CAI00304","B"), ("23FE10CAI00360","B")]
    ]
    
    process_room(students, "LHC-003", grid_lhc003, saom_code, saom_name)

    # Save
    with open(JSON_PATH, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=4)

    print("Success! Manual Data written.")

if __name__ == "__main__":
    run()
