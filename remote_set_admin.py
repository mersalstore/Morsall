import paramiko

def set_admin():
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    
    host = '82.198.228.182'
    port = 65002
    user = 'u754458241'
    pasw = '@n9qe3KgL'
    
    try:
        print(f"Connecting to {host}...")
        client.connect(host, port=port, username=user, password=pasw)
        
        js_code = """
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const prisma = new PrismaClient();

async function main() {
  const email = "blackhatsd.sd@gmail.com";
  const password = "Admin@Morsall2026";
  const hashedPassword = await bcrypt.hash(password, 12);
  
  const user = await prisma.user.upsert({
    where: { email },
    update: { 
      password: hashedPassword,
      role: "ADMIN"
    },
    create: {
      email,
      password: hashedPassword,
      role: "ADMIN",
      name: "Admin"
    }
  });
  console.log("SUCCESS: User " + email + " is now ADMIN");
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
"""
        
        sftp = client.open_sftp()
        sftp.file('/home/u754458241/domains/morsall.com/nodejs/set_admin.js', 'w').write(js_code)
        sftp.close()
        
        print("Running set_admin.js on server...")
        stdin, stdout, stderr = client.exec_command('cd /home/u754458241/domains/morsall.com/nodejs/ && /opt/alt/alt-nodejs22/root/usr/bin/node set_admin.js')
        
        print("OUT:", stdout.read().decode())
        print("ERR:", stderr.read().decode())
        
        client.close()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    set_admin()
