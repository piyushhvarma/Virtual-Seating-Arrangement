import json
import os

JSON_PATH = os.path.join("src", "data", "students.json")

def process_room(students_db, room_name, section_color_map, grid):
    rows_count = 6
    cols_count = 5
    
    missing = 0
    added = 0
    
    # grid is list of columns, each column is a list of tuples (regNo, section)
    for col_idx, col_data in enumerate(grid):
        for row_idx, (reg, sec) in enumerate(col_data):
            seat_index = (col_idx * rows_count) + row_idx
            
            exam_record = {
                "name": students_db.get(reg, {}).get("name", "Unknown Name"),
                "section": sec,
                "subjectCode": "AIM3240",
                "subject": "Computer Vision",
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

def map_manual_data():
    with open(JSON_PATH, "r", encoding="utf-8") as f:
        data = json.load(f)
    
    students = data["students"]

    # ROOM 207 (AB3)
    grid_207 = [
        [("23FE10CAI00006", "A"), ("23FE10CAI00117", "A"), ("23FE10CAI00125", "A"), ("23FE10CAI00126", "A"), ("23FE10CAI00128", "A"), ("23FE10CAI00148", "A")],
        [("23FE10CAI00191", "A"), ("23FE10CAI00278", "A"), ("23FE10CAI00283", "A"), ("23FE10CAI00301", "A"), ("23FE10CAI00305", "A"), ("23FE10CAI00306", "A")],
        [("23FE10CAI00317", "A"), ("23FE10CAI00326", "A"), ("23FE10CAI00342", "A"), ("23FE10CAI00352", "A"), ("23FE10CAI00365", "A"), ("23FE10CAI00413", "A")],
        [("23FE10CAI00605", "A"), ("23FE10CAI00029", "A"), ("23FE10CAI00065", "A"), ("23FE10CAI00071", "A"), ("23FE10CAI00084", "A"), ("23FE10CAI00131", "A")],
        [("23FE10CAI00179", "A"), ("23FE10CAI00198", "A"), ("23FE10CAI00211", "A"), ("23FE10CAI00252", "A"), ("23FE10CAI00257", "A"), ("23FE10CAI00293", "A")]
    ]
    process_room(students, "207 (AB3)", "A", grid_207)

    # ROOM 208 (AB3)
    grid_208 = [
        [("23FE10CAI00373", "A"), ("23FE10CAI00379", "A"), ("23FE10CAI00403", "A"), ("23FE10CAI00454", "A"), ("23FE10CAI00460", "A"), ("23FE10CAI00470", "A")],
        [("23FE10CAI00471", "A"), ("23FE10CAI00472", "A"), ("23FE10CAI00478", "A"), ("23FE10CAI00500", "A"), ("23FE10CAI00595", "A"), ("23FE10CAI00017", "A")],
        [("23FE10CAI00068", "A"), ("23FE10CAI00093", "A"), ("23FE10CAI00123", "A"), ("23FE10CAI00146", "A"), ("23FE10CAI00152", "A"), ("23FE10CAI00263", "A")],
        [("23FE10CAI00300", "A"), ("23FE10CAI00307", "A"), ("23FE10CAI00338", "A"), ("23FE10CAI00358", "A"), ("23FE10CAI00360", "A"), ("23FE10CAI00393", "A")],
        [("23FE10CAI00394", "A"), ("23FE10CAI00529", "A"), ("23FE10CAI00556", "A"), ("23FE10CAI00590", "A"), ("23FE10CAI00001", "A"), ("23FE10CAI00138", "A")]
    ]
    process_room(students, "208 (AB3)", "A", grid_208)

    # ROOM 209 (AB3)
    grid_209 = [
        [("23FE10CAI00259", "A"), ("23FE10CAI00312", "A"), ("23FE10CAI00320", "A"), ("23FE10CAI00335", "A"), ("23FE10CAI00372", "A"), ("23FE10CAI00383", "A")],
        [("23FE10CAI00408", "A"), ("23FE10CAI00474", "A"), ("23FE10CAI00528", "A"), ("23FE10CAI00562", "A"), ("23FE10CAI00016", "B"), ("23FE10CAI00025", "B")],
        [("23FE10CAI00028", "B"), ("23FE10CAI00113", "B"), ("23FE10CAI00134", "B"), ("23FE10CAI00155", "B"), ("23FE10CAI00250", "B"), ("23FE10CAI00266", "B")],
        [("23FE10CAI00282", "B"), ("23FE10CAI00289", "B"), ("23FE10CAI00351", "B"), ("23FE10CAI00374", "B"), ("23FE10CAI00443", "B"), ("23FE10CAI00452", "B")],
        [("23FE10CAI00480", "B"), ("23FE10CAI00485", "B"), ("23FE10CAI00531", "B"), ("23FE10CAI00086", "B"), ("23FE10CAI00102", "B"), ("23FE10CAI00105", "B")]
    ]
    process_room(students, "209 (AB3)", "A", grid_209)

    # ROOM 210 (AB3)
    grid_210 = [
        [("23FE10CAI00124", "B"), ("23FE10CAI00144", "B"), ("23FE10CAI00163", "B"), ("23FE10CAI00270", "B"), ("23FE10CAI00284", "B"), ("23FE10CAI00399", "B")],
        [("23FE10CAI00402", "B"), ("23FE10CAI00411", "B"), ("23FE10CAI00428", "B"), ("23FE10CAI00465", "B"), ("23FE10CAI00522", "B"), ("23FE10CAI00019", "B")],
        [("23FE10CAI00047", "B"), ("23FE10CAI00153", "B"), ("23FE10CAI00166", "B"), ("23FE10CAI00168", "B"), ("23FE10CAI00180", "B"), ("23FE10CAI00225", "B")],
        [("23FE10CAI00253", "B"), ("23FE10CAI00258", "B"), ("23FE10CAI00262", "B"), ("23FE10CAI00292", "B"), ("23FE10CAI00423", "B"), ("23FE10CAI00425", "B")],
        [("23FE10CAI00446", "B"), ("23FE10CAI00524", "B"), ("23FE10CAI00540", "B"), ("23FE10CAI00566", "B"), ("23FE10CAI00578", "B"), ("23FE10CAI00592", "B")]
    ]
    process_room(students, "210 (AB3)", "B", grid_210)

    # Save
    with open(JSON_PATH, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=4)

    print("Success! Manual Data written.")

if __name__ == "__main__":
    map_manual_data()
