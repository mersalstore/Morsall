import paramiko

def apply_master_fix_ssh():
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    
    host = '82.198.228.182'
    port = 65002
    user = 'u754458241'
    pasw = '@n9qe3KgL'
    
    db_url = 'mysql://u754458241_Kanan:4aE1b?DI|@localhost/u754458241_Kanan?connection_limit=5'
    
    files = [
        '/home/u754458241/nodeapp/.env',
        '/home/u754458241/nodeapp/.env.production',
        '/home/u754458241/domains/morsall.com/nodejs/.env',
        '/home/u754458241/domains/morsall.com/nodejs/.env.production',
        '/home/u754458241/domains/morsall.com/public_html/app_new/.env',
        '/home/u754458241/domains/morsall.com/public_html/app_new/.env.production'
    ]
    
    try:
        client.connect(host, port=port, username=user, password=pasw)
        
        for f in files:
            # Safely update using Python on server to avoid shell escaping issues with | and ?
            py_cmd = f"""
import os
path = '{f}'
if os.path.exists(path):
    with open(path, 'r') as file:
        lines = file.readlines()
    with open(path, 'w') as file:
        for line in lines:
            if line.startswith('DATABASE_URL='):
                file.write('DATABASE_URL="{db_url}"\\n')
            elif line.startswith('PRISMA_CLIENT_ENGINE_TYPE='):
                file.write('PRISMA_CLIENT_ENGINE_TYPE=binary\\n')
            else:
                file.write(line)
        # Ensure they exist if not found
        content = "".join(lines)
        if 'DATABASE_URL=' not in content:
            file.write('DATABASE_URL="{db_url}"\\n')
        if 'PRISMA_CLIENT_ENGINE_TYPE=' not in content:
            file.write('PRISMA_CLIENT_ENGINE_TYPE=binary\\n')
"""
            client.exec_command(f"python3 -c \\\"{py_cmd}\\\"")
            print(f"Applied fix to {f}")

        # Update start_morsall.js to use binary
        start_script = '/home/u754458241/nodeapp/start_morsall.js'
        client.exec_command(f"sed -i 's/library/binary/g' {start_script}")
        print("Updated start_morsall.js to binary engine.")

        # Restart
        client.exec_command('mkdir -p /home/u754458241/nodeapp/tmp && touch /home/u754458241/nodeapp/tmp/restart.txt')
        client.exec_command('mkdir -p /home/u754458241/domains/morsall.com/nodejs/tmp && touch /home/u754458241/domains/morsall.com/nodejs/tmp/restart.txt')
        print("Restarted app.")
        
        client.close()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    apply_master_fix_ssh()
