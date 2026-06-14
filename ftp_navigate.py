import ftplib

host = "82.198.228.182"
user = "u754458241.morsall.com"
pasw = "l$9Qs3i]g0y]/V~k"

ftp = ftplib.FTP(host)
ftp.login(user, pasw)
print(f"PWD: {ftp.pwd()}")

# Try going up
try:
    ftp.cwd("..")
    print(f"After cd ..: PWD={ftp.pwd()}")
    items = []
    ftp.retrlines("LIST", items.append)
    print("Items at parent level:")
    for i in items[:30]: print(f"  {i}")
except Exception as e:
    print(f"CD .. error: {e}")

# Try going to /nodejs
ftp.cwd("/")
for path in ["/nodejs", "/domains/morsall.com/nodejs", "../nodejs"]:
    try:
        ftp.cwd(path)
        print(f"\n✅ Got into {path}: PWD={ftp.pwd()}")
        items = []
        ftp.retrlines("LIST", items.append)
        for i in items[:5]: print(f"  {i}")
        ftp.cwd("/")
        break
    except Exception as e:
        print(f"❌ {path}: {e}")

ftp.quit()
print("DONE")
