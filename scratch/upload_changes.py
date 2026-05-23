import paramiko
import os

files_to_upload = [
    "src/components/VendorSidebar.tsx",
    "src/app/api/vendor/orders/route.ts",
    "src/components/VendorOrderModal.tsx",
    "src/components/VendorInvoiceModal.tsx",
    "src/app/vendor/dashboard/page.tsx",
    "src/components/VendorLogisticsTab.tsx",
    "src/components/VendorDesignTab.tsx",
    "src/components/VendorShippingSettings.tsx",
    "src/app/admin/dashboard/page.tsx",
]

host = '82.198.228.182'
port = 65002
user = 'u754458241'
pasw = '@n9qe3KgL'
remote_root = '/home/u754458241/nodeapp/'
local_root = 'c:/Users/hazem/Downloads/matger2/'

def upload():
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    
    try:
        print(f"Connecting to {host}...")
        client.connect(host, port=port, username=user, password=pasw, timeout=30)
        sftp = client.open_sftp()
        
        for rel_path in files_to_upload:
            local_path = os.path.join(local_root, rel_path).replace('\\', '/')
            remote_path = os.path.join(remote_root, rel_path).replace('\\', '/')
            
            # Ensure remote directory exists
            remote_dir = os.path.dirname(remote_path)
            try:
                sftp.stat(remote_dir)
            except IOError:
                print(f"Creating remote directory: {remote_dir}")
                # We might need to create parent dirs recursively
                # But for now assume they exist as they are standard src dirs
                # Actually let's be safe
                parts = remote_dir.split('/')
                current = ''
                for part in parts:
                    if not part: continue
                    current += '/' + part
                    try:
                        sftp.stat(current)
                    except IOError:
                        sftp.mkdir(current)

            print(f"Uploading {rel_path}...")
            sftp.put(local_path, remote_path)
            
        sftp.close()
        client.close()
        print("Upload successful!")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    upload()
