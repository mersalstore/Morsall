import paramiko

hostname = '82.198.228.182'
port = 65002
username = 'u754458241'
password = 'Code_2252'

def create_index():
    try:
        client = paramiko.SSHClient()
        client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        client.connect(hostname, port=port, username=username, password=password)
        
        cmd = "echo 'Hello' > /home/u754458241/domains/morsall.com/public_html/index.html"
        client.exec_command(cmd)
        client.close()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    create_index()
