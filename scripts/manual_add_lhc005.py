import json
import os

JSON_PATH = os.path.join("src", "data", "students.json")

def map_room():
    with open(JSON_PATH, "r", encoding="utf-8") as f:
        data = json.load(f)
    
    students = data["students"]

    room_name = "LHC-005"
    rows_count = 10
    cols_count = 9
    
    grid = [
        # COL A1
        [("23FE10CAI00045","E"), ("23FE10CAI00053","E"), ("23FE10CAI00075","E"), ("23FE10CAI00108","E"), ("23FE10CAI00109","E"),
         ("23FE10CAI00119","E"), ("23FE10CAI00159","E"), ("23FE10CAI00172","E"), ("23FE10CAI00175","E"), ("23FE10CAI00196","E")],
         
        # COL A2
        [("23FE10CAI00220","E"), ("23FE10CAI00227","E"), ("23FE10CAI00239","E"), ("23FE10CAI00240","E"), ("23FE10CAI00286","E"),
         ("23FE10CAI00288","E"), ("23FE10CAI00303","E"), ("23FE10CAI00309","E"), ("23FE10CAI00310","E"), ("23FE10CAI00319","E")],
         
        # COL A3
        [("23FE10CAI00337","E"), ("23FE10CAI00357","E"), ("23FE10CAI00359","E"), ("23FE10CAI00371","E"), ("23FE10CAI00375","E"),
         ("23FE10CAI00387","E"), ("23FE10CAI00390","E"), ("23FE10CAI00392","E"), ("23FE10CAI00412","E"), ("23FE10CAI00424","F")],
         
        # COL B1
        [("23FE10CAI00440","F"), ("23FE10CAI00441","F"), ("23FE10CAI00464","F"), ("23FE10CAI00467","F"), ("23FE10CAI00510","F"),
         ("23FE10CAI00516","F"), ("23FE10CAI00523","F"), ("23FE10CAI00535","F"), ("23FE10CAI00541","F"), ("23FE10CAI00564","F")],
         
        # COL B2
        [("23FE10CAI00594","F"), ("23FE10CAI00596","F"), ("23FE10CAI00609","F"), ("23FE10CAI00613","F"), ("23FE10CAI00010","F"),
         ("23FE10CAI00012","F"), ("23FE10CAI00030","F"), ("23FE10CAI00048","F"), ("23FE10CAI00063","F"), ("23FE10CAI00078","F")],
         
        # COL B3
        [("23FE10CAI00088","F"), ("23FE10CAI00094","F"), ("23FE10CAI00098","F"), ("23FE10CAI00101","F"), ("23FE10CAI00112","F"),
         ("23FE10CAI00114","F"), ("23FE10CAI00141","F"), ("23FE10CAI00170","F"), ("23FE10CAI00183","F"), ("23FE10CAI00184","F")],
         
        # COL C1
        [("23FE10CAI00190","F"), ("23FE10CAI00207","F"), ("23FE10CAI00208","F"), ("23FE10CAI00234","F"), ("23FE10CAI00237","F"),
         ("23FE10CAI00242","F"), ("23FE10CAI00251","F"), ("23FE10CAI00261","F"), ("23FE10CAI00277","F"), ("23FE10CAI00285","F")],
         
        # COL C2
        [("23FE10CAI00290","F"), ("23FE10CAI00348","F"), ("23FE10CAI00349","F"), ("23FE10CAI00353","F"), ("23FE10CAI00354","F"),
         ("23FE10CAI00388","F"), ("23FE10CAI00400","F"), ("23FE10CAI00432","F"), ("23FE10CAI00437","F"), ("23FE10CAI00445","F")],
         
        # COL C3
        [("23FE10CAI00451","F"), ("23FE10CAI00459","F"), ("23FE10CAI00461","F"), ("23FE10CAI00463","F"), ("23FE10CAI00475","F"),
         ("23FE10CAI00482","F"), ("23FE10CAI00487","F"), ("23FE10CAI00499","F"), ("23FE10CAI00504","F"), ("23FE10CAI00512","F")]
    ]
    
    missing = added = 0
    subject_code = "AIM3241"
    subject_name = "Natural Language Processing"
    
    for col_idx, col_data in enumerate(grid):
        for row_idx, (reg, sec) in enumerate(col_data):
            seat_index = (col_idx * rows_count) + row_idx
            
            exam_record = {
                "name": students.get(reg, {}).get("name", "Unknown Name"),
                "section": sec,
                "subjectCode": subject_code,
                "subject": subject_name,
                "room": room_name,
                "seatIndex": seat_index,
                "totalStudentsInRoom": 90,
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
    map_room()
