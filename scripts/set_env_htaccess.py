import paramiko

def set_env_in_htaccess():
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    
    host = '82.198.228.182'
    port = 65002
    user = 'u754458241'
    pasw = '@n9qe3KgL'
    
    try:
        client.connect(host, port=port, username=user, password=pasw)
        
        htaccess = '/home/u754458241/domains/morsall.com/public_html/.htaccess'
        print(f"Adding SetEnv to {htaccess}...")
        
        env_lines = """
SetEnv PRISMA_CLIENT_ENGINE_TYPE binary
SetEnv PRISMA_QUERY_ENGINE_BINARY /home/u754458241/nodeapp/node_modules/.prisma/client/query-engine-rhel-openssl-1.1.x
SetEnv DATABASE_URL "mysql://u754458241_Kanan:Code2252@127.0.0.1/u754458241_Kanan?connection_limit=1"
"""
        # Append to the beginning
        client.exec_command(f"sed -i '1i {env_lines}' {htaccess}")
        
        # Restart
        client.exec_command("touch /home/u754458241/domains/morsall.com/nodejs/tmp/restart.txt")
        
        client.close()
        print("Done.")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    set_env_in_htaccess()
