import paramiko
import sys
import os

if sys.stdout.encoding != 'utf-8':
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

hostname = '82.198.228.182'
port = 65002
username = 'u754458241'
password = '@n9qe3KgL'

print(f"Connecting via SFTP to {hostname}:{port}...")

transport = paramiko.Transport((hostname, port))
transport.connect(username=username, password=password)
sftp = paramiko.SFTPClient.from_transport(transport)

print("Connected via SFTP!")

# Local paths to the generated Prisma client
local_prisma = r'node_modules\@prisma\client'
remote_base = '/home/u754458241/domains/morsall.com/nodejs/node_modules/@prisma/client'

def sftp_mkdir_p(sftp, remote_dir):
    parts = remote_dir.split('/')
    path = ''
    for part in parts:
        if not part:
            path = '/'
            continue
        path = path + '/' + part if path != '/' else '/' + part
        try:
            sftp.stat(path)
        except FileNotFoundError:
            try:
                sftp.mkdir(path)
                print(f"Created dir: {path}")
            except:
                pass

def upload_dir(sftp, local_dir, remote_dir):
    sftp_mkdir_p(sftp, remote_dir)
    uploaded = 0
    for item in os.listdir(local_dir):
        local_path = os.path.join(local_dir, item)
        remote_path = remote_dir + '/' + item
        if os.path.isfile(local_path):
            try:
                sftp.put(local_path, remote_path)
                uploaded += 1
                if uploaded % 5 == 0:
                    print(f"  Uploaded {uploaded} files...")
            except Exception as e:
                print(f"  Error uploading {item}: {e}")
        elif os.path.isdir(local_path):
            upload_dir(sftp, local_path, remote_path)
    return uploaded

print(f"\nUploading Prisma client from {local_prisma}...")
print(f"To: {remote_base}")

if not os.path.exists(local_prisma):
    print(f"ERROR: Local path not found: {local_prisma}")
    sftp.close()
    transport.close()
    sys.exit(1)

total = upload_dir(sftp, local_prisma, remote_base)
print(f"\nDone! Uploaded {total} files to server.")

sftp.close()
transport.close()
print("Connection closed.")
