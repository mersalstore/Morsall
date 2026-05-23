import paramiko

def test_code2252():
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    
    host = '82.198.228.182'
    port = 65002
    user = 'u754458241'
    pasw = '@n9qe3KgL'
    
    try:
        client.connect(host, port=port, username=user, password=pasw)
        
        env_file = '/home/u754458241/nodeapp/.env'
        password = "Code2252"
        print(f"Testing password: {password}")
        
        new_url = f'mysql://u754458241_Kanan:{password}@localhost/u754458241_Kanan'
        client.exec_command(f"sed -i 's|DATABASE_URL=.*|DATABASE_URL=\"{new_url}\"|' {env_file}")
        
        # Test with node
        node_bin = '/opt/alt/alt-nodejs22/root/usr/bin/node'
        stdin, stdout, stderr = client.exec_command(f'cd /home/u754458241/nodeapp/ && {node_bin} test_prisma.js')
        res = stdout.read().decode().strip()
        print(f"Prisma Result: {res}")
        if 'DB_SUCCESS' in res:
            print("✅ SUCCESS!")
            # Update all .env files
            env_files = [
                '/home/u754458241/domains/morsall.com/public_html/.env',
                '/home/u754458241/domains/morsall.com/public_html/app_new/.env',
                '/home/u754458241/domains/morsall.com/nodejs/.env'
            ]
            for f in env_files:
                client.exec_command(f"sed -i 's|DATABASE_URL=.*|DATABASE_URL=\"{new_url}\"|' {f}")
            
            # Restart
            client.exec_command("touch /home/u754458241/domains/morsall.com/public_html/tmp/restart.txt")
            client.exec_command("touch /home/u754458241/nodeapp/tmp/restart.txt")
            client.exec_command("touch /home/u754458241/domains/morsall.com/nodejs/tmp/restart.txt")
        else:
            print("❌ FAILED")
            print(stderr.read().decode())
        
        client.close()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_code2252()
