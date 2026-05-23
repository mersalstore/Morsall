import paramiko

def switch_startup_file():
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    
    host = '82.198.228.182'
    port = 65002
    user = 'u754458241'
    pasw = '@n9qe3KgL'
    
    try:
        client.connect(host, port=port, username=user, password=pasw)
        
        htaccess = '/home/u754458241/domains/morsall.com/public_html/.htaccess'
        print(f"Updating {htaccess}...")
        client.exec_command(f"sed -i 's|PassengerStartupFile server.js|PassengerStartupFile server-hostinger.js|' {htaccess}")
        
        # Restart
        client.exec_command("touch /home/u754458241/domains/morsall.com/public_html/tmp/restart.txt")
        
        client.close()
        print("Done.")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    switch_startup_file()
