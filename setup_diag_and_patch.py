import ftplib
import time

def setup():
    host = "82.198.228.182"
    user = "u754458241.morsall.com"
    pasw = "l$9Qs3i]g0y]/V~k"
    
    # 1. Download current server.js
    try:
        ftp = ftplib.FTP(host)
        ftp.login(user, pasw)
        ftp.cwd("/nodejs")
        
        with open("server_backup.js", "w", encoding="utf-8") as f:
            ftp.retrlines("RETR server.js", lambda line: f.write(line + "\n"))
        print("Downloaded original server.js backup.")
    except Exception as e:
        print(f"Failed to download server.js: {e}")
        return

    # 2. Add patch to original server.js
    patch_code = """
// --- BOOTSTRAP DIAGNOSTICS HOOK ---
try {
    console.log("BOOTSTRAP HOOK: Executing query_db_diagnostics.js...");
    require('./query_db_diagnostics.js');
} catch (e) {
    console.error("BOOTSTRAP HOOK: Failed to load diagnostics:", e);
}
// --- END BOOTSTRAP DIAGNOSTICS HOOK ---
"""

    with open("server_backup.js", "r", encoding="utf-8") as f:
        content = f.read()

    target = "// Load environment variables"
    if target in content:
        patched_content = content.replace(target, patch_code + target)
        print("Patched server.js locally.")
    else:
        print("Target string not found in server.js!")
        return

    with open("server_patched_diag.js", "w", encoding="utf-8") as f:
        f.write(patched_content)

    # 3. Upload patched server.js and query_db_diagnostics.js
    try:
        # Upload diagnostics script
        with open("query_db_diagnostics.js", "rb") as f:
            ftp.storbinary("STOR query_db_diagnostics.js", f)
        print("Uploaded query_db_diagnostics.js to server.")
        
        # Upload patched server.js
        with open("server_patched_diag.js", "rb") as f:
            ftp.storbinary("STOR server.js", f)
        print("Uploaded patched server.js to server.")
        
        # Upload restart.txt to tmp folder to trigger reload when request comes
        try:
            ftp.cwd("/nodejs/tmp")
        except:
            try:
                ftp.mkd("/nodejs/tmp")
                ftp.cwd("/nodejs/tmp")
            except Exception as tmp_err:
                print(f"Could not create tmp folder: {tmp_err}")
                
        try:
            ftp.storbinary("STOR restart.txt", open("empty.txt", "rb"))
            print("Uploaded restart.txt to tmp folder.")
        except Exception as e:
            print(f"Failed to upload restart.txt: {e}")
            
        ftp.quit()
        print("\nSUCCESS: Server is ready for diagnostics. Please reload the website in your browser.")
    except Exception as e:
        print(f"FTP error: {e}")

if __name__ == "__main__":
    setup()
