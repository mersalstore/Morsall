import paramiko

try:
    print("Initializing SSH client...")
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    print("Connecting to Hostinger...")
    client.connect('82.198.228.182', port=65002, username='u754458241', password='@n9qe3KgL', timeout=10)
    print("Authentication successful!")

    print("Opening SFTP...")
    sftp = client.open_sftp()
    
    print("Reading file...")
    with sftp.file('/home/u754458241/domains/morsall.com/nodejs/db_push_log.txt', 'r') as f:
        print(f.read().decode('utf-8'))
        
    sftp.close()
    client.close()
    print("Done!")
except Exception as e:
    print("Error:", type(e).__name__, str(e))
