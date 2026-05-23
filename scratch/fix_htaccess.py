import paramiko
import os

def fix_htaccess():
    # Standard working .htaccess for Morsall on Hostinger
    working_htaccess = """# Enable Passenger
PassengerEnabled on
PassengerAppType node
PassengerNodejs /opt/alt/alt-nodejs22/root/usr/bin/node
PassengerStartupFile server-hostinger.js
PassengerAppRoot /home/u754458241/domains/morsall.com/nodejs
PassengerStartTimeout 300
PassengerMaxRequests 1000

Options -MultiViews
RewriteEngine On
RewriteBase /

# EXCLUDE PHP AND DIAGNOSTIC SCRIPTS
RewriteCond %{REQUEST_URI} \\.(php|html|png|jpg|jpeg|gif|ico)$ [NC]
RewriteRule .* - [L]
"""
    
    # 1. Update the remote .htaccess file via SSH/SFTP
    host = '82.198.228.182'
    port = 65002
    user = 'u754458241'
    pasw = '@n9qe3KgL'
    remote_path = '/home/u754458241/domains/morsall.com/public_html/.htaccess'
    
    try:
        print(f"Connecting to SSH {host}:{port}...")
        client = paramiko.SSHClient()
        client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        client.connect(host, port=port, username=user, password=pasw)
        print("Connected successfully!")
        
        print(f"Writing working .htaccess to remote path: {remote_path}...")
        sftp = client.open_sftp()
        with sftp.file(remote_path, 'w') as f:
            f.write(working_htaccess)
        sftp.close()
        print("Remote .htaccess updated successfully!")
        
        # Restart Passenger to apply the new .htaccess configuration
        restart_cmd = "touch /home/u754458241/domains/morsall.com/nodejs/tmp/restart.txt"
        print(f"Running Passenger restart: {restart_cmd}")
        client.exec_command(restart_cmd)
        print("Passenger restart triggered!")
        
        client.close()
    except Exception as e:
        print("SSH Update failed:", e)
        
    # 2. Update the local .htaccess file so that future deployments are safe
    local_path = '.htaccess'
    try:
        print(f"\nUpdating local {local_path} file...")
        with open(local_path, 'w', encoding='utf-8') as f:
            f.write(working_htaccess)
        print("Local .htaccess file updated successfully!")
    except Exception as e:
        print("Local update failed:", e)

if __name__ == "__main__":
    fix_htaccess()
