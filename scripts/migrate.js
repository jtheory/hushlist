#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const prompts = require('prompts');

// Load environment variables
require('dotenv').config({ path: '.env.local', quiet: true });

const supabaseUrl = process.env.SUPABASE_DATABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function runMigrations() {
  const migrationsDir = path.join(__dirname, '..', 'migrations');

  if (!fs.existsSync(migrationsDir)) {
    console.error('❌ Migrations directory not found');
    process.exit(1);
  }

  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║              📋 Database Migration Tool                    ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  // Check for service role key
  if (!supabaseServiceKey) {
    console.log('⚠️  No SUPABASE_SERVICE_ROLE_KEY found in .env.local\n');
    console.log('To enable auto-apply, add to .env.local:');
    console.log('SUPABASE_SERVICE_ROLE_KEY=your_service_role_key\n');
    console.log('For now, showing manual migration instructions...\n');
    await showManualInstructions(migrationsDir);
    return;
  }

  if (!supabaseUrl) {
    console.error('❌ Missing SUPABASE_DATABASE_URL or NEXT_PUBLIC_SUPABASE_URL');
    process.exit(1);
  }

  // Dynamic import of supabase
  const { createClient } = await import('@supabase/supabase-js');
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  // Create exec_sql helper function if it doesn't exist
  console.log('📋 Setting up migration helpers...\n');

  try {
    // Try to use exec_sql - if it fails, we'll create it
    await supabase.rpc('exec_sql', { sql: 'SELECT 1;' });
  } catch (err) {
    if (err.message && err.message.includes('Could not find the function')) {
      console.log('⚙️  Creating exec_sql helper function...\n');

      // Read and apply the setup migration
      const setupPath = path.join(__dirname, '..', 'migrations', '000_setup.sql');
      if (fs.existsSync(setupPath)) {
        const setupSQL = fs.readFileSync(setupPath, 'utf-8');

        // We need to execute this using direct SQL since exec_sql doesn't exist yet
        // This requires using the postgres connection, which we'll do via Management API
        console.log('⚠️  Please run migrations/000_setup.sql in Supabase Dashboard first:\n');
        console.log('   1. Go to SQL Editor in Supabase Dashboard');
        console.log('   2. Run the following SQL:\n');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log(setupSQL);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
        console.log('   3. Then run this script again\n');
        process.exit(1);
      } else {
        console.error('❌ Setup migration not found and exec_sql function is missing');
        process.exit(1);
      }
    }
  }

  // Create migrations tracking table
  try {
    await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS _migrations (
          id SERIAL PRIMARY KEY,
          name TEXT UNIQUE NOT NULL,
          applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });
  } catch (err) {
    // Table might already exist, continue anyway
  }

  // Get applied migrations
  let appliedMigrations = [];
  try {
    const { data } = await supabase.from('_migrations').select('name');
    appliedMigrations = data || [];
  } catch (err) {
    // Table might not exist yet, treat as no migrations applied
  }

  const appliedSet = new Set(appliedMigrations.map(m => m.name));

  // Get all migration files
  const files = fs.readdirSync(migrationsDir)
    .filter(f => f.endsWith('.sql'))
    .sort();

  if (files.length === 0) {
    console.log('ℹ️  No migration files found');
    return;
  }

  // Show migration status
  console.log('Available migrations:\n');
  const pendingMigrations = [];

  files.forEach((file, index) => {
    const status = appliedSet.has(file) ? '✅ Applied' : '⏳ Pending';
    console.log(`  ${index + 1}. ${file.padEnd(40)} ${status}`);
    if (!appliedSet.has(file)) {
      pendingMigrations.push(file);
    }
  });

  if (pendingMigrations.length === 0) {
    console.log('\n✨ All migrations are up to date!\n');
    return;
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // Prompt user to select migrations
  const response = await prompts({
    type: 'multiselect',
    name: 'migrations',
    message: 'Select migrations to apply:',
    choices: pendingMigrations.map(file => ({
      title: file,
      value: file,
      selected: true
    })),
    hint: '- Space to select. Return to submit'
  });

  if (!response.migrations || response.migrations.length === 0) {
    console.log('\n❌ No migrations selected. Exiting.\n');
    return;
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // Apply selected migrations
  for (const file of response.migrations) {
    console.log(`🔄 Applying ${file}...`);
    const filePath = path.join(migrationsDir, file);
    const sql = fs.readFileSync(filePath, 'utf-8');

    try {
      // Execute the SQL
      const { error } = await supabase.rpc('exec_sql', { sql });

      if (error) {
        throw error;
      }

      // Record successful migration
      const { error: recordError } = await supabase
        .from('_migrations')
        .insert({ name: file });

      if (recordError && !recordError.message.includes('duplicate')) {
        console.warn(`⚠️  Migration succeeded but could not record: ${recordError.message}`);
      }

      console.log(`✅ Applied ${file}\n`);
    } catch (error) {
      console.error(`❌ Failed to apply ${file}:`);
      console.error(`   ${error.message}\n`);

      const { value: continueAnyway } = await prompts({
        type: 'confirm',
        name: 'value',
        message: 'Continue with remaining migrations?',
        initial: false
      });

      if (!continueAnyway) {
        console.log('\n❌ Migration process stopped.\n');
        process.exit(1);
      }
    }
  }

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('✨ Migration process completed!\n');
}

async function showManualInstructions(migrationsDir) {
  const files = fs.readdirSync(migrationsDir)
    .filter(f => f.endsWith('.sql'))
    .sort();

  console.log(`Found ${files.length} migration file(s):\n`);
  files.forEach((file, index) => {
    console.log(`  ${index + 1}. ${file}`);
  });

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log('🔧 To apply these migrations:\n');
  console.log('  1. Go to your Supabase Dashboard');
  console.log('  2. Navigate to: SQL Editor');
  console.log('  3. Copy and paste the SQL below');
  console.log('  4. Click "Run"\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  for (const file of files) {
    const filePath = path.join(migrationsDir, file);
    const sql = fs.readFileSync(filePath, 'utf-8');

    console.log(`-- ┌─────────────────────────────────────────────────────────┐`);
    console.log(`-- │ Migration: ${file.padEnd(43)} │`);
    console.log(`-- └─────────────────────────────────────────────────────────┘\n`);
    console.log(sql);
    console.log('\n');
  }

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

runMigrations().catch(error => {
  console.error('❌ Migration script failed:', error);
  process.exit(1);
});
