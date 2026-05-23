import paramiko

def force_binary_overwrite():
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    
    host = '82.198.228.182'
    port = 65002
    user = 'u754458241'
    pasw = '@n9qe3KgL'
    
    try:
        client.connect(host, port=port, username=user, password=pasw)
        
        path = '/home/u754458241/nodeapp/node_modules/.prisma/client'
        
        print(f"Overwriting Debian engines with RHEL versions in {path}...")
        
        # Library engine
        client.exec_command(f"cp {path}/libquery_engine-rhel-openssl-1.1.x.so.node {path}/libquery_engine-debian-openssl-1.1.x.so.node")
        
        # Binary engine (if exists)
        # Note: sometimes they have different names or are in a different dir
        client.exec_command(f"cp {path}/query-engine-rhel-openssl-1.1.x {path}/query-engine-debian-openssl-1.1.x")
        
        # Also check /home/u754458241/domains/morsall.com/nodejs/node_modules/.prisma/client
        # (Though it's a symlink, let's be sure)
        
        # Restart
        client.exec_command("touch /home/u754458241/domains/morsall.com/nodejs/tmp/restart.txt")
        
        client.close()
        print("Done.")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    force_binary_overwrite()
