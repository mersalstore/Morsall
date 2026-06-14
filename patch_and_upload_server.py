import ftplib
import time

def main():
    host = "82.198.228.182"
    user = "u754458241.morsall.com"
    pasw = "l$9Qs3i]g0y]/V~k"
    
    # 1. Download current server.js
    try:
        ftp = ftplib.FTP(host)
        ftp.login(user, pasw)
        ftp.cwd("/nodejs")
        
        with open("server_backup_for_gen.js", "w", encoding="utf-8") as f:
            ftp.retrlines("RETR server.js", lambda line: f.write(line + "\n"))
        print("Downloaded server.js backup.")
    except Exception as e:
        print(f"Failed to download server.js: {e}")
        return

    # 2. Prepare patched server.js
    patch_code = """
// --- TEMPORARY PRISMA GENERATE BOOTSTRAP ---
try {
    log("BOOTSTRAP: Running prisma generate...");
    const { execSync } = require('child_process');
    const cmd = `"${process.execPath}" ./node_modules/prisma/build/index.js generate`;
    log("BOOTSTRAP: Running command: " + cmd);
    const genOut = execSync(cmd, { cwd: __dirname });
    log("BOOTSTRAP: Prisma generate output:\\n" + genOut.toString());
} catch (e) {
    log("BOOTSTRAP: Prisma generate failed: " + e.message);
    if (e.stderr) {
        log("BOOTSTRAP: Stderr: " + e.stderr.toString());
    }
    if (e.stdout) {
        log("BOOTSTRAP: Stdout: " + e.stdout.toString());
    }
}
// --- END TEMPORARY PRISMA GENERATE BOOTSTRAP ---
"""

    with open("server_backup_for_gen.js", "r", encoding="utf-8") as f:
        content = f.read()

    # Find a good place to insert (e.g. right after the log('--- PRODUCTION SERVER STARTING...'); line)
    target = "log('--- PRODUCTION SERVER STARTING (AUTO-DETECT PRISMA) ---');"
    if target in content:
        patched_content = content.replace(target, target + patch_code)
        print("Patched server.js content successfully.")
    else:
        print("Could not find insertion target in server.js!")
        return

    # 3. Upload patched server.js
    with open("server_patched.js", "w", encoding="utf-8") as f:
        f.write(patched_content)

    try:
        with open("server_patched.js", "rb") as f:
            ftp.storbinary("STOR server.js", f)
        print("Uploaded patched server.js to server.")
        
        # Touch restart.txt to force Passenger to reload
        try:
            ftp.storbinary("STOR restart.txt", open("empty.txt", "rb"))
            print("Uploaded restart.txt to trigger reload.")
        except Exception as e:
            print(f"Failed to upload restart.txt: {e}")

        print("Waiting 15 seconds for Passenger to start and run generation...")
        time.sleep(15)

        # 4. Download server.log to check output
        with open("server_log_after_gen.log", "wb") as f:
            ftp.retrbinary("RETR server.log", f.write)
        print("Downloaded server.log. Let's read recent lines:")
        
        with open("server_log_after_gen.log", "r", encoding="utf-8", errors="replace") as f:
            log_lines = f.readlines()
            for line in log_lines[-40:]:
                if "BOOTSTRAP" in line:
                    print(line.strip())

        # 5. Restore original server.js
        print("Restoring original server.js...")
        with open("server_backup_for_gen.js", "rb") as f:
            ftp.storbinary("STOR server.js", f)
        print("Restored original server.js successfully.")
        
        # Touch restart.txt again
        try:
            ftp.storbinary("STOR restart.txt", open("empty.txt", "rb"))
            print("Uploaded restart.txt to reload original server.")
        except Exception as e:
            print(f"Failed to upload restart.txt: {e}")
            
        ftp.quit()
    except Exception as e:
        print(f"FTP error: {e}")

if __name__ == "__main__":
    main()
