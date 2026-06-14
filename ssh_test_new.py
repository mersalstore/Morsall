import paramiko

hostname = '82.198.228.182'
port = 65002
username = 'u754458241'
password = 'Vixcell.eg2'

try:
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    client.connect(hostname, port=port, username=username, password=password, timeout=20)
    print("LOGIN OK")

    stdin, stdout, stderr = client.exec_command('whoami && pwd && uname -a')
    print("--- OUTPUT ---")
    print(stdout.read().decode('utf-8', errors='ignore'))
    err = stderr.read().decode('utf-8', errors='ignore')
    if err:
        print("--- STDERR ---")
        print(err)
    client.close()
except Exception as e:
    print(f"ERROR: {type(e).__name__}: {e}")
