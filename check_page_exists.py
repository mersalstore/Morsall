import paramiko, sys
sys.stdout.reconfigure(encoding='utf-8', errors='replace')

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect('82.198.228.182', port=65002, username='u754458241', password='Vixcell.eg2', timeout=20)

def run(cmd):
    _, stdout, stderr = client.exec_command(cmd, timeout=30)
    return (stdout.read() + stderr.read()).decode('utf-8', errors='replace').strip()

print("=== Checking if page.js exists ===")
print(run("ls -l /home/u754458241/domains/morsall.com/nodejs/.next/server/app/admin/dashboard/page.js"))

print("\n=== Checking size of page.js ===")
print(run("ls -lh /home/u754458241/domains/morsall.com/nodejs/.next/server/app/admin/dashboard/page.js"))

print("\n=== Is there another next app running? Let's check processes ===")
print(run("ps aux | grep node"))

client.close()
