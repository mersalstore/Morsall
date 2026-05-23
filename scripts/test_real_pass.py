import paramiko

def test_real_pass():
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    
    host = '82.198.228.182'
    port = 65002
    user = 'u754458241'
    pasw = '@n9qe3KgL'
    
    try:
        client.connect(host, port=port, username=user, password=pasw)
        
        env_file = '/home/u754458241/nodeapp/.env'
        encoded_pass = "l%249Qs3i%5Dg0y%5D%2FV~k"
        print(f"Testing encoded password on localhost: {encoded_pass}")
        
        new_url = f'mysql://u754458241_Kanan:{encoded_pass}@localhost/u754458241_Kanan'
        
        # Use single quotes for sed to avoid shell expansion
        cmd = f"sed -i 's|DATABASE_URL=.*|DATABASE_URL=\"{new_url}\"|' {env_file}"
        client.exec_command(cmd)
        
        # Test with node
        node_bin = '/opt/alt/alt-nodejs22/root/usr/bin/node'
        stdin, stdout, stderr = client.exec_command(f'cd /home/u754458241/nodeapp/ && {node_bin} test_prisma.js')
        res = stdout.read().decode().strip()
        print(f"Prisma Result: {res}")
        if 'DB_SUCCESS' in res:
            print("✅ SUCCESS!")
            # Update all .env files
            client.exec_command(f"cp {env_file} /home/u754458241/domains/morsall.com/public_html/.env")
            client.exec_command(f"cp {env_file} /home/u754458241/domains/morsall.com/public_html/app_new/.env")
        else:
            print("❌ FAILED")
            print(stderr.read().decode())
        
        client.close()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_real_pass()
