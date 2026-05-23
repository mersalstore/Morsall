import os
import re

print("Starting scan...")
print("CWD:", os.getcwd())
if os.path.exists("src"):
    print("src exists!")
else:
    print("src does NOT exist!")
    
count = 0
for root, dirs, files in os.walk("src"):
    for file in files:
        if file.endswith((".tsx", ".ts", ".js", ".jsx", ".json")):
            fpath = os.path.join(root, file)
            count += 1
            try:
                with open(fpath, "r", encoding="utf-8") as f:
                    content = f.read()
                arabic = re.findall(r'[\u0600-\u06FF\u0750-\u077F]+', content)
                if arabic:
                    unique_words = list(set(arabic))[:5]
                    # Encode print to handle windows terminal encoding
                    print(f"{fpath}: scanned, found {len(arabic)} words, sample: {[w.encode('utf-8') for w in unique_words]}")
            except Exception as e:
                print(f"Error reading {fpath}: {e}")
                
print(f"Scanned {count} files.")
