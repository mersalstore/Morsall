import paramiko

hostname = '82.198.228.182'
port = 65002
username = 'u754458241'
password = 'Code_2252'

def fix_htaccess():
    try:
        client = paramiko.SSHClient()
        client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        client.connect(hostname, port=port, username=username, password=password)
        
        cmd = "sed -i 's/127.0.0.1/localhost/g' /home/u754458241/domains/morsall.com/public_html/.htaccess"
        client.exec_command(cmd)
        
        client.close()
        print("Fixed .htaccess")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    fix_htaccess()
