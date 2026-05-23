import os
import sys

def find_reqs():
    sys.stdout.reconfigure(encoding='utf-8')
    overview_path = r"C:\Users\hazem\.gemini\antigravity\brain\27dea610-13f2-4183-8eba-8458b078a31d\.system_generated\logs\overview.txt"
    if not os.path.exists(overview_path):
        print("overview.txt not found!")
        return
        
    with open(overview_path, 'r', encoding='utf-8') as f:
        content = f.read()
        
    print("Total overview length:", len(content))
    
    # Let's search for "وثيقة المتطلبات الفنية وخطة العمل"
    query = "وثيقة المتطلبات الفنية وخطة العمل"
    matches = [m.start() for m in re.finditer(re.escape(query), content)]
    print(f"Found {len(matches)} occurrences at indices: {matches}")
    
    for i, idx in enumerate(matches):
        print(f"\n--- Match {i+1} at index {idx} ---")
        snippet = content[idx:idx+1000]
        print("Snippet:", snippet)
        
        # Let's check if this is the large prompt
        # We can search for the section headers in this match
        sub_text = content[idx:idx+25000]
        # Check if it has "الباب الأول"
        if "الباب الأول" in sub_text:
            print(">>> This match contains 'الباب الأول'!")
            # Let's find the end of this markdown block
            # For example, look for where the markdown block ends in the JSON/text
            # Let's save this match
            with open(f"extracted_reqs_match_{i+1}.md", "w", encoding="utf-8") as out:
                out.write(sub_text)
            print(f"Saved match {i+1} to extracted_reqs_match_{i+1}.md")

import re
if __name__ == "__main__":
    find_reqs()
