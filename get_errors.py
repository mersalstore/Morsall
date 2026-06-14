import paramiko, sys
sys.stdout.reconfigure(encoding='utf-8', errors='replace')

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect('82.198.228.182', port=65002, username='u754458241', password='Vixcell.eg2', timeout=20)

def run(cmd):
    _, stdout, stderr = client.exec_command(cmd, timeout=30)
    return (stdout.read() + stderr.read()).decode('utf-8', errors='replace').strip()

print('=== LAST 60 lines of stderr ===')
print(run('tail -60 /home/u754458241/domains/morsall.com/nodejs/stderr.log 2>&1 || tail -60 /home/u754458241/domains/morsall.com/nodejs/app_new_stderr.log 2>&1'))

client.close()
