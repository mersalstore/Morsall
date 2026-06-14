import ftplib

host = "82.198.228.182"
user = "u754458241.morsall.com"
pasw = "l$9Qs3i]g0y]/V~k"

ftp = ftplib.FTP(host)
ftp.login(user, pasw)
print(f"PWD: {ftp.pwd()}")

# List root
print("\n--- ROOT ---")
files = []
ftp.retrlines("LIST", files.append)
for f in files:
    print(f)

# Try common paths
for path in ["/nodejs", "/domains/morsall.com/nodejs", "/public_html"]:
    print(f"\n--- {path} ---")
    try:
        ftp.cwd(path)
        files = []
        ftp.retrlines("LIST", files.append)
        # Show first 20 + any .log files
        for f in files[:20]:
            print(f)
        log_files = [f for f in files if '.log' in f.lower()]
        if log_files:
            print("LOGS FOUND:")
            for f in log_files:
                print(f"  {f}")
    except Exception as e:
        print(f"Error: {e}")
    ftp.cwd("/")

ftp.quit()
