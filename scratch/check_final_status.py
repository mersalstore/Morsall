import paramiko
import time

def check_status():
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    
    host = '82.198.228.182'
    port = 65002
    user = 'u754458241'
    pasw = '@n9qe3KgL'
    
    try:
        print("Connecting to SSH...")
        client.connect(host, port=port, username=user, password=pasw, timeout=30)
        print("Connected.")
        
        # 1. Check .env files
        print("\n--- Checking .env files ---")
        env_paths = [
            '/home/u754458241/nodeapp/.env',
            '/home/u754458241/domains/morsall.com/nodejs/.env'
        ]
        for path in env_paths:
            stdin, stdout, stderr = client.exec_command(f"grep 'DATABASE_URL' {path}")
            print(f"{path} DATABASE_URL: {stdout.read().decode().strip()}")
            stdin, stdout, stderr = client.exec_command(f"grep 'PRISMA_CLIENT_ENGINE_TYPE' {path}")
            print(f"{path} ENGINE_TYPE: {stdout.read().decode().strip()}")

        # 2. Check if fix_admin.php exists and run it via curl (if possible) or just check content
        print("\n--- Checking fix_admin.php ---")
        php_path = '/home/u754458241/domains/morsall.com/public_html/fix_admin.php'
        stdin, stdout, stderr = client.exec_command(f"ls -l {php_path}")
        print(f"fix_admin.php: {stdout.read().decode().strip()}")
        
        # Try to run it via PHP CLI to see if it works
        stdin, stdout, stderr = client.exec_command(f"php {php_path}")
        print(f"Running fix_admin.php via CLI:\n{stdout.read().decode().strip()}")

        # 3. Check for recent errors in logs
        print("\n--- Recent stderr logs (last 20 lines) ---")
        log_path = '/home/u754458241/nodeapp/app_stderr.log' # Common path for Hostinger Node apps
        stdin, stdout, stderr = client.exec_command(f"tail -n 20 {log_path}")
        print(stdout.read().decode().strip())
        
        # 4. Check if passenger is running
        print("\n--- Process Status ---")
        stdin, stdout, stderr = client.exec_command("ps aux | grep node | grep -v grep")
        print(stdout.read().decode().strip())

        client.close()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    check_status()
