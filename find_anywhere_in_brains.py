import os
import sys

def search_brains():
    sys.stdout.reconfigure(encoding='utf-8')
    brain_dir = r"C:\Users\hazem\.gemini\antigravity\brain"
    if not os.path.exists(brain_dir):
        print("Brain directory not found!")
        return
        
    print("Searching for 'مشغل التحويل' in brain folders...")
    for root, dirs, files in os.walk(brain_dir):
        for file in files:
            if file.endswith(".txt") or file.endswith(".md"):
                full_path = os.path.join(root, file)
                try:
                    with open(full_path, 'r', encoding='utf-8', errors='ignore') as f:
                        content = f.read()
                    if "مشغل التحويل" in content or "الباب الأول" in content:
                        # Let's print out if it contains "truncated"
                        has_trunc = "truncated" in content[content.find("الباب الأول"):content.find("الباب الأول")+1000]
                        print(f"Found in: {full_path} | Size: {os.path.getsize(full_path)} | Has truncation snippet: {has_trunc}")
                        
                        # Let's see if this is the full requirements!
                        # If it has a long content and no truncation, let's write it to a clean file!
                        if not has_trunc:
                            idx = content.find("وثيقة المتطلبات الفنية")
                            if idx == -1:
                                idx = content.find("وثيقة المتمتطلبات الفنية")
                            if idx == -1:
                                idx = content.find("الباب الأول")
                                
                            sub_text = content[idx:idx+40000]
                            with open("Vixcell_Full_Logistics_And_Store_Requirements_Found.md", "w", encoding="utf-8") as out:
                                out.write(sub_text)
                            print("Saved found text to Vixcell_Full_Logistics_And_Store_Requirements_Found.md!")
                except Exception as e:
                    pass

if __name__ == "__main__":
    search_brains()
