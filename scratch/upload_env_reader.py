import paramiko

def upload_reader():
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    
    host = '82.198.228.182'
    port = 65002
    user = 'u754458241'
    pasw = '@n9qe3KgL'
    
    php_code = """<?php
header('Content-Type: text/plain');
$files = [
    '/home/u754458241/domains/morsall.com/nodejs/.env.production',
    '/home/u754458241/domains/morsall.com/nodejs/.env'
];
foreach ($files as $f) {
    echo "--- FILE: $f ---\\n";
    if (file_exists($f)) {
        echo file_get_contents($f);
    } else {
        echo "NOT FOUND";
    }
    echo "\\n\\n";
}
?>"""
    
    try:
        client.connect(host, port=port, username=user, password=pasw)
        sftp = client.open_sftp()
        sftp.file('/home/u754458241/domains/morsall.com/public_html/read_env_secret.php', 'w').write(php_code)
        sftp.close()
        client.close()
        print("Uploaded reader.")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    upload_reader()
