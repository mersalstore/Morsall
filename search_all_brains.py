import os
import sys

def search_brains():
    sys.stdout.reconfigure(encoding='utf-8')
    brain_dir = r"C:\Users\hazem\.gemini\antigravity\brain"
    if not os.path.exists(brain_dir):
        print("Brain directory not found!")
        return
        
    print("Scanning brain directory:", brain_dir)
    for folder in os.listdir(brain_dir):
        folder_path = os.path.join(brain_dir, folder)
        if not os.path.isdir(folder_path):
            continue
            
        overview_path = os.path.join(folder_path, ".system_generated", "logs", "overview.txt")
        if os.path.exists(overview_path):
            try:
                with open(overview_path, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                # Check for "وثيقة المتطلبات الفنية وخطة العمل"
                # But let's check if it doesn't contain "truncated" right after it,
                # or check if it contains "الباب الأول" and is long enough!
                if "وثيقة المتطلبات الفنية" in content and "الباب الأول" in content:
                    print(f"\n>>> Found candidate in folder {folder}! Size: {os.path.getsize(overview_path)}")
                    idx = content.find("وثيقة المتطلبات الفنية")
                    # Let's see if the next 1000 characters contain "truncated"
                    snippet = content[idx:idx+1000]
                    if "truncated" in snippet:
                        print("    But snippet contains 'truncated'. Skipping...")
                    else:
                        print("    Candidate is clean! Extracting...")
                        # Let's find the end of the requirements
                        # A good way is to search for where the requirements end,
                        # e.g. "الباب الخامس" or similar or just write out 40KB of it.
                        end_idx = content.find("الباب الخامس", idx)
                        if end_idx != -1:
                            # include some details of Bab 5
                            end_idx = content.find("\n", end_idx + 1000)
                            doc_text = content[idx:end_idx].strip()
                        else:
                            doc_text = content[idx:idx+35000].strip()
                            
                        # Clean escape characters if any
                        if "\\n" in doc_text:
                            doc_text = doc_text.replace("\\n", "\n").replace('\\"', '"')
                            
                        out_path = "Vixcell_Full_Logistics_And_Store_Requirements_Full.md"
                        with open(out_path, "w", encoding="utf-8") as out:
                            out.write(doc_text)
                        print(f"    Saved clean full requirements to {out_path}!")
                        return
            except Exception as e:
                print(f"Error reading {overview_path}: {e}")

if __name__ == "__main__":
    search_brains()
