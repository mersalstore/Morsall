import paramiko
import sys

hostname = '82.198.228.182'
port = 65002
username = 'u754458241'
password = '@n9qe3KgL'

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())

def run_ssh_command(cmd):
    try:
        client.connect(hostname, port=port, username=username, password=password, 
                       look_for_keys=False, allow_agent=False, timeout=20)
        stdin, stdout, stderr = client.exec_command(cmd)
        output = stdout.read().decode('utf-8')
        error = stderr.read().decode('utf-8')
        client.close()
        return output, error
    except Exception as e:
        return "", str(e)

if __name__ == "__main__":
    command = sys.argv[1] if len(sys.argv) > 1 else "ls -la /home/u754458241/domains/morsall.com/public_html"
    out, err = run_ssh_command(command)
    sys.stdout.reconfigure(encoding='utf-8')
    print("STDOUT:\n", out)
    print("STDERR:\n", err)
