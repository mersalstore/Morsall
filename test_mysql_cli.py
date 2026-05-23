import paramiko
import time

def test_mysql_cli():
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    
    host = '82.198.228.182'
    port = 65002
    user = 'u754458241'
    pasw = '@n9qe3KgL'
    
    try:
        print(f"Connecting to {host}...")
        client.connect(host, port=port, username=user, password=pasw)
        
        chan = client.invoke_shell()
        # Send password in a way that doesn't show up in history if possible, but here it's just for testing
        chan.send('mysql -u u754458241_Kanan -pMersal2026 -e "show databases;"\n')
        time.sleep(5)
        out = chan.recv(10000).decode()
        print("MYSQL OUTPUT:")
        print(out)
        
        client.close()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_mysql_cli()
