import paramiko

def force_unify_envs():
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    
    host = '82.198.228.182'
    port = 65002
    user = 'u754458241'
    pasw = '@n9qe3KgL'
    
    try:
        client.connect(host, port=port, username=user, password=pasw)
        
        env_content = """DATABASE_URL="mysql://u754458241_Kanan:Code2252@127.0.0.1/u754458241_Kanan"
NEXTAUTH_URL="https://morsall.com"
NEXTAUTH_SECRET="MersalEliteSecret2026"
PRISMA_CLIENT_ENGINE_TYPE=library
"""
        
        dirs = [
            '/home/u754458241/domains/morsall.com/public_html',
            '/home/u754458241/domains/morsall.com/public_html/app_new',
            '/home/u754458241/nodeapp',
            '/home/u754458241/domains/morsall.com/nodejs'
        ]
        
        for d in dirs:
            for f in ['.env', '.env.production', '.env.local']:
                path = f"{d}/{f}"
                print(f"Forcing {path}...")
                client.exec_command(f"echo '{env_content}' > {path}")
            
        # Restart
        client.exec_command("touch /home/u754458241/domains/morsall.com/nodejs/tmp/restart.txt")
        
        client.close()
        print("Done.")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    force_unify_envs()
