const { execSync } = require('child_process');

if (process.platform !== 'win32') {
  try {
    console.log('Fixing directory permissions for Hostinger build...');
    // Ensure all directories have execute permission, and all files are readable
    execSync('chmod -R a+rX .', { stdio: 'inherit' });
    console.log('Permissions fixed.');
  } catch (err) {
    console.error('Failed to fix permissions:', err.message);
  }
} else {
  console.log('Running on Windows, skipping permission fix.');
}
