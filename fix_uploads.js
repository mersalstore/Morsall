const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const uploadDir = path.join(__dirname, 'public', 'uploads');

console.log('--- Hostinger Upload Permission Fixer ---');

try {
    if (!fs.existsSync(uploadDir)) {
        console.log('Creating public/uploads directory...');
        fs.mkdirSync(uploadDir, { recursive: true });
    }

    console.log('Setting permissions to 777 for public/uploads...');
    // Using 777 because Phusion Passenger and LiteSpeed sometimes run as different users
    try {
        execSync(`chmod -R 777 ${uploadDir}`);
        console.log('✅ Permissions set to 777');
    } catch (e) {
        console.log('⚠️ Could not chmod 777, trying 755...');
        execSync(`chmod -R 755 ${uploadDir}`);
        console.log('✅ Permissions set to 755');
    }

    // Also check if public directory itself is accessible
    execSync(`chmod 755 ${path.join(__dirname, 'public')}`);
    
    console.log('Done!');
} catch (error) {
    console.error('❌ Error fixing permissions:', error.message);
}
