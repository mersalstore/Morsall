import paramiko
import sys

def check_prisma():
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    
    host = '82.198.228.182'
    port = 65002
    user = 'u754458241'
    pasw = '@n9qe3KgL'
    
    try:
        client.connect(host, port=port, username=user, password=pasw)
        
        # Set path and run prisma
        cmd = 'export PATH=$PATH:/opt/alt/alt-nodejs22/root/usr/bin && cd /home/u754458241/domains/morsall.com/nodejs && npx prisma db pull'
        stdin, stdout, stderr = client.exec_command(cmd)
        
        out = stdout.read().decode('utf-8', errors='ignore')
        err = stderr.read().decode('utf-8', errors='ignore')
        
        with open('scripts/prisma_check_output.txt', 'w', encoding='utf-8') as f:
            f.write("--- OUT ---\n")
            f.write(out)
            f.write("\n--- ERR ---\n")
            f.write(err)
        
        print("Done. Check scripts/prisma_check_output.txt")
        client.close()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    check_prisma()
