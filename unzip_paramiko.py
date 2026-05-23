import paramiko

def unzip_via_paramiko():
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
        dest_dir = "/home/u754458241/domains/morsall.com/public_html"
        
        cmd = f"unzip -o {target_zip} -d {dest_dir}"
        print(f"Running: {cmd}")
        stdin, stdout, stderr = client.exec_command(cmd)
        stdout.read() # wait
        
        # Now sync to nodejs
        print("Syncing to nodejs...")
        cmd2 = "cp -r /home/u754458241/domains/morsall.com/public_html/* /home/u754458241/domains/morsall.com/nodejs/"
        # Be careful not to overwrite the symlink node_modules in nodejs!
        # Actually, unzip already did that? No, unzip to public_html.
        
        # I'll just unzip directly to nodejs too.
        cmd3 = f"unzip -o {target_zip} -d /home/u754458241/domains/morsall.com/nodejs/"
        print(f"Running: {cmd3}")
        stdin, stdout, stderr = client.exec_command(cmd3)
        stdout.read()
        
        # Touch restart
        stdin, stdout, stderr = client.exec_command("mkdir -p /home/u754458241/domains/morsall.com/nodejs/tmp && touch /home/u754458241/domains/morsall.com/nodejs/tmp/restart.txt")
        stdout.read()
        
        client.close()
        print("Finished successfully!")
    except Exception as e:
        print(f"Failed: {e}")

unzip_via_paramiko()
