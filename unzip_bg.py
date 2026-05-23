import paramiko

def unzip_bg():
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    host = '82.198.228.182'
    port = 65002
    user = 'u754458241'
    pasw = '@n9qe3KgL'
    
    try:
        client.connect(host, port=port, username=user, password=pasw)
        print("Connected.")
        
        target_zip = "/home/u754458241/domains/morsall.com/public_html/comprehensive_deploy.zip"
        cmd = f"nohup unzip -o {target_zip} -d /home/u754458241/domains/morsall.com/public_html > unzip.log 2>&1 &"
        print(f"Running: {cmd}")
        client.exec_command(cmd)
        
        time.sleep(2) # Give it a moment to start
        
        cmd2 = f"nohup unzip -o {target_zip} -d /home/u754458241/domains/morsall.com/nodejs > unzip_node.log 2>&1 &"
        print(f"Running: {cmd2}")
        client.exec_command(cmd2)
        
        client.close()
        print("Commands sent to background!")
    except Exception as e:
        print(f"Failed: {e}")

import time
unzip_bg()
