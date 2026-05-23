import subprocess

try:
    print("Searching git commits for LogisticsTab.tsx...")
    res = subprocess.run(["git", "log", "--all", "--name-only", "--oneline"], capture_output=True, check=True)
    out = res.stdout.decode("utf-8", errors="ignore")
    lines = out.splitlines()
    found = []
    current_commit = ""
    for l in lines:
        if l and not l.startswith(" "):
            # This is a commit line: e.g. "645a767 Add Prisma test..."
            current_commit = l
        if "LogisticsTab.tsx" in l:
            found.append((current_commit, l))
            
    print(f"Found {len(found)} references:")
    for c, f in found:
        print(f"Commit: {c} -> {f}")
except Exception as e:
    print(f"Error: {e}")
