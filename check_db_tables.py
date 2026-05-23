import paramiko
import time

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect('82.198.228.182', port=65002, username='u754458241', password='@n9qe3KgL')

# Check if Account and Session tables exist in the DB
cmd = """mysql -u u754458241_Kanan -pMersal2026 u754458241_Kanan -e "SHOW TABLES;" 2>&1"""
stdin, stdout, stderr = client.exec_command(cmd)
time.sleep(3)
print("TABLES:", stdout.read().decode('utf-8', errors='ignore'))
print("ERR:", stderr.read().decode('utf-8', errors='ignore'))

client.close()
