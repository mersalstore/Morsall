import paramiko

def log_env():
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    
    host = '82.198.228.182'
    port = 65002
    user = 'u754458241'
    pasw = '@n9qe3KgL'
    
    try:
        print(f"Connecting to {host}...")
        client.connect(host, port=port, username=user, password=pasw)
        
        server_path = '/home/u754458241/domains/morsall.com/nodejs/server-hostinger.js'
        
        # Add a console.log for DATABASE_URL in server-hostinger.js
        injection = "console.log('--- DATABASE_URL:', process.env.DATABASE_URL);"
        client.exec_command(f"sed -i '/Creating server.../a {injection}' {server_path}")
        
        # Restart app
        client.exec_command('touch /home/u754458241/domains/morsall.com/nodejs/tmp/restart.txt')
        
        print("Injected log and restarted app.")
        client.close()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    log_env()
