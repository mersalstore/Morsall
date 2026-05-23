import paramiko

def php_check_env():
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    
    host = '82.198.228.182'
    port = 65002
    user = 'u754458241'
    pasw = '@n9qe3KgL'
    
    try:
        print(f"Connecting to {host}...")
        client.connect(host, port=port, username=user, password=pasw)
        
        php_code = """<?php
echo "DB_HOST: " . getenv('DB_HOST') . "\\n";
echo "DATABASE_URL: " . getenv('DATABASE_URL') . "\\n";
print_r($_ENV);
?>"""
        
        sftp = client.open_sftp()
        sftp.file('/home/u754458241/domains/morsall.com/public_html/check_env.php', 'w').write(php_code)
        sftp.close()
        
        print("Running check_env.php...")
        stdin, stdout, stderr = client.exec_command('php /home/u754458241/domains/morsall.com/public_html/check_env.php')
        
        print("OUT:", stdout.read().decode())
        print("ERR:", stderr.read().decode())
        
        client.close()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    php_check_env()
