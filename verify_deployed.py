import ftplib
import io
import sys
sys.stdout.reconfigure(encoding='utf-8', errors='replace')

ftp = ftplib.FTP("82.198.228.182")
ftp.login("u754458241.morsall.com", "l$9Qs3i]g0y]/V~k")

# Check the compiled subscribe-bank route on server for "rejected" keyword
path = "/nodejs/.next/server/app/api/vendor/subscribe-bank/route.js"
buf = io.BytesIO()
try:
    ftp.retrbinary(f"RETR {path}", buf.write)
    content = buf.getvalue().decode("utf-8", errors="ignore")
    print(f"File size: {len(content)} bytes")
    print(f"Has 'rejected': {'rejected' in content}")
    print(f"Has 'الإيصال غير صحيح': {'غير صحيح' in content}")
    print(f"Has 'shouldReject' logic: {'amountMissing' in content or 'shouldReject' in content}")
    # Find the reject message
    idx = content.find('غير صحيح')
    if idx > 0:
        snippet = content[max(0,idx-60):idx+60]
        print(f"Context: ...{snippet}...")
except Exception as e:
    print(f"Error: {e}")

ftp.quit()
print("DONE")
