import paramiko

def upload_fixer_php():
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    
    host = '82.198.228.182'
    port = 65002
    user = 'u754458241'
    pasw = '@n9qe3KgL'
    
    php_code = """<?php
header('Content-Type: text/plain');
$files = [
    '/home/u754458241/nodeapp/.env',
    '/home/u754458241/nodeapp/.env.production',
    '/home/u754458241/domains/morsall.com/nodejs/.env',
    '/home/u754458241/domains/morsall.com/nodejs/.env.production'
];

foreach ($files as $f) {
    if (file_exists($f)) {
        $content = file_get_contents($f);
        $content = str_replace('localhost', '127.0.0.1', $content);
        if (file_put_contents($f, $content)) {
            echo "Updated $f\\n";
        } else {
            echo "Failed to update $f\\n";
        }
    }
}

// Restart
@touch('/home/u754458241/nodeapp/tmp/restart.txt');
@touch('/home/u754458241/domains/morsall.com/nodejs/tmp/restart.txt');
echo "Restarted.\\n";
?>"""
    
    try:
        client.connect(host, port=port, username=user, password=pasw)
        sftp = client.open_sftp()
        sftp.file('/home/u754458241/domains/morsall.com/public_html/fix_env_hosts.php', 'w').write(php_code)
        sftp.close()
        client.close()
        print("Uploaded fixer PHP.")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    upload_fixer_php()
