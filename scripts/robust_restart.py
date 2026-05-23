import paramiko
import time

def force_restart():
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    
    host = '82.198.228.182'
    port = 65002
    user = 'u754458241'
    pasw = '@n9qe3KgL'
    
    for i in range(5):
        try:
            print(f"Attempt {i+1} to connect...")
            client.connect(host, port=port, username=user, password=pasw, timeout=30)
            print("Connected!")
            
            # 1. Kill old processes
            client.exec_command('pkill -u u754458241 node')
            
            # 2. Touch restart files
            paths = [
                '/home/u754458241/nodeapp/tmp/restart.txt',
                '/home/u754458241/domains/morsall.com/nodejs/tmp/restart.txt'
            ]
            for p in paths:
                client.exec_command(f'mkdir -p $(dirname {p}) && touch {p}')
                print(f"Touched {p}")
            
            print("Restart signal sent successfully.")
            client.close()
            return True
        except Exception as e:
            print(f"Attempt {i+1} failed: {e}")
            time.sleep(3)
    return False

if __name__ == "__main__":
    if force_restart():
        print("SUCCESS")
    else:
        print("FAILED")
