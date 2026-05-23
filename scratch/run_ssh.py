import paramiko

def run_ssh_cmd(cmd):
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    
    host = '82.198.228.182'
    port = 65002
    user = 'u754458241'
    pasw = '@n9qe3KgL'
    
    try:
        client.connect(host, port=port, username=user, password=pasw, timeout=30)
        # Use bash -l to get the user's environment
        stdin, stdout, stderr = client.exec_command(f'bash -l -c "{cmd}"')
        out_raw = stdout.read()
        err_raw = stderr.read()
        out = out_raw.decode('utf-8', 'ignore')
        err = err_raw.decode('utf-8', 'ignore')
        print(f"COMMAND: {cmd}")
        # Use sys.stdout.buffer.write to print raw bytes if needed, but for now just strip non-ascii
        print(f"STDOUT:\n{out.encode('ascii', 'ignore').decode('ascii')}")
        print(f"STDERR:\n{err.encode('ascii', 'ignore').decode('ascii')}")
        client.close()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    import sys
    if len(sys.argv) > 1:
        run_ssh_cmd(sys.argv[1])
    else:
        run_ssh_cmd("node -v")
