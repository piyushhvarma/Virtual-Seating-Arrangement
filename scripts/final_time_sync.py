import json
import os

JSON_PATH = os.path.join("src", "data", "students.json")

def sync_time():
    if not os.path.exists(JSON_PATH):
        print("Error: students.json not found.")
        return

    with open(JSON_PATH, "r", encoding="utf-8") as f:
        data = json.load(f)
    
    students = data.get("students", {})
    updates = 0
    
    for reg, info in students.items():
        exams = info.get("exams", [])
        for exam in exams:
            exam["examTime"] = "1:30pm - 4:30pm"
            updates += 1
                
    with open(JSON_PATH, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=4)
    
    print(f"Successfully updated {updates} exam time records to '1:30pm - 4:30pm'.")

if __name__ == "__main__":
    sync_time()
