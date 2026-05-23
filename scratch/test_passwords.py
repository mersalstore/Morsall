import paramiko

def test_pass():
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    client.connect('82.198.228.182', port=65002, username='u754458241', password='@n9qe3KgL')
    
    passes = ['Code2252', 'Code_2252']
    for p in passes:
        cmd = f"mysql -u u754458241_Kanan -p'{p}' -e 'select 1' u754458241_Kanan"
        stdin, stdout, stderr = client.exec_command(cmd)
        if "1" in stdout.read().decode():
            print(f"SUCCESS: {p}")
        else:
            print(f"FAILED: {p}")
    client.close()

if __name__ == "__main__":
    test_pass()
