import paramiko

hostname = '82.198.228.182'
port = 65002
username = 'u754458241'
password = 'Code_2252'

def setup_proxy():
    try:
        client = paramiko.SSHClient()
        client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        client.connect(hostname, port=port, username=username, password=password)
        
        htaccess = """
RewriteEngine On
RewriteBase /

# Force SSL
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

# Proxy to Node.js on 45000
RewriteRule ^(.*)$ http://127.0.0.1:45000/$1 [P,L]
"""
        cmd = f"echo '{htaccess}' > /home/u754458241/domains/morsall.com/public_html/.htaccess"
        client.exec_command(cmd)
        client.close()
        print("Setup Proxy .htaccess (45000)")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    setup_proxy()
