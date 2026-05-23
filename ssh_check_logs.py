import paramiko
import sys

# Force UTF-8 for stdout
if sys.stdout.encoding != 'utf-8':
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect('82.198.228.182', port=65002, username='u754458241', password='@n9qe3KgL')

stdin, stdout, stderr = client.exec_command('cd /home/u754458241/domains/morsall.com/nodejs && cat logs/stderr.log | tail -n 100')
out = stdout.read().decode('utf-8', errors='ignore')
if out:
    print(out)
else:
    print("No errors found in stderr.log.")

client.close()
