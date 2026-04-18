import json
import os

JSON_PATH = os.path.join("src", "data", "students.json")

def process_room(students_db, room_name, grid, exam_date, total_students):
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
                "totalStudentsInRoom": total_students,
                "rows": rows_count,
                "cols": cols_count,
                "examDate": exam_date,
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
    
    eai_code = "AIM3244"
    eai_name = "Explainable AI"
    
    genai_code = "AIM3245"
    genai_name = "Generative AI"
    
    exam_date = "02-05-2026"

    # LHC-003 Matrix
    grid_lhc003 = [
        # COL A1 (EAI Sec B)
        [("23FE10CAI00248","B",eai_code,eai_name), ("23FE10CAI00339","B",eai_code,eai_name), ("23FE10CAI00382","B",eai_code,eai_name), ("23FE10CAI00428","B",eai_code,eai_name), ("23FE10CAI00450","B",eai_code,eai_name),
         ("23FE10CAI00498","B",eai_code,eai_name), ("23FE10CAI00550","B",eai_code,eai_name), ("23FE10CAI00582","B",eai_code,eai_name), ("23FE10CAI00004","B",eai_code,eai_name), ("23FE10CAI00013","B",eai_code,eai_name), ("23FE10CAI00031","B",eai_code,eai_name)],
         
        # COL A2 (EAI Sec B)
        [("23FE10CAI00168","B",eai_code,eai_name), ("23FE10CAI00196","B",eai_code,eai_name), ("23FE10CAI00240","B",eai_code,eai_name), ("23FE10CAI00262","B",eai_code,eai_name), ("23FE10CAI00288","B",eai_code,eai_name),
         ("23FE10CAI00357","B",eai_code,eai_name), ("23FE10CAI00359","B",eai_code,eai_name), ("23FE10CAI00516","B",eai_code,eai_name), ("23FE10CAI00564","B",eai_code,eai_name), ("23FE10CAI00613","B",eai_code,eai_name), ("23FE10CAI00048","B",eai_code,eai_name)],
         
        # COL A3 (EAI Sec B)
        [("23FE10CAI00078","B",eai_code,eai_name), ("23FE10CAI00098","B",eai_code,eai_name), ("23FE10CAI00101","B",eai_code,eai_name), ("23FE10CAI00112","B",eai_code,eai_name), ("23FE10CAI00114","B",eai_code,eai_name),
         ("23FE10CAI00141","B",eai_code,eai_name), ("23FE10CAI00183","B",eai_code,eai_name), ("23FE10CAI00184","B",eai_code,eai_name), ("23FE10CAI00190","B",eai_code,eai_name), ("23FE10CAI00193","B",eai_code,eai_name), ("23FE10CAI00203","B",eai_code,eai_name)],
         
        # COL B1 (EAI Sec B)
        [("23FE10CAI00207","B",eai_code,eai_name), ("23FE10CAI00234","B",eai_code,eai_name), ("23FE10CAI00237","B",eai_code,eai_name), ("23FE10CAI00261","B",eai_code,eai_name), ("23FE10CAI00290","B",eai_code,eai_name),
         ("23FE10CAI00348","B",eai_code,eai_name), ("23FE10CAI00349","B",eai_code,eai_name), ("23FE10CAI00432","B",eai_code,eai_name), ("23FE10CAI00445","B",eai_code,eai_name), ("23FE10CAI00459","B",eai_code,eai_name), ("23FE10CAI00463","B",eai_code,eai_name)],
         
        # COL B2 (Mixed EAI Sec B / GENAI Sec A)
        [("23FE10CAI00482","B",eai_code,eai_name), ("23FE10CAI00487","B",eai_code,eai_name), ("23FE10CAI00525","B",eai_code,eai_name), ("23FE10CAI00536","B",eai_code,eai_name), ("23FE10CAI00002","A",genai_code,genai_name),
         ("23FE10CAI00040","A",genai_code,genai_name), ("23FE10CAI00050","A",genai_code,genai_name), ("23FE10CAI00057","A",genai_code,genai_name), ("23FE10CAI00060","A",genai_code,genai_name), ("23FE10CAI00091","A",genai_code,genai_name), ("23FE10CAI00096","A",genai_code,genai_name)],
         
        # COL B3 (GENAI Sec A)
        [("23FE10CAI00117","A",genai_code,genai_name), ("23FE10CAI00118","A",genai_code,genai_name), ("23FE10CAI00120","A",genai_code,genai_name), ("23FE10CAI00125","A",genai_code,genai_name), ("23FE10CAI00128","A",genai_code,genai_name),
         ("23FE10CAI00133","A",genai_code,genai_name), ("23FE10CAI00135","A",genai_code,genai_name), ("23FE10CAI00148","A",genai_code,genai_name), ("23FE10CAI00150","A",genai_code,genai_name), ("23FE10CAI00151","A",genai_code,genai_name), ("23FE10CAI00158","A",genai_code,genai_name)],
         
        # COL C1 (GENAI Sec A)
        [("23FE10CAI00174","A",genai_code,genai_name), ("23FE10CAI00187","A",genai_code,genai_name), ("23FE10CAI00191","A",genai_code,genai_name), ("23FE10CAI00195","A",genai_code,genai_name), ("23FE10CAI00214","A",genai_code,genai_name),
         ("23FE10CAI00221","A",genai_code,genai_name), ("23FE10CAI00247","A",genai_code,genai_name), ("23FE10CAI00273","A",genai_code,genai_name), ("23FE10CAI00278","A",genai_code,genai_name), ("23FE10CAI00301","A",genai_code,genai_name), ("23FE10CAI00305","A",genai_code,genai_name)],
         
        # COL C2 (GENAI Sec A)
        [("23FE10CAI00306","A",genai_code,genai_name), ("23FE10CAI00317","A",genai_code,genai_name), ("23FE10CAI00324","A",genai_code,genai_name), ("23FE10CAI00342","A",genai_code,genai_name), ("23FE10CAI00352","A",genai_code,genai_name),
         ("23FE10CAI00395","A",genai_code,genai_name), ("23FE10CAI00405","A",genai_code,genai_name), ("23FE10CAI00420","A",genai_code,genai_name), ("23FE10CAI00447","A",genai_code,genai_name), ("23FE10CAI00468","A",genai_code,genai_name), ("23FE10CAI00469","A",genai_code,genai_name)],
         
        # COL C3 (Mixed GENAI Sec A / Sec F)
        [("23FE10CAI00484","A",genai_code,genai_name), ("23FE10CAI00501","A",genai_code,genai_name), ("23FE10CAI00555","F",genai_code,genai_name), ("23FE10CAI00570","F",genai_code,genai_name), ("23FE10CAI00612","F",genai_code,genai_name),
         ("23FE10CAI00614","F",genai_code,genai_name), ("23FE10CAI00617","F",genai_code,genai_name)]
    ]
    
    process_room(students, "LHC-003", grid_lhc003, exam_date, 95)

    # Save
    with open(JSON_PATH, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=4)

    print("Success! Manual Data written for LHC-003 Mixed.")

if __name__ == "__main__":
    run()
