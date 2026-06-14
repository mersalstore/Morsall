import ftplib
import io

def main():
    host = "82.198.228.182"
    user = "u754458241.morsall.com"
    pasw = "l$9Qs3i]g0y]/V~k"
    
    # Correct .htaccess for Passenger - NO ProxyPass, just Passenger directives
    correct_htaccess = """PassengerEnabled on
PassengerAppType node
PassengerStartupFile server.js
PassengerAppRoot /home/u754458241/domains/morsall.com/nodejs

# Let Passenger handle everything
PassengerMaxRequests 10000
PassengerMaxPoolSize 2
PassengerMinInstances 1

# Only allow direct file access for static files in _next/static
RewriteEngine On
RewriteBase /
"""
    
    try:
        ftp = ftplib.FTP(host)
        ftp.login(user, pasw)
        print("Logged in")
        
        # Update .htaccess in public_html (the live directory)
        ftp.cwd("/public_html")
        ftp.storbinary("STOR .htaccess", io.BytesIO(correct_htaccess.encode()))
        print("Updated /public_html/.htaccess (removed ProxyPass conflict)")
        
        # Update .htaccess in nodejs too
        ftp.cwd("/nodejs")
        ftp.storbinary("STOR .htaccess", io.BytesIO(correct_htaccess.encode()))
        print("Updated /nodejs/.htaccess")
        
        # Trigger restart
        try:
            ftp.cwd("/nodejs/tmp")
        except:
            ftp.mkd("/nodejs/tmp")
            ftp.cwd("/nodejs/tmp")
        ftp.storbinary("STOR restart.txt", io.BytesIO(b"restart"))
        print("Triggered restart")
        
        ftp.quit()
        print("\nDone! Server should restart with correct config.")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    main()
