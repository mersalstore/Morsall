import subprocess

try:
    print("Running git diff...")
    res = subprocess.run(["git", "diff", "src/components/admin/LogisticsTab.tsx"], capture_output=True, check=True)
    diff_bytes = res.stdout
    diff = diff_bytes.decode("utf-8", errors="ignore")
    print(f"Diff length: {len(diff)} characters")
    
    # Save to file
    with open("scratch/logistics_raw_diff.txt", "w", encoding="utf-8") as f:
        f.write(diff)
        
    # Look for sub-tabs or deleted lines
    lines = diff.splitlines()
    deleted_count = 0
    added_count = 0
    for l in lines:
        if l.startswith("-") and not l.startswith("---"):
            deleted_count += 1
            if "Tab" in l or "tab" in l or "تصفية" in l or "الأسطول" in l or "تسوية" in l:
                print("Deleted line:", l.encode("utf-8", errors="ignore"))
        elif l.startswith("+") and not l.startswith("+++"):
            added_count += 1
            
    print(f"Total deleted lines: {deleted_count}, added lines: {added_count}")
except Exception as e:
    print(f"Error: {e}")
