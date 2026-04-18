import json
import os

JSON_PATH = os.path.join("src", "data", "students.json")

def sync_dates():
    if not os.path.exists(JSON_PATH):
        print("Error: students.json not found.")
        return

    with open(JSON_PATH, "r", encoding="utf-8") as f:
        data = json.load(f)
    
    students = data.get("students", {})
    
    # Mapping based on user request:
    # Deep Learning -> 20-04-2026
    # SAOM / AICS -> 28-04-2026
    # CV / NLP -> 30-04-2026
    # EXPAI / GENAI -> 02-05-2026
    
    date_map = {
        "Deep Learning": "20-04-2026",
        "DeepLearning": "20-04-2026",
        "Sentiment Analysis & Opinion Mining": "28-04-2026",
        "SAOM": "28-04-2026",
        "AI in Cyber Security": "28-04-2026",
        "AICS": "28-04-2026",
        "Computer Vision": "30-04-2026",
        "CV": "30-04-2026",
        "NLP": "30-04-2026",
        "Explainable AI": "02-05-2026",
        "EXPAI": "02-05-2026",
        "Generative AI": "02-05-2026",
        "GENAI": "02-05-2026"
    }
    
    updates = 0
    unique_subjects_found = set()
    
    for reg, info in students.items():
        exams = info.get("exams", [])
        for exam in exams:
            subj = exam.get("subject", "")
            unique_subjects_found.add(subj)
            
            # Find a match in date_map
            for key, date in date_map.items():
                if key.lower() in subj.lower():
                    exam["examDate"] = date
                    updates += 1
                    break
                
    with open(JSON_PATH, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=4)
    
    print(f"Successfully performed {updates} date updates.")
    print(f"Subjects found in database: {unique_subjects_found}")

if __name__ == "__main__":
    sync_dates()
