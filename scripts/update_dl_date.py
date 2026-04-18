import json
import os

JSON_PATH = os.path.join("src", "data", "students.json")

def update_date():
    if not os.path.exists(JSON_PATH):
        print("Error: students.json not found.")
        return

    with open(JSON_PATH, "r", encoding="utf-8") as f:
        data = json.load(f)
    
    students = data.get("students", {})
    count = 0
    
    for reg, info in students.items():
        exams = info.get("exams", [])
        for exam in exams:
            # Check if subject is Deep Learning (could be 'DeepLearning' or 'Deep Learning')
            if "Deep" in exam.get("subject", ""):
                exam["examDate"] = "20-04-2026"
                count += 1
                
    with open(JSON_PATH, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=4)
    
    print(f"Successfully updated {count} Deep Learning records with date 20-04-2026.")

if __name__ == "__main__":
    update_date()
