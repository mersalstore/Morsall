import paramiko
import time

def run_ssh_command(command):
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    client.connect('82.198.228.182', port=65002, username='u754458241', password='@n9qe3KgL')
    
    stdin, stdout, stderr = client.exec_command(command)
    out = stdout.read().decode()
    err = stderr.read().decode()
    client.close()
    return out, err

print("Checking Node.js version...")
out, err = run_ssh_command("node -v && npm -v")
print("Node/NPM Version:", out)

print("\nChecking node_modules for styled-jsx...")
out, err = run_ssh_command("ls -l /home/u754458241/domains/morsall.com/public_html/app_new/node_modules/styled-jsx/package.json")
print("Styled-jsx Check:", out if out else err)

print("\nChecking active app directory...")
out, err = run_ssh_command("ls -la /home/u754458241/nodejs/")
print("Active App Dir:", out)

print("\nChecking memory limits...")
out, err = run_ssh_command("ulimit -a")
print("Limits:", out)
