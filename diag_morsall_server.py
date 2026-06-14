import paramiko
import sys
import io

# Force UTF-8 encoding for stdout
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

HOST = '82.198.228.182'
PORT = 65002
USER = 'u754458241'
PASS = 'Vixcell.eg2'

def run_cmd(client, cmd, timeout=30):
    print(f"Executing: {cmd}")
    stdin, stdout, stderr = client.exec_command(cmd, timeout=timeout)
    out = stdout.read().decode('utf-8', errors='ignore')
    err = stderr.read().decode('utf-8', errors='ignore')
    return out, err

try:
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    client.connect(HOST, port=PORT, username=USER, password=PASS, timeout=20)
    print("SSH CONNECTED SUCCESS\n")

    # 1. Check directories
    print("=== DIRECTORY LISTINGS ===")
    out, err = run_cmd(client, "ls -la /home/u754458241/")
    print(out)
    
    out, err = run_cmd(client, "ls -la /home/u754458241/domains/")
    print(out)
    
    out, err = run_cmd(client, "ls -la /home/u754458241/domains/morsall.com/")
    print(out)

    # 2. Check public_html or nodeapp configs
    print("=== HTACCESS FILES ===")
    for path in [
        '/home/u754458241/public_html/.htaccess',
        '/home/u754458241/domains/morsall.com/public_html/.htaccess',
        '/home/u754458241/domains/morsall.com/nodejs/.htaccess',
        '/home/u754458241/nodeapp/.htaccess'
    ]:
        out, err = run_cmd(client, f"cat {path} 2>/dev/null")
        if out:
            print(f"--- {path} ---")
            print(out)
        else:
            print(f"--- {path} --- (not found or empty)")

    # 3. Check node/npm paths and logs
    print("=== LOG FILES AND NODE INFO ===")
    out, err = run_cmd(client, "ls -la /home/u754458241/domains/morsall.com/nodejs/logs/ 2>/dev/null")
    print(out)
    
    out, err = run_cmd(client, "tail -n 50 /home/u754458241/domains/morsall.com/nodejs/logs/stderr.log 2>/dev/null")
    print("--- stderr.log ---")
    print(out)
    
    out, err = run_cmd(client, "tail -n 50 /home/u754458241/domains/morsall.com/nodejs/logs/stdout.log 2>/dev/null")
    print("--- stdout.log ---")
    print(out)

    # 4. Check system logs / Passenger logs
    out, err = run_cmd(client, "find /home/u754458241/ -name '*.log' -mmin -60 2>/dev/null")
    print("--- recent logs ---")
    print(out)

    # 5. Let's try running Node server manually in background/foreground (short timeout)
    # We run it manually to see if it immediately fails or hangs
    print("=== MANUAL NODE TEST RUN ===")
    cmd_run = "cd /home/u754458241/domains/morsall.com/nodejs && /opt/alt/alt-nodejs22/root/usr/bin/node server-hostinger.js"
    # We set a shorter timeout so it doesn't hang the python script forever if it blocks
    stdin, stdout, stderr = client.exec_command(cmd_run, timeout=15)
    try:
        # read first chunk of stdout/stderr
        out_n = stdout.channel.recv(8192).decode('utf-8', errors='ignore')
        err_n = stderr.channel.recv(8192).decode('utf-8', errors='ignore')
        print("STDOUT:")
        print(out_n)
        print("STDERR:")
        print(err_n)
    except Exception as e:
        print(f"Manual run read error/timeout: {e}")

    client.close()
    print("DIAGNOSTICS DONE")

except Exception as e:
    print(f"SSH CONNECTION FAILED: {e}")
