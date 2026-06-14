with open("remote_server.log", "r", encoding="utf-8", errors="replace") as f:
    lines = f.readlines()

auth_lines = []
for i, line in enumerate(lines):
    if "[AUTH]" in line or "[next-auth]" in line:
        auth_lines.append((i+1, line.strip()))

with open("auth_server_results.txt", "w", encoding="utf-8") as f:
    f.write(f"Found {len(auth_lines)} lines with [AUTH] or [next-auth] in server.log. Showing last 50:\n")
    for num, content in auth_lines[-50:]:
        f.write(f"Line {num}: {content}\n")

print("Done writing to auth_server_results.txt")
