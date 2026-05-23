import paramiko
hostname = '82.198.228.182'
port = 65002
username = 'u754458241'
password = '@n9qe3KgL'
client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(hostname, port=port, username=username, password=password)

# Create a PHP script to fix the files
php_content = """<?php
echo "Restoring page.js...<br>";
$res = shell_exec("mv /home/u754458241/nodeapp/.next/server/app/page.js.bak /home/u754458241/nodeapp/.next/server/app/page.js 2>&1");
echo $res . "<br>";
echo "Touching restart.txt...<br>";
$res = shell_exec("touch /home/u754458241/nodeapp/tmp/restart.txt 2>&1");
echo $res . "<br>";
echo "Done!";
?>"""

sftp = client.open_sftp()
with sftp.file('/home/u754458241/domains/morsall.com/public_html/fix_now.php', 'w') as f:
    f.write(php_content)
sftp.close()
client.close()
