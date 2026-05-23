import paramiko

try:
    c = paramiko.SSHClient()
    c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    c.connect('82.198.228.182', port=65002, username='u754458241', password='@n9qe3KgL')
    i, o, e = c.exec_command('mysql -u u754458241_Kanan -pMersal2026 u754458241_Kanan -e "DESCRIBE Account;"')
    print("STDOUT:", o.read().decode('utf-8'))
    print("STDERR:", e.read().decode('utf-8'))
    c.close()
except Exception as err:
    print("Error:", err)
