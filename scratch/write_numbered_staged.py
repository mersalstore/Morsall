try:
    with open("scratch/staged_LogisticsTab.tsx", "r", encoding="utf-8") as f:
        content = f.read()
        
    lines = content.splitlines()
    
    # Save a filtered copy of the file with line numbers
    output_lines = []
    for idx, l in enumerate(lines):
        output_lines.append(f"{idx+1}: {l}\n")
        
    with open("scratch/staged_numbered.txt", "w", encoding="utf-8") as out_f:
        out_f.writelines(output_lines)
    print("Saved numbered staged file to scratch/staged_numbered.txt")
except Exception as e:
    print(f"Error: {e}")
