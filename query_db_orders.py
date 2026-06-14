import mysql.connector
import json

try:
    conn = mysql.connector.connect(
        host="127.0.0.1",
        user="root",         # Wait, locally what is the DB?
        password=""          # Let's check the local .env database URL
    )
    print("Connected to MySQL")
except Exception as e:
    # Let's parse D:\New-folder\matger2\.env to get the connection string
    # We can connect to the remote database! The remote database is accessible via SSH or from the server.
    # But wait, we can run a python script on the remote server via SSH to query the MySQL database directly!
    # Yes! That is extremely safe and always works because it connects to 127.0.0.1 on the remote server.
    pass
