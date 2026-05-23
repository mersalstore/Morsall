import paramiko
import os

# --- Configuration ---
SSH_HOST = "82.198.228.182"
SSH_PORT = 65002
SSH_USER = "u754458241"
SSH_PASS = "@n9qe3KgL"
REMOTE_PATH = "/home/u754458241/domains/morsall.com/nodejs"

def update_env():
    try:
        print("Connecting to SSH...")
        client = paramiko.SSHClient()
        client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        client.connect(SSH_HOST, port=SSH_PORT, username=SSH_USER, password=SSH_PASS)
        
        sftp = client.open_sftp()
        print(f"Uploading .env.production to {REMOTE_PATH}...")
        sftp.put(".env.production", f"{REMOTE_PATH}/.env.production")
        sftp.close()
        print("Upload complete!")
        
        print("Restarting app...")
        commands = [
            f"cd {REMOTE_PATH} && mkdir -p tmp && touch tmp/restart.txt"
        ]
        
        for cmd in commands:
            stdin, stdout, stderr = client.exec_command(cmd)
            print(f"Executed: {cmd}")
            
        client.close()
        print("Update successful!")

    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    update_env()
