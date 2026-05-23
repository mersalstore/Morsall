import paramiko

def ssh_check():
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    try:
        # Try Code_2252 first
        client.connect('82.198.228.182', port=65002, username='u754458241', password='@n9qe3KgL')
        print("Connected via SSH")
        
        commands = [
            "ps aux | grep node",
            "tail -n 50 /home/u754458241/domains/morsall.com/public_html/app_new/server.log",
            "ls -la /home/u754458241/domains/morsall.com/public_html/app_new/.next"
        ]
        
        for cmd in commands:
            print(f"--- Executing: {cmd} ---")
            stdin, stdout, stderr = client.exec_command(cmd)
            print(stdout.read().decode())
            err = stderr.read().decode()
            if err:
                print(f"Error: {err}")
        
        client.close()
    except Exception as e:
        print(f"SSH Connection failed: {e}")

if __name__ == "__main__":
    ssh_check()
