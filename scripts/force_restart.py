import paramiko

def force_restart():
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    
    host = '82.198.228.182'
    port = 65002
    user = 'u754458241'
    pasw = '@n9qe3KgL'
    
    try:
        client.connect(host, port=port, username=user, password=pasw)
        
        # 1. Kill all node processes to clear memory
        print("Killing stuck processes...")
        client.exec_command('pkill -u u754458241 node')
        
        # 2. Touch restart.txt
        print("Restarting Passenger...")
        client.exec_command('mkdir -p /home/u754458241/domains/morsall.com/nodejs/tmp && touch /home/u754458241/domains/morsall.com/nodejs/tmp/restart.txt')
        
        client.close()
        print("Force restart triggered.")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    force_restart()
