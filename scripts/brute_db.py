import paramiko

def update_env_and_test():
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    
    host = '82.198.228.182'
    port = 65002
    user = 'u754458241'
    pasw = '@n9qe3KgL'
    
    try:
        client.connect(host, port=port, username=user, password=pasw)
        
        env_file = '/home/u754458241/nodeapp/.env'
        passwords = ['Code_2252', 'Mersal2026', 'MersalEliteSecret2026', 'Admin@Morsall2026']
        
        for p in passwords:
            print(f"Testing password: {p}")
            new_url = f'mysql://u754458241_Kanan:{p}@127.0.0.1/u754458241_Kanan'
            client.exec_command(f"sed -i 's|DATABASE_URL=.*|DATABASE_URL=\"{new_url}\"|' {env_file}")
            
            # Test with node
            node_bin = '/opt/alt/alt-nodejs22/root/usr/bin/node'
            stdin, stdout, stderr = client.exec_command(f'cd /home/u754458241/nodeapp/ && {node_bin} test_prisma.js')
            res = stdout.read().decode().strip()
            if 'DB_SUCCESS' in res:
                print(f"✅ SUCCESS with password: {p}")
                # Also update public_html/.env
                client.exec_command(f"cp {env_file} /home/u754458241/domains/morsall.com/public_html/.env")
                break
            else:
                print(f"  Failed for {p}")
        
        client.close()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    update_env_and_test()
