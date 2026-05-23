import paramiko
import time

def change_to_127_v2():
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    
    host = '82.198.228.182'
    port = 65002
    user = 'u754458241'
    pasw = '@n9qe3KgL'
    
    try:
        print("Connecting...")
        client.connect(host, port=port, username=user, password=pasw, timeout=30)
        files = [
            '/home/u754458241/nodeapp/.env',
            '/home/u754458241/nodeapp/.env.production',
            '/home/u754458241/domains/morsall.com/nodejs/.env',
            '/home/u754458241/domains/morsall.com/nodejs/.env.production'
        ]
        
        for f in files:
            cmd = f"sed -i 's/localhost/127.0.0.1/g' {f}"
            client.exec_command(cmd)
            print(f"Updated {f}")
            
        client.exec_command('touch /home/u754458241/nodeapp/tmp/restart.txt')
        client.exec_command('touch /home/u754458241/domains/morsall.com/nodejs/tmp/restart.txt')
        print("Restarted.")
        client.close()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    change_to_127_v2()
