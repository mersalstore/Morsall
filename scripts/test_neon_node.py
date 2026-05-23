import paramiko

def test_neon_node():
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    
    host = '82.198.228.182'
    port = 65002
    user = 'u754458241'
    pasw = '@n9qe3KgL'
    
    try:
        client.connect(host, port=port, username=user, password=pasw)
        
        # Update .env first to see if Prisma can use it
        env_file = '/home/u754458241/nodeapp/.env'
        neon_url = "postgresql://neondb_owner:npg_jSskB54dWQti@ep-super-meadow-a4q1l2hn-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require"
        
        print(f"Testing Neon URL: {neon_url}")
        
        # Use a temporary JS file to test connection
        # We need to make sure Prisma is configured for postgresql
        # Let's check schema.prisma first
        
        stdin, stdout, stderr = client.exec_command('cat /home/u754458241/nodeapp/prisma/schema.prisma')
        schema = stdout.read().decode()
        if 'provider = "postgresql"' in schema:
            print("Schema is already configured for PostgreSQL")
        else:
            print("Schema is configured for: " + ('mysql' if 'mysql' in schema else 'unknown'))
        
        client.close()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_neon_node()
