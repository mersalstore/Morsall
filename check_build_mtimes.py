import paramiko, sys
sys.stdout.reconfigure(encoding='utf-8', errors='replace')

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect('82.198.228.182', port=65002, username='u754458241', password='Vixcell.eg2', timeout=20)

def run(cmd):
    _, stdout, stderr = client.exec_command(cmd, timeout=30)
    return (stdout.read() + stderr.read()).decode('utf-8', errors='replace').strip()

print("=== Checking mtimes of .next files ===")
print(run("ls -l /home/u754458241/domains/morsall.com/nodejs/.next/ | head -20"))

print("\n=== Checking if PrintPolicyModal is inside the built bundles ===")
# Search for PrintPolicyModal in .next folder on the server
print(run("find /home/u754458241/domains/morsall.com/nodejs/.next/ -type f -exec grep -l 'print-label-container' {} + | head -10"))

client.close()
