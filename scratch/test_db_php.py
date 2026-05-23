import paramiko
hostname = '82.198.228.182'
port = 65002
username = 'u754458241'
password = '@n9qe3KgL'
client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(hostname, port=port, username=username, password=password)

php_test = """<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);
echo "Testing connection with password @n9qe3KgL...\\n";
$mysqli = new mysqli('localhost', 'u754458241_Kanan', '@n9qe3KgL', 'u754458241_Kanan');
if ($mysqli->connect_error) {
    die('Connect Error (' . $mysqli->connect_errno . ') ' . $mysqli->connect_error . "\\n");
}
echo 'Success... ' . $mysqli->host_info . "\\n";
$mysqli->close();
?>"""

sftp = client.open_sftp()
with sftp.file('/home/u754458241/domains/morsall.com/public_html/test_db.php', 'w') as f:
    f.write(php_test)
sftp.close()

stdin, stdout, stderr = client.exec_command('php /home/u754458241/domains/morsall.com/public_html/test_db.php')
print("STDOUT:", stdout.read().decode())
print("STDERR:", stderr.read().decode())
client.close()
