import paramiko

def fix_app_new_env():
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    
    host = '82.198.228.182'
    port = 65002
    user = 'u754458241'
    pasw = '@n9qe3KgL'
    
    try:
        print(f"Connecting to {host}...")
        client.connect(host, port=port, username=user, password=pasw)
        
        env_path = '/home/u754458241/domains/morsall.com/public_html/app_new/.env'
        
        # Update .env
        cmd = f"sed -i 's/Code_2252/Mersal2026/g' {env_path} && sed -i 's/127.0.0.1/localhost/g' {env_path}"
        client.exec_command(cmd)
        
        # Run prisma generate in app_new
        gen_cmd = "export PATH=/opt/alt/alt-nodejs22/root/usr/bin:/usr/bin:/bin:$PATH && cd /home/u754458241/domains/morsall.com/public_html/app_new/ && ./node_modules/.bin/prisma generate"
        stdin, stdout, stderr = client.exec_command(gen_cmd)
        print("GEN OUT:", stdout.read().decode())
        print("GEN ERR:", stderr.read().decode())
        
        # Restart app in nodejs
        client.exec_command('touch /home/u754458241/domains/morsall.com/nodejs/tmp/restart.txt')
        
        print("Updated app_new/.env, regenerated prisma, and restarted app.")
        client.close()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    fix_app_new_env()
