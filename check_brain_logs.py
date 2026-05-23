import os
import sys

def check_logs():
    sys.stdout.reconfigure(encoding='utf-8')
    path = r"C:\Users\hazem\.gemini\antigravity\brain\27dea610-13f2-4183-8eba-8458b078a31d\.system_generated\logs"
    print("Checking path:", path)
    if os.path.exists(path):
        print("Directory exists!")
        files = os.listdir(path)
        print("Files:", files)
        
        # Let's inspect overview.txt if present
        overview_path = os.path.join(path, "overview.txt")
        if os.path.exists(overview_path):
            print("overview.txt exists, size:", os.path.getsize(overview_path))
            
            # Let's read first few lines or look for the user request
            with open(overview_path, 'r', encoding='utf-8') as f:
                content = f.read()
                
            print("Content length:", len(content))
            # Let's find "Document" or "وثيقة المتطلبات الفنية" in overview
            idx = content.find("وثيقة المتطلبات الفنية")
            if idx != -1:
                print("Found requirements start at index:", idx)
                # Let's write the requirements out to a clean file!
                req_text = content[idx:idx+35000] # Get a good chunk of text
                # We can refine it or just save it
                with open("restored_raw_reqs.txt", "w", encoding="utf-8") as out:
                    out.write(req_text)
                print("Saved raw requirements to restored_raw_reqs.txt!")
            else:
                print("Could not find requirements start in overview.txt.")
    else:
        print("Logs directory does not exist.")

if __name__ == "__main__":
    check_logs()
