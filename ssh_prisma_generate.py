import paramiko

def ssh_generate():
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    host = '82.198.228.182'
    port = 65002
    user = 'u754458241'
    pasw = '@n9qe3KgL'
    
    try:
        print("Connecting to SSH...")
        client.connect(host, port=port, username=user, password=pasw, timeout=10)
        print("Connected successfully!")
        
        cmd = "cd domains/morsall.com/nodejs && /opt/alt/alt-nodejs20/root/usr/bin/node ./node_modules/prisma/build/index.js generate"
        print(f"Running command via SSH: {cmd}")
        stdin, stdout, stderr = client.exec_command(cmd)
        
        output = stdout.read().decode('utf-8', errors='ignore')
        error = stderr.read().decode('utf-8', errors='ignore')
        
        print("\n--- SSH OUTPUT ---")
        print(output)
        print("--- SSH ERROR ---")
        print(error)
        print("------------------\n")
        
        client.close()
    except Exception as e:
        print(f"SSH connection failed: {e}")

if __name__ == "__main__":
    ssh_generate()
