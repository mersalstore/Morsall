import ftplib
import io

def main():
    host = "82.198.228.182"
    user = "u754458241.morsall.com"
    pasw = "l$9Qs3i]g0y]/V~k"
    
    # Read the local server-hostinger.js content
    with open("server-hostinger.js", "rb") as f:
        content = f.read()
    
    print(f"server-hostinger.js size: {len(content)} bytes")
    
    try:
        ftp = ftplib.FTP(host)
        ftp.login(user, pasw)
        print("Logged in")
        
        # Upload server-hostinger.js as server.js in both locations
        ftp.cwd("/nodejs")
        # Backup old server.js first
        try:
            lines = []
            ftp.retrlines("RETR server.js", lambda l: lines.append(l))
            with open("server_js_backup.txt", "w", encoding="utf-8") as bf:
                bf.write("\n".join(lines))
            print("Backed up old server.js to server_js_backup.txt")
        except Exception as e:
            print(f"Backup warning: {e}")
        
        # Upload the correct server-hostinger.js as server.js
        ftp.storbinary("STOR server.js", io.BytesIO(content))
        print("Uploaded server-hostinger.js content as /nodejs/server.js")
        
        # Also update the one in public_html
        ftp.cwd("/public_html")
        ftp.storbinary("STOR server.js", io.BytesIO(content))
        print("Uploaded server-hostinger.js content as /public_html/server.js")
        
        # Trigger restart via tmp/restart.txt
        try:
            ftp.cwd("/nodejs/tmp")
        except:
            ftp.mkd("/nodejs/tmp")
            ftp.cwd("/nodejs/tmp")
        ftp.storbinary("STOR restart.txt", io.BytesIO(b"restart"))
        print("Triggered Passenger restart")
        
        ftp.quit()
        print("\nDone! server.js has been updated with the correct content.")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    main()
