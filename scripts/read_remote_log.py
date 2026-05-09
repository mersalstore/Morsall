import paramiko

hostname = '82.198.228.182'
port = 65002
username = 'u754458241'
password = 'Code_2252'

def get_log():
    try:
        client = paramiko.SSHClient()
        client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        client.connect(hostname, port=port, username=username, password=password)
        
        stdin, stdout, stderr = client.exec_command('cat /home/u754458241/domains/morsall.com/nodejs/server.log')
        content = stdout.read().decode('utf-8', errors='ignore')
        print(content.encode('ascii', 'ignore').decode('ascii'))
        
        client.close()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    get_log()
