import pdfplumber
import sys

filename = sys.argv[1] if len(sys.argv) > 1 else 'SeatingPlan-AIM3201-DeepLearning.pdf'
print(f"--- Sampling {filename} ---")
try:
    with pdfplumber.open(filename) as pdf:
        page = pdf.pages[0]
        text = page.extract_text()
        print("--- EXTRACTED TEXT (First 1500 chars) ---")
        print(text[:1500] if text else "None")
        
        print("\n--- EXTRACTED TABLES ---")
        tables = page.extract_tables()
        if tables:
            for i, table in enumerate(tables):
                print(f"Table {i+1}:")
                for row in table[:10]: # Print first 10 rows
                    print(row)
        else:
            print("No tables found using default extraction.")
except Exception as e:
    print(f"Error: {e}")
