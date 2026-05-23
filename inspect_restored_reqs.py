import re
import json
import sys

def extract_clean_reqs():
    sys.stdout.reconfigure(encoding='utf-8')
    # Let's read overview.txt directly and search for the user's requirements document!
    overview_path = r"C:\Users\hazem\.gemini\antigravity\brain\27dea610-13f2-4183-8eba-8458b078a31d\.system_generated\logs\overview.txt"
    if not os.path.exists(overview_path):
        print("overview.txt not found!")
        return
        
    with open(overview_path, 'r', encoding='utf-8') as f:
        content = f.read()
        
    # Search for the prompt of user request #1 which contains the entire requirements doc!
    # Let's search for " وثيقة المتمتطلبات الفنية" or "📄 وثيقة المتطلبات الفنية" or similar
    start_tag = "📄 وثيقة المتطلبات الفنية وخطة العمل التنفيذية الشاملة للمشروع"
    idx = content.find(start_tag)
    if idx == -1:
        start_tag = "وثيقة المتطلبات الفنية وخطة العمل التنفيذية الشاملة للمشروع"
        idx = content.find(start_tag)
        
    if idx != -1:
        print("Found matching requirements document at index:", idx)
        # Let's extract until we find the end of the prompt or a specific landmark
        # For example, "---" or "..." or the end of the user request
        end_landmark = "You have the 197 following artifacts"
        end_idx = content.find(end_landmark, idx)
        if end_idx != -1:
            doc_text = content[idx:end_idx].strip()
        else:
            doc_text = content[idx:idx+30000].strip()
            
        # Clean up escaping if any (e.g. \n, \", etc.)
        # Let's see if there are escape sequences
        if "\\n" in doc_text:
            doc_text = doc_text.replace("\\n", "\n").replace('\\"', '"')
            
        with open("Vixcell_Full_Logistics_And_Store_Requirements_Clean.md", "w", encoding="utf-8") as out:
            out.write(doc_text)
        print("Successfully saved clean requirements to Vixcell_Full_Logistics_And_Store_Requirements_Clean.md!")
    else:
        print("Could not find requirements document in logs!")

import os
if __name__ == "__main__":
    extract_clean_reqs()
