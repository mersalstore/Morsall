with open("remote_stderr.log", "r", encoding="utf-8", errors="replace") as f:
    lines = f.readlines()

start = max(0, 7750)
end = min(len(lines), 7850)

print("--- STACK TRACE FROM LINE 7750 TO 7850 ---")
for i in range(start, end):
    print(f"Line {i+1}: {lines[i].strip()}")
