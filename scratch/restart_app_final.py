import paramiko
import sys
import io

# Force UTF-8
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
try:
    client.connect('82.198.228.182', port=65002, username='u754458241', password='Code_2252')
    
    app_root = '/home/u754458241/domains/morsall.com/nodejs/'
    
    print("Restarting app...")
    client.exec_command(f'mkdir -p {app_root}tmp && touch {app_root}tmp/restart.txt')
    client.exec_command('pkill -u u754458241 node')
    print("Done.")

finally:
    client.close()
