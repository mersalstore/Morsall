with open("remote_stderr.log", "r", encoding="utf-8", errors="replace") as f:
    lines = f.readlines()

print(f"Total lines: {len(lines)}")
# Look at the last 300 lines and filter out urlencoded crash bodies
for i in range(len(lines) - 300, len(lines)):
    line = lines[i].strip()
    if len(line) > 0 and not "%0A" in line and not "body=" in line:
        print(f"Line {i+1}: {line}")
