import paramiko
import sys

def debug_ssh():
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    
    host = '82.198.228.182'
    port = 65002
    user = 'u754458241'
    pasw = '@n9qe3KgL'
    
    try:
        print(f"DEBUG: Attempting connection to {host}:{port}")
        client.connect(host, port=port, username=user, password=pasw, timeout=20, banner_timeout=20)
        print("DEBUG: Connection established.")
        
        stdin, stdout, stderr = client.exec_command('id')
        out = stdout.read().decode()
        err = stderr.read().decode()
        print(f"DEBUG: Output: {out}")
        print(f"DEBUG: Errors: {err}")
        
        client.close()
    except Exception as e:
        print(f"DEBUG: Exception occurred: {type(e).__name__}: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    debug_ssh()
