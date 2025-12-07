#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const prompts = require('prompts');
const { Client } = require('pg');

// Load environment variables
require('dotenv').config({ path: '.env.local', quiet: true });

const connectionString = process.env.DATABASE_URL || process.env.SUPABASE_DB_URL;
const markDoneMode = process.argv.includes('--mark-done');

async function runMigrations() {
  const migrationsDir = path.join(__dirname, '..', 'migrations');

  if (!fs.existsSync(migrationsDir)) {
    console.error('❌ Migrations directory not found');
    process.exit(1);
  }

  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║              📋 Database Migration Tool                    ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  // Check for database connection string
  if (!connectionString) {
    console.log('⚠️  No DATABASE_URL found in .env.local\n');
    console.log('To enable auto-apply, add to .env.local:');
    console.log('DATABASE_URL=postgresql://postgres:[password]@[host]:5432/postgres\n');
    console.log('You can find this in your Supabase project settings under Database.\n');
    console.log('For now, showing manual migration instructions...\n');
    await showManualInstructions(migrationsDir);
    return;
  }

  // Connect to database
  const client = new Client({ connectionString });

  try {
    console.log('🔌 Connecting to database...\n');
    await client.connect();

    // Create migrations tracking table
    await client.query(`
      CREATE TABLE IF NOT EXISTS _migrations (
        id SERIAL PRIMARY KEY,
        name TEXT UNIQUE NOT NULL,
        applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);

    // Get applied migrations
    const { rows: appliedMigrations } = await client.query(
      'SELECT name FROM _migrations ORDER BY name'
    );
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
    const message = markDoneMode
      ? 'Select migrations to mark as done (without running):'
      : 'Select migrations to apply:';

    const response = await prompts({
      type: 'multiselect',
      name: 'migrations',
      message,
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

    if (markDoneMode) {
      // Mark migrations as done without running them
      for (const file of response.migrations) {
        console.log(`📝 Marking ${file} as done...`);

        try {
          await client.query(
            'INSERT INTO _migrations (name) VALUES ($1) ON CONFLICT (name) DO NOTHING',
            [file]
          );
          console.log(`✅ Marked ${file}\n`);
        } catch (error) {
          console.error(`❌ Failed to mark ${file}: ${error.message}\n`);
        }
      }
    } else {
      // Apply selected migrations
      for (const file of response.migrations) {
        console.log(`🔄 Applying ${file}...`);
        const filePath = path.join(migrationsDir, file);
        const sql = fs.readFileSync(filePath, 'utf-8');

        try {
          // Begin transaction
          await client.query('BEGIN');

          // Execute the migration SQL
          await client.query(sql);

          // Record successful migration
          await client.query(
            'INSERT INTO _migrations (name) VALUES ($1) ON CONFLICT (name) DO NOTHING',
            [file]
          );

          // Commit transaction
          await client.query('COMMIT');

          console.log(`✅ Applied ${file}\n`);
        } catch (error) {
          // Rollback on error
          await client.query('ROLLBACK');

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
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✨ Migration process completed!\n');

  } catch (error) {
    console.error('❌ Database error:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
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
