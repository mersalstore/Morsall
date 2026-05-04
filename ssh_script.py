import paramiko

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect('82.198.228.182', port=65002, username='u754458241', password='Code_2252')

commands = [
    "ls -lad /home/u754458241 /home/u754458241/domains /home/u754458241/domains/morsall.com /home/u754458241/domains/morsall.com/public_html /home/u754458241/domains/morsall.com/public_html/.builds 2>/dev/null",
    "ls -la /home/u754458241/domains/morsall.com/public_html/.builds/ 2>/dev/null",
    "stat /home/u754458241/domains/morsall.com/public_html/.builds/source/src/app/admin/dashboard 2>/dev/null || echo 'path_not_found'",
    "chmod -R u+rwx /home/u754458241/domains/morsall.com/public_html/.builds 2>/dev/null",
    "chmod -R a+rX /home/u754458241/domains/morsall.com/public_html/.builds 2>/dev/null",
    "chmod a+rx /home/u754458241/domains/morsall.com/public_html/.builds 2>/dev/null",
    "chmod a+rx /home/u754458241/domains/morsall.com/public_html 2>/dev/null"
]

print("--- DIAGNOSTICS ---")
for cmd in commands[:3]:
    stdin, stdout, stderr = client.exec_command(cmd)
    print(f"Command: {cmd}")
    print(stdout.read().decode())
    err = stderr.read().decode()
    if err:
        print(f"Error: {err}")
        
print("--- FIXING PERMISSIONS ---")
for cmd in commands[3:]:
    stdin, stdout, stderr = client.exec_command(cmd)
    print(f"Executed: {cmd}")

client.close()
