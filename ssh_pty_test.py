import paramiko
import time

print("Initializing SSH client...")
client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
print("Connecting to Hostinger...")
client.connect('82.198.228.182', port=65002, username='u754458241', password='@n9qe3KgL', timeout=10)
print("Authentication successful!")

print("Invoking shell...")
channel = client.invoke_shell()

print("Executing command...")
channel.send("cd /home/u754458241/domains/morsall.com/nodejs && npx prisma db push --accept-data-loss\n")

time.sleep(10) # wait for prisma to run

output = ""
while channel.recv_ready():
    output += channel.recv(4096).decode('utf-8')
    
print("OUTPUT:")
print(output)

channel.close()
client.close()
print("Done!")
