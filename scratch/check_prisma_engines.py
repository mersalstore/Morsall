import paramiko

def check_engines():
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect('82.198.228.182', port=65002, username='u754458241', password='@n9qe3KgL')
    
    cmd = "ls -la /home/u754458241/domains/morsall.com/nodejs/node_modules/.prisma/client"
    print(f"Running: {cmd}")
    stdin, stdout, stderr = ssh.exec_command(cmd)
    print(stdout.read().decode('utf-8', errors='ignore'))
    print(stderr.read().decode('utf-8', errors='ignore'))
    
    # Also check node_modules/prisma
    cmd2 = "ls -la /home/u754458241/domains/morsall.com/nodejs/node_modules/prisma"
    print(f"Running: {cmd2}")
    stdin, stdout, stderr = ssh.exec_command(cmd2)
    print(stdout.read().decode('utf-8', errors='ignore'))
    
    ssh.close()

if __name__ == '__main__':
    check_engines()
