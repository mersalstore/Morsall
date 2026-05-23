import paramiko
import sys
import io
import traceback

# Force UTF-8
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
try:
    print("Attempting to connect...")
    client.connect('82.198.228.182', port=65002, username='u754458241', password='Code_2252', timeout=10)
    print("Connected successfully.")
    
    def run_ssh_command(cmd):
        print(f"\n--- Executing: {cmd} ---")
        stdin, stdout, stderr = client.exec_command(cmd)
        out = stdout.read().decode('utf-8', errors='ignore')
        err = stderr.read().decode('utf-8', errors='ignore')
        if out: print("STDOUT:\n" + out)
        if err: print("STDERR:\n" + err)
        return out, err

    # Check directory listing
    run_ssh_command("ls -F /home/u754458241/domains/morsall.com/nodejs")
    
    # Check logs
    run_ssh_command("ls -l /home/u754458241/domains/morsall.com/nodejs/*.log")
    run_ssh_command("tail -n 50 /home/u754458241/domains/morsall.com/nodejs/stderr.log")
    
    # Check .env
    run_ssh_command("cat /home/u754458241/domains/morsall.com/nodejs/.env | grep -v 'PASSWORD' | grep -v 'SECRET'")

    client.close()
except Exception as e:
    print(f"Error: {e}")
    traceback.print_exc()
