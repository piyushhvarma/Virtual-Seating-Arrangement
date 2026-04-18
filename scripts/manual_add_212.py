import json
import os

JSON_PATH = os.path.join("src", "data", "students.json")

def map_room_212():
    with open(JSON_PATH, "r", encoding="utf-8") as f:
        data = json.load(f)
    
    students = data["students"]

    room_name = "212 (AB3)"
    rows_count = 6
    cols_count = 5
    
    # Format: reg, section, subjectCode, subjectName
    grid_212 = [
        # COL 1 (CV)
        [("23FE10CAI00616", "B", "AIM3240", "Computer Vision"), ("23FE10CAI00042", "B", "AIM3240", "Computer Vision"),
         ("23FE10CAI00044", "B", "AIM3240", "Computer Vision"), ("23FE10CAI00070", "B", "AIM3240", "Computer Vision"),
         ("23FE10CAI00129", "B", "AIM3240", "Computer Vision"), ("23FE10CAI00140", "B", "AIM3240", "Computer Vision")],
        
        # COL 2 (CV)
        [("23FE10CAI00160", "B", "AIM3240", "Computer Vision"), ("23FE10CAI00193", "B", "AIM3240", "Computer Vision"),
         ("23FE10CAI00203", "B", "AIM3240", "Computer Vision"), ("23FE10CAI00209", "B", "AIM3240", "Computer Vision"),
         ("23FE10CAI00212", "B", "AIM3240", "Computer Vision"), ("23FE10CAI00328", "B", "AIM3240", "Computer Vision")],
        
        # COL 3 (CV)
        [("23FE10CAI00356", "B", "AIM3240", "Computer Vision"), ("23FE10CAI00398", "B", "AIM3240", "Computer Vision"),
         ("23FE10CAI00426", "B", "AIM3240", "Computer Vision"), ("23FE10CAI00455", "B", "AIM3240", "Computer Vision"),
         ("23FE10CAI00525", "B", "AIM3240", "Computer Vision"), ("23FE10CAI00570", "B", "AIM3240", "Computer Vision")],
         
        # COL 4 (Mixed)
        [("23FE10CAI00612", "B", "AIM3240", "Computer Vision"), ("23FE10CAI00614", "B", "AIM3240", "Computer Vision"),
         ("23FE10CAI00002", "A", "AIM3241", "Natural Language Processing"), ("23FE10CAI00040", "A", "AIM3241", "Natural Language Processing"),
         ("23FE10CAI00050", "A", "AIM3241", "Natural Language Processing"), ("23FE10CAI00055", "A", "AIM3241", "Natural Language Processing")],
         
        # COL 5 (NLP)
        [("23FE10CAI00057", "A", "AIM3241", "Natural Language Processing"), ("23FE10CAI00060", "A", "AIM3241", "Natural Language Processing"),
         ("23FE10CAI00064", "A", "AIM3241", "Natural Language Processing"), ("23FE10CAI00091", "A", "AIM3241", "Natural Language Processing"),
         ("23FE10CAI00096", "A", "AIM3241", "Natural Language Processing"), ("23FE10CAI00104", "A", "AIM3241", "Natural Language Processing")]
    ]
    
    missing = added = 0
    
    for col_idx, col_data in enumerate(grid_212):
        for row_idx, (reg, sec, subjCode, subjName) in enumerate(col_data):
            seat_index = (col_idx * rows_count) + row_idx
            
            exam_record = {
                "name": students.get(reg, {}).get("name", "Unknown Name"),
                "section": sec,
                "subjectCode": subjCode,
                "subject": subjName,
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

    print("Success! Manual Data written for 212.")

if __name__ == "__main__":
    map_room_212()
