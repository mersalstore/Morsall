import os
import sys

def search_files():
    sys.stdout.reconfigure(encoding='utf-8')
    brain_dir = r"C:\Users\hazem\.gemini\antigravity\brain"
    if not os.path.exists(brain_dir):
        print("Brain directory not found!")
        return
        
    print("Searching for files named Vixcell_Full_Logistics_And_Store_Requirements.md in brain directory...")
    found = []
    for root, dirs, files in os.walk(brain_dir):
        for file in files:
            if "Vixcell" in file or "Requirements" in file:
                full_path = os.path.join(root, file)
                print("Found file:", full_path, "Size:", os.path.getsize(full_path))
                found.append(full_path)
                
    if not found:
        print("No files found by name.")
    else:
        # Let's read the largest one and see if it's clean
        # Let's inspect their sizes
        for path in found:
            with open(path, 'r', encoding='utf-8', errors='ignore') as f:
                head = f.read(500)
            print(f"File: {path}\nHead: {head[:200]}")

if __name__ == "__main__":
    search_files()
