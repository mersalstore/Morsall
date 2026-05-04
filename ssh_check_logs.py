import paramiko
import sys

# Force UTF-8 for stdout
if sys.stdout.encoding != 'utf-8':
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect('82.198.228.182', port=65002, username='u754458241', password='Code_2252')

cmd = 'find /home/u754458241/domains/morsall.com/public_html/.builds/logs -type f | xargs ls -t | head -n 1'
stdin, stdout, stderr = client.exec_command(cmd)
latest_log = stdout.read().decode().strip()

if latest_log:
    print(f"Reading latest log file: {latest_log}")
    stdin, stdout, stderr = client.exec_command(f'cat {latest_log} | tail -n 100')
    print(stdout.read().decode('utf-8', errors='ignore'))
else:
    print("No log files found.")

client.close()
