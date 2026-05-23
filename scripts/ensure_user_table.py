import paramiko

def ensure_user_table():
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    
    host = '82.198.228.182'
    port = 65002
    user = 'u754458241'
    pasw = '@n9qe3KgL'
    
    try:
        client.connect(host, port=port, username=user, password=pasw, timeout=30)
        print("Connected.")
        
        sql = """
        CREATE TABLE IF NOT EXISTS `User` (
            `id` VARCHAR(191) NOT NULL,
            `name` VARCHAR(191) NULL,
            `email` VARCHAR(191) NOT NULL,
            `emailVerified` DATETIME(3) NULL,
            `password` VARCHAR(191) NULL,
            `image` VARCHAR(191) NULL,
            `phone` VARCHAR(191) NULL,
            `role` VARCHAR(191) NOT NULL DEFAULT 'CUSTOMER',
            `age` INTEGER NULL,
            `interests` VARCHAR(191) NULL,
            `isOnboarded` BOOLEAN NOT NULL DEFAULT false,
            `lastIp` VARCHAR(191) NULL,
            `lastLogin` DATETIME(3) NULL,
            `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
            `updatedAt` DATETIME(3) NOT NULL,
            UNIQUE INDEX `User_email_key`(`email`),
            PRIMARY KEY (`id`)
        ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
        """
        
        # Run mysql command
        print("Executing SQL via mysql client...")
        cmd = f'mysql -u u754458241_Kanan -pCode2252 u754458241_Kanan -e "{sql}"'
        stdin, stdout, stderr = client.exec_command(cmd)
        
        print("OUT:", stdout.read().decode())
        print("ERR:", stderr.read().decode())
        
        client.close()
        print("Done.")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    ensure_user_table()
