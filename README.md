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

### 2. Environment Variables

1. Copy `.env.local.example` to `.env.local`:
   ```bash
   cp .env.local.example .env.local
   ```

2. Fill in your values:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your-project-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SHARED_PASSWORD=your-family-shared-password
   ```

### 3. Local Development

```bash
npm install
npm run dev
```

Open [http://localhost:3003](http://localhost:3003)

### 4. Deploy to Netlify

#### Option A: Using Netlify Supabase Extension (Recommended)

1. Push this code to a GitHub repository
2. Go to [netlify.com](https://netlify.com) and click "Add new site" > "Import an existing project"
3. Connect your GitHub repository
4. After creating the site, go to "Integrations" and add the Supabase extension
5. Connect it to your Supabase project - this automatically provides `SUPABASE_DATABASE_URL` and `SUPABASE_ANON_KEY`
6. Manually add the `SHARED_PASSWORD` environment variable in Site settings > Environment variables
7. Deploy!

#### Option B: Manual Environment Variables

1. Push this code to a GitHub repository
2. Go to [netlify.com](https://netlify.com) and click "Add new site" > "Import an existing project"
3. Connect your GitHub repository
4. Add environment variables in Site settings > Environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SHARED_PASSWORD`
5. Deploy!

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
