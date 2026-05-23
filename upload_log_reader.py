import paramiko

try:
    transport = paramiko.Transport(('82.198.228.182', 65002))
    transport.connect(username='u754458241', password='@n9qe3KgL')
    sftp = paramiko.SFTPClient.from_transport(transport)
    sftp.put('read_logs_http.php', '/home/u754458241/domains/morsall.com/public_html/read_logs_http.php')
    sftp.close()
    transport.close()
    print("Uploaded!")
except Exception as e:
    print(e)
