import paramiko

def test_php_db_robust():
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    
    host = '82.198.228.182'
    port = 65002
    user = 'u754458241'
    pasw = '@n9qe3KgL'
    
    try:
        client.connect(host, port=port, username=user, password=pasw)
        
        php_code = """<?php
        error_reporting(E_ALL);
        ini_set('display_errors', 1);
        mysqli_report(MYSQLI_REPORT_OFF);
        echo "START\\n";
        $creds = [
            ['u754458241_Kanan', 'Code_2252'],
            ['u754458241_Kanan', 'l$9Qs3i]g0y]/V~k'],
            ['u754458241_pGWOE', 'EPTyNREvS6'],
            ['u754458241_pGWOE', 'Mersal2026']
        ];
        
        foreach ($creds as $c) {
            $u = $c[0];
            $p = $c[1];
            echo "Testing user: $u with password: $p... ";
            try {
                $conn = new mysqli("localhost", $u, $p, "u754458241_Kanan");
                if ($conn->connect_error) {
                    echo "FAILED: " . $conn->connect_error . "\\n";
                } else {
                    echo "✅ SUCCESS!\\n";
                    $conn->close();
                }
            } catch (Exception $e) {
                echo "FAILED (Exception): " . $e->getMessage() . "\\n";
            }
        }
        echo "END\\n";
        ?>"""
        
        sftp = client.open_sftp()
        sftp.file('/home/u754458241/domains/morsall.com/public_html/robust_db_test.php', 'w').write(php_code)
        sftp.close()
        
        stdin, stdout, stderr = client.exec_command('php /home/u754458241/domains/morsall.com/public_html/robust_db_test.php')
        print(stdout.read().decode())
        print(stderr.read().decode())
        
        client.close()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_php_db_robust()
