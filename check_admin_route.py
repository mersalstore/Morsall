import ftplib
ftp = ftplib.FTP("82.198.228.182")
ftp.login("u754458241.morsall.com", "l$9Qs3i]g0y]/V~k")
ftp.voidcmd("TYPE I")

# Check admin/dashboard route files exist
for p in [
    "/nodejs/.next/server/app/admin/dashboard/page.js",
    "/nodejs/.next/server/app/admin/page.js",
    "/nodejs/.next/server/app/not-found.js",
    "/nodejs/.next/server/app/page.js",
    "/nodejs/.next/BUILD_ID",
]:
    try:
        size = ftp.size(p)
        print(f"  {p} -> {size} bytes")
    except Exception as e:
        print(f"  {p} -> MISSING: {e}")

ftp.quit()
