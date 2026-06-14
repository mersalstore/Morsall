import paramiko, sys
sys.stdout.reconfigure(encoding='utf-8', errors='replace')

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect('82.198.228.182', port=65002, username='u754458241', password='Vixcell.eg2', timeout=20)

def run(cmd):
    _, stdout, stderr = client.exec_command(cmd, timeout=30)
    return (stdout.read() + stderr.read()).decode('utf-8', errors='replace').strip()

# Run a python one-liner on the server to query MySQL
# DB url is mysql://u754458241_Kanan:CODe_2222@127.0.0.1/u754458241_Kanan
print("=== Querying remote database orders via mysql CLI ===")
cmd = 'mysql -u u754458241_Kanan -pCODe_2222 -h 127.0.0.1 -D u754458241_Kanan -e "SELECT * FROM \`Order\` WHERE id=\'cmppxx09100013w4bofpoecte\'\\G"'
print(run(cmd))

client.close()
