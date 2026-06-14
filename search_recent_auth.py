with open("remote_stderr.log", "r", encoding="utf-8", errors="replace") as f:
    lines = f.readlines()

auth_errors = []
for i, line in enumerate(lines[-1500:]):
    abs_line = len(lines) - 1500 + i + 1
    if any(keyword in line.lower() for keyword in ["auth", "callback", "signin", "login", "session", "serialize"]):
        auth_errors.append((abs_line, line.strip()))

print(f"Found {len(auth_errors)} auth-related lines in the last 1500 lines:")
for num, content in auth_errors[-50:]:
    print(f"Line {num}: {content}")
