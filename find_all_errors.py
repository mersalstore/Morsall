with open("remote_stderr.log", "r", encoding="utf-8", errors="replace") as f:
    lines = f.readlines()

print(f"Total lines in stderr.log: {len(lines)}")

# Focus on the last 2000 lines
recent_lines = lines[-2000:]
recent_errors = []

for i, line in enumerate(recent_lines):
    # Absolute line number
    abs_line_num = len(lines) - 2000 + i + 1
    line_lower = line.lower()
    if any(keyword in line_lower for keyword in ["error", "exception", "prisma", "fail", "invalid", "reject", "auth", "login"]):
        # Filter out verbose warnings if needed, but let's keep them and show summary
        recent_errors.append((abs_line_num, line.strip()))

print(f"Found {len(recent_errors)} potential error/auth lines in the last 2000 lines. Saving to recent_errors.txt...")

with open("recent_errors.txt", "w", encoding="utf-8") as f:
    for num, content in recent_errors:
        f.write(f"Line {num}: {content}\n")

print("Done writing to recent_errors.txt")
