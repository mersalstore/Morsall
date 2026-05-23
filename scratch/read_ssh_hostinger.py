import paramiko
import sys

def read_file(path):
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    host = '82.198.228.182'
    port = 65002
    user = 'u754458241'
    pasw = '@n9qe3KgL'
    
    try:
        client.connect(host, port=port, username=user, password=pasw)
        
        stdin, stdout, stderr = client.exec_command(f"cat {path}")
        content = stdout.read().decode('utf-8', errors='replace')
        with open("scratch/remote_file_content.txt", "w", encoding="utf-8") as f:
            f.write(content)
        print(f"Content of {path} saved to scratch/remote_file_content.txt")
        
        client.close()
    except Exception as e:
        print(f"Failed: {e}")

if __name__ == "__main__":
    path = sys.argv[1] if len(sys.argv) > 1 else "domains/morsall.com/nodejs/server-hostinger.js"
    read_file(path)
