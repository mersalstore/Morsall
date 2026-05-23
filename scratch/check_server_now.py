import paramiko
import sys
import io

# Force UTF-8
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
try:
    client.connect('82.198.228.182', port=65002, username='u754458241', password='Code_2252')
    
    def run_ssh_command(cmd):
        print(f"\n--- Executing: {cmd} ---")
        stdin, stdout, stderr = client.exec_command(cmd)
        out = stdout.read().decode('utf-8', errors='ignore')
        err = stderr.read().decode('utf-8', errors='ignore')
        if out: print("STDOUT:\n" + out)
        if err: print("STDERR:\n" + err)
        return out, err

    # Check directory listing
    run_ssh_command("ls -R /home/u754458241/domains/morsall.com/nodejs | head -n 50")
    
    # Check logs
    run_ssh_command("cat /home/u754458241/domains/morsall.com/nodejs/stderr.log | tail -n 100")
    run_ssh_command("cat /home/u754458241/domains/morsall.com/nodejs/stdout.log | tail -n 100")
    
    # Check .env
    run_ssh_command("cat /home/u754458241/domains/morsall.com/nodejs/.env")

    client.close()
except Exception as e:
    print(f"Error: {e}")
