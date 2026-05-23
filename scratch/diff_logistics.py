import difflib

try:
    with open("scratch/remote_LogisticsTab.tsx", "r", encoding="utf-8") as rf:
        remote_lines = rf.readlines()
    with open("src/components/admin/LogisticsTab.tsx", "r", encoding="utf-8") as lf:
        local_lines = lf.readlines()
        
    diff = difflib.unified_diff(remote_lines, local_lines, fromfile="remote", tofile="local")
    
    # Save diff to scratch/logistics_diff.txt
    with open("scratch/logistics_diff.txt", "w", encoding="utf-8") as df:
        df.writelines(diff)
    print("Diff generated and saved to scratch/logistics_diff.txt")
except Exception as e:
    print(f"Error: {e}")
