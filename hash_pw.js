const bcrypt = require('bcryptjs');
const hash = bcrypt.hashSync('MersalAdmin2026', 12);
console.log(hash);
