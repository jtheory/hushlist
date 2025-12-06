# hushlist

A family wishlist sharing app where everyone can add to each other's lists and secretly claim items.

## Features

- Simple email + shared password authentication
- Each family member has their own wishlist
- Add, edit, and delete wishlist items
- When viewing someone else's list, you can claim items (they won't see who claimed them)
- When viewing your own list, claim status is hidden (no spoilers!)

## Setup

### 1. Supabase Setup

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to the SQL Editor in your Supabase dashboard
3. Run the SQL from `supabase-schema.sql` to create the database tables
4. Get your project URL and anon key from Settings > API

### 2. Environment Variables (Local Development)

1. Copy `.env.local.example` to `.env.local`:
   ```bash
   cp .env.local.example .env.local
   ```

2. Fill in your Supabase credentials from step 1:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...your-key-here
   ```

3. Generate and add your password hash:
   ```bash
   node scripts/generate-password-hash.js "your-family-password"
   ```
   Copy the hash from the output and add it to `.env.local`, **escaping each `$` with `\`**:
   ```
   SHARED_PASSWORD_HASH=\$2b\$10\$xV9wiYRu36Q1m74Iolx/WOXDTFfWwU3QFL3YqfVzMqm5X3t4Ti1EO
   ```

**Complete `.env.local` example:**
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...your-anon-key
SHARED_PASSWORD_HASH=\$2b\$10\$xV9wiY...your-hash-here
```

### 3. Local Development

```bash
npm install
npm run dev
```

Open [http://localhost:3003](http://localhost:3003)

### 4. Deploy to Netlify

#### Using Netlify with Supabase Extension

1. Generate your password hash locally:
   ```bash
   node scripts/generate-password-hash.js "your-family-password"
   ```
2. Push this code to a GitHub repository
3. Go to [netlify.com](https://netlify.com) and click "Add new site" > "Import an existing project"
4. Connect your GitHub repository
5. After creating the site, go to "Integrations" and add the Supabase extension
6. Connect it to your Supabase project - this automatically provides `SUPABASE_DATABASE_URL` and `SUPABASE_ANON_KEY` to your server-side code
7. Manually add the `SHARED_PASSWORD_HASH` environment variable in Site settings > Environment variables:
   - Use backslash escapes: `\$2b\$10\$...` (escape each `$` with `\`)
8. Deploy!

**Note:** All data access happens through API routes, so Supabase credentials stay server-side only.

## Usage

1. Each family member logs in with their email and the shared password
2. First-time users are automatically created with their email
3. From the dashboard, click on any family member to view/edit their wishlist
4. When viewing others' wishlists, check the box to claim an item
5. The wishlist owner won't see the claim status to keep it a surprise!

## Tech Stack

- Next.js 15 with App Router
- TypeScript
- Tailwind CSS
- Supabase (PostgreSQL database)
- Netlify (hosting)
