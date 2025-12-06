#!/usr/bin/env node

const bcrypt = require('bcryptjs');

const password = process.argv[2];

if (!password) {
  console.error('Usage: node scripts/generate-password-hash.js <your-password>');
  process.exit(1);
}

bcrypt.hash(password, 10).then(hash => {
  console.log('\nGenerated bcrypt hash:');
  console.log(hash);
  console.log('\nAdd this to your .env.local or Netlify environment variables:');
  console.log(`SHARED_PASSWORD_HASH=${hash}`);
});
