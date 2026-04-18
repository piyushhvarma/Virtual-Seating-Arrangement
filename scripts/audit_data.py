import json
import os

JSON_PATH = os.path.join("src", "data", "students.json")

def audit():
    if not os.path.exists(JSON_PATH):
        print("Error: students.json not found.")
        return

    with open(JSON_PATH, "r", encoding="utf-8") as f:
        data = json.load(f)
    
    students = data.get("students", {})
    total_students = len(students)
    
    total_entries = 0
    count_map = {}
    
    for reg, info in students.items():
        exams = info.get("exams", [])
        exam_count = len(exams)
        total_entries += exam_count
        
        count_map[exam_count] = count_map.get(exam_count, 0) + 1
    
    print("--- Final Audit Report ---")
    print(f"Total Unique Students: {total_students}")
    print(f"Expected Entries (assuming 4 exams/student): {total_students * 4}")
    print(f"Actual Total Entries: {total_entries}")
    print("\n--- Breakdown by Exam Count ---")
    for count in sorted(count_map.keys()):
        print(f"Students with {count} exam(s): {count_map[count]}")
    
    print("\n--- Summary ---")
    if total_entries == total_students * 4:
        print("Status: 100% Data Integrity. Formula matches perfectly.")
    else:
        diff = (total_students * 4) - total_entries
        if diff > 0:
            print(f"Status: Missing {diff} entries to reach 4 exams per student.")
        else:
            print(f"Status: Excess entries found ({abs(diff)}). Some students might have extra exams.")

if __name__ == "__main__":
    audit()
