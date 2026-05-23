const { Client } = require('ssh2');
const conn = new Client();

console.log('Connecting to Hostinger via SSH to run ultimate cleanup...');

conn.on('ready', () => {
  console.log('✅ Connected successfully!');
  
  const cmd = `
    echo "=== 1. Wiping old nodeapp directory (4.3 GB) ==="
    rm -rf /home/u754458241/nodeapp
    
    echo "=== 2. Wiping old app_new backup (2.8 GB) ==="
    rm -rf /home/u754458241/domains/morsall.com/public_html/app_new
    
    echo "=== 3. Wiping duplicate domains directory (761 MB) ==="
    rm -rf /home/u754458241/domains/morsall.com/public_html/domains
    
    echo "=== 4. Wiping old public_html .next build folder (635 MB) ==="
    rm -rf /home/u754458241/domains/morsall.com/public_html/.next
    
    echo "=== 5. Wiping compiler temp folders (411 MB) ==="
    rm -rf /home/u754458241/domains/morsall.com/public_html/swc_temp
    rm -rf /home/u754458241/domains/morsall.com/public_html/swc-linux-x64-musl_temp
    rm -rf /home/u754458241/domains/morsall.com/public_html/swc-linux-x64-gnu_temp
    rm -rf /home/u754458241/domains/morsall.com/public_html/swc-linux.tgz
    rm -rf /home/u754458241/domains/morsall.com/public_html/swc-linux-x64-musl.tgz
    rm -rf /home/u754458241/domains/morsall.com/public_html/swc-linux-x64-gnu.tgz
    
    echo "=== 6. Wiping old source and prisma client folders in public_html ==="
    rm -rf /home/u754458241/domains/morsall.com/public_html/src
    rm -rf /home/u754458241/domains/morsall.com/public_html/_next
    rm -rf /home/u754458241/domains/morsall.com/public_html/.prisma
    rm -rf /home/u754458241/domains/morsall.com/public_html/@prisma
    rm -rf /home/u754458241/domains/morsall.com/public_html/remaining_modules.zip
    
    echo "=== 7. Wiping old zip files inside active nodejs directory ==="
    rm -rf /home/u754458241/domains/morsall.com/nodejs/admin_update.zip
    rm -rf /home/u754458241/domains/morsall.com/nodejs/fixes.zip
    rm -rf /home/u754458241/domains/morsall.com/nodejs/fixes2.zip
    rm -rf /home/u754458241/domains/morsall.com/nodejs/Morsall_Hostinger_Deploy.zip
    rm -rf /home/u754458241/domains/morsall.com/nodejs/standalone_deploy.zip
    rm -rf /home/u754458241/domains/morsall.com/nodejs/final_update.zip
    rm -rf /home/u754458241/domains/morsall.com/nodejs/fix_modules.zip
    
    echo "=== 8. Wiping old backups in domain root ==="
    rm -rf /home/u754458241/domains/morsall.com/nodejs_backup_1778489634
    rm -rf /home/u754458241/domains/morsall.com/.next
    
    echo "=== 9. Wiping test/diagnostic scripts in public_html ==="
    find /home/u754458241/domains/morsall.com/public_html/ -name "test_*.php" -delete
    find /home/u754458241/domains/morsall.com/public_html/ -name "verify_*.php" -delete
    find /home/u754458241/domains/morsall.com/public_html/ -name "read_*.php" -delete
    find /home/u754458241/domains/morsall.com/public_html/ -name "rename_*.php" -delete
    
    echo "=== 10. Checking disk space usage after cleanup ==="
    echo "--- Home level ---"
    du -h --max-depth=1 /home/u754458241/
    echo "--- Domain level ---"
    du -h --max-depth=2 /home/u754458241/domains/
    
    echo "=== 11. Triggering a fresh Node process restart ==="
    mkdir -p /home/u754458241/domains/morsall.com/nodejs/tmp
    touch /home/u754458241/domains/morsall.com/nodejs/tmp/restart.txt
    
    echo "=== ULTIMATE CLEANUP COMPLETED ==="
  `;
  
  conn.exec(cmd, (err, stream) => {
    if (err) {
      console.error('Execution Error:', err);
      conn.end();
      return;
    }
    stream.on('close', (code) => {
      console.log('SSH cleanup finished with exit code: ' + code);
      conn.end();
    }).on('data', (data) => {
      process.stdout.write(data);
    }).stderr.on('data', (data) => {
      process.stderr.write(data);
    });
  });
}).on('keyboard-interactive', (name, instructions, lang, prompts, finish) => {
  if (prompts.length > 0 && prompts[0].prompt.toLowerCase().includes('password')) {
    finish(['@n9qe3KgL']);
  } else {
    finish([]);
  }
}).on('error', (err) => {
  console.error('Connection Error:', err);
}).connect({
  host: '82.198.228.182',
  port: 65002,
  username: 'u754458241',
  password: '@n9qe3KgL',
  tryKeyboard: true,
  readyTimeout: 30000
});
