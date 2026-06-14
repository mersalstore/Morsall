import ftplib
import io
import sys
sys.stdout.reconfigure(encoding='utf-8', errors='replace')

ftp = ftplib.FTP("82.198.228.182")
ftp.login("u754458241.morsall.com", "l$9Qs3i]g0y]/V~k")
ftp.cwd("/nodejs")

# List log files in nodejs
print("=== Log-like files in /nodejs ===")
items = []
ftp.retrlines("LIST", items.append)
log_candidates = []
for i in items:
    if any(k in i.lower() for k in ['.log', 'stderr', 'passenger']):
        parts = i.split()
        name = parts[-1] if parts else ''
        size = parts[4] if len(parts) > 4 else '?'
        log_candidates.append((name, size, i))
        print(i)

# Read most relevant logs - take tails
for name, size, full in log_candidates[:5]:
    if size == '0' or not name.endswith(('.log', '.txt')):
        continue
    print(f"\n=== {name} (tail 4KB) ===")
    try:
        size_int = int(size)
        rest_arg = max(0, size_int - 4096)
        buf = io.BytesIO()
        ftp.voidcmd("TYPE I")
        ftp.retrbinary(f"RETR {name}", buf.write, rest=rest_arg)
        content = buf.getvalue().decode("utf-8", errors="ignore")
        # Redact mysql:// URLs
        import re
        content = re.sub(r'mysql://[^@\s]+@', 'mysql://[REDACTED]@', content)
        content = re.sub(r'DATABASE_URL\s*=\s*\S+', 'DATABASE_URL=[REDACTED]', content)
        print(content)
    except Exception as e:
        print(f"Error reading {name}: {e}")

ftp.quit()
print("DONE")
