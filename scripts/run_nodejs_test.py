import paramiko

def run_test_db_nodejs():
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    
    host = '82.198.228.182'
    port = 65002
    user = 'u754458241'
    pasw = '@n9qe3KgL'
    
    try:
        client.connect(host, port=port, username=user, password=pasw)
        
        # Set path and run node
        cmd = 'export PATH=$PATH:/opt/alt/alt-nodejs22/root/usr/bin && cd /home/u754458241/domains/morsall.com/nodejs && node test_db.js'
        stdin, stdout, stderr = client.exec_command(cmd)
        
        out = stdout.read().decode('utf-8', errors='ignore')
        err = stderr.read().decode('utf-8', errors='ignore')
        
        print("OUT:", out)
        print("ERR:", err)
        
        client.close()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    run_test_db_nodejs()
