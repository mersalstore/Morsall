import paramiko

def final_prisma_fix():
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    
    host = '82.198.228.182'
    port = 65002
    user = 'u754458241'
    pasw = '@n9qe3KgL'
    
    node_bin = '/opt/alt/alt-nodejs22/root/usr/bin'
    node_path = f"{node_bin}:/usr/local/bin:/usr/bin:/bin"
    
    cmds = [
        f"export PATH={node_path}:$PATH && cd /home/u754458241/domains/morsall.com/nodejs && npx prisma generate",
        f"export PATH={node_path}:$PATH && cd /home/u754458241/domains/morsall.com/nodejs && npx prisma db push --accept-data-loss",
        "mkdir -p /home/u754458241/domains/morsall.com/nodejs/tmp && touch /home/u754458241/domains/morsall.com/nodejs/tmp/restart.txt"
    ]
    
    with open('prisma_fix_output.txt', 'w', encoding='utf-8') as f:
        try:
            client.connect(host, port=port, username=user, password=pasw, timeout=30)
            for cmd in cmds:
                f.write(f"\nExecuting: {cmd}\n")
                stdin, stdout, stderr = client.exec_command(cmd)
                f.write("STDOUT:\n")
                f.write(stdout.read().decode('utf-8', 'ignore'))
                f.write("\nSTDERR:\n")
                f.write(stderr.read().decode('utf-8', 'ignore'))
                f.write("\n")
            client.close()
            print("Done. Check prisma_fix_output.txt")
        except Exception as e:
            print(f"Error: {e}")

if __name__ == "__main__":
    final_prisma_fix()
