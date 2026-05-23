import paramiko

def apply_correct_pass_remote():
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    
    host = '82.198.228.182'
    port = 65002
    user = 'u754458241'
    pasw = '@n9qe3KgL'
    
    new_pass = '4aE1b?DI|'
    
    try:
        client.connect(host, port=port, username=user, password=pasw)
        files = [
            '/home/u754458241/nodeapp/.env',
            '/home/u754458241/nodeapp/.env.production',
            '/home/u754458241/domains/morsall.com/nodejs/.env',
            '/home/u754458241/domains/morsall.com/nodejs/.env.production'
        ]
        
        for f in files:
            # We use sed with a different delimiter because the password might contain /
            # Actually the password contains ? and |
            # We'll use a safe way: writing the whole line.
            # But let's just use sed with a very unique delimiter like | if it doesn't contain it.
            # Wait, the password CONTAINS | (4aE1b?DI|)
            # So I'll use @ as delimiter if possible.
            # Wait, let's just use a python script on the server to update it safely.
            
            py_update = f"""
import os
path = '{f}'
if os.path.exists(path):
    with open(path, 'r') as file:
        lines = file.readlines()
    with open(path, 'w') as file:
        for line in lines:
            if 'DATABASE_URL=' in line:
                file.write('DATABASE_URL="mysql://u754458241_Kanan:4aE1b?DI|@localhost/u754458241_Kanan"\\n')
            else:
                file.write(line)
"""
            client.exec_command(f"python3 -c \\\"{py_update}\\\"")
            print(f"Updated {f}")
            
        # Restart
        client.exec_command('touch /home/u754458241/nodeapp/tmp/restart.txt')
        client.exec_command('touch /home/u754458241/domains/morsall.com/nodejs/tmp/restart.txt')
        print("Restarted app.")
        client.close()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    apply_correct_pass_remote()
