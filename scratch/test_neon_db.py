import paramiko

def test_neon_db():
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    
    host = '82.198.228.182'
    port = 65002
    user = 'u754458241'
    pasw = '@n9qe3KgL'
    
    neon_url = "postgresql://neondb_owner:npg_jSskB54dWQti@ep-super-meadow-a4q1l2hn-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require"
    
    php_code = """<?php
try {
    $pdo = new PDO("pgsql:host=ep-super-meadow-a4q1l2hn-pooler.us-east-1.aws.neon.tech;dbname=neondb", "neondb_owner", "npg_jSskB54dWQti");
    echo "SUCCESS: Connected to Neon PostgreSQL\\n";
} catch (Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\\n";
}
?>"""
    
    try:
        client.connect(host, port=port, username=user, password=pasw)
        sftp = client.open_sftp()
        sftp.file('/home/u754458241/domains/morsall.com/public_html/test_neon.php', 'w').write(php_code)
        sftp.close()
        client.close()
        print("Uploaded Neon test.")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_neon_db()
