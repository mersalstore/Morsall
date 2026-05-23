try:
    with open("scratch/staged_LogisticsTab.tsx", "r", encoding="utf-8") as f:
        content = f.read()
        
    lines = content.splitlines()
    print("Found activeSubTab matches in staged:")
    for idx, l in enumerate(lines):
        if "activeSubTab" in l or "fleet" in l or "financials" in l or "branches" in l:
            print(f"Line {idx+1}: {l.strip()[:120]}")
except Exception as e:
    print(f"Error: {e}")
