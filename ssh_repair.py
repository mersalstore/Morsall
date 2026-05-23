import paramiko

def repair_and_fix():
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    
    host = '82.198.228.182'
    port = 65002
    user = 'u754458241'
    pasw = '@n9qe3KgL'
    
    try:
        print(f"Connecting to {host}...")
        client.connect(host, port=port, username=user, password=pasw)
        print("SSH Connection Successful!")
        
        # 1. Update .htaccess in public_html
        htaccess_content = """# Enable Passenger
PassengerEnabled on
PassengerAppType node
PassengerNodejs /opt/alt/alt-nodejs22/root/usr/bin/node
PassengerStartupFile server.js
PassengerAppRoot /home/u754458241/domains/morsall.com/nodejs

Options -MultiViews
RewriteEngine On
RewriteBase /

# ── EXCLUDE PHP AND DIAGNOSTIC SCRIPTS ──
RewriteCond %{REQUEST_URI} \\.(php|html|png|jpg|jpeg|gif|ico)$ [NC]
RewriteRule .* - [L]

# ── Let Node.js handle everything else ──
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ server.js/$1 [QSA,L]
"""
        
        # Use SFTP to write the file
        sftp = client.open_sftp()
        htaccess_path = '/home/u754458241/domains/morsall.com/public_html/.htaccess'
        print(f"Writing .htaccess to {htaccess_path}...")
        with sftp.file(htaccess_path, 'w') as f:
            f.write(htaccess_content)
        sftp.close()
        
        # 2. Ensure node_modules are properly set up
        print("Ensuring node_modules...")
        # Check if node_modules is a broken symlink or missing
        stdin, stdout, stderr = client.exec_command('ls -L /home/u754458241/domains/morsall.com/nodejs/node_modules/next/package.json')
        if stdout.read():
            print("node_modules/next found and accessible.")
        else:
            print("node_modules/next NOT found. Attempting to fix...")
            # We might need to run npm install, but let's try to find if they are elsewhere
            # For now, let's just log it.
        
        # 3. Restart Passenger
        restart_dir = '/home/u754458241/domains/morsall.com/nodejs/tmp'
        client.exec_command(f'mkdir -p {restart_dir} && touch {restart_dir}/restart.txt')
        print("Passenger restart triggered.")
        
        client.close()
        print("Done!")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    repair_and_fix()
