# Student Project Tracker — Mobile-Browser Setup Guide (Supabase & Vercel)

This guide is designed so you can connect **Supabase** and deploy to **Vercel** using only your mobile phone or web browser—no PC, VS Code, or local terminal required.

---

## Part 1: Set Up Supabase (Database, Auth & Private File Storage)

1. Open **https://supabase.com** in your browser and sign in (or create a free account).
2. Tap **New Project**, choose your organization, name the project **`student-project-tracker`**, set a strong database password, and select the region closest to you.
3. Once the project finishes provisioning:
   - Open **SQL Editor** from the left menu → tap **New query**.
   - Paste and run these files from this repository in exact order:
     1. `supabase/migrations/001_initial_schema.sql` (creates multi-tenant tables)
     2. `supabase/migrations/002_rls_policies.sql` (enforces Row-Level Security tenant isolation)
     3. `supabase/migrations/003_storage_buckets.sql` (creates the private `project-submissions` bucket)
     4. *(Optional)* `supabase/seed.sql` (adds sample approved universities & departments)
4. Get your project credentials:
   - Go to **Project Settings → API**.
   - Copy **Project URL** (looks like `https://xxxx.supabase.co`).
   - Copy **anon / public** API key.

---

## Part 2: Deploy to Vercel via GitHub (Browser-Only)

1. Push or export this project repository to your **GitHub** account.
2. Open **https://vercel.com** in your browser and sign in with **Continue with GitHub**.
3. Tap **Add New → Project** and select your **Student Project Tracker** GitHub repository.
4. Framework Preset is automatically detected as **Vite** (`vercel.json` is already included so page reloads work on all routes).
5. Expand **Environment Variables** and add:
   - `VITE_SUPABASE_URL` = *(your Supabase Project URL)*
   - `VITE_SUPABASE_ANON_KEY` = *(your Supabase anon public key)*
6. Tap **Deploy**. Vercel builds and gives you a live HTTPS URL.

---

## Part 3: Enable Live Supabase Mode Inside AI Studio

To test live Supabase inside your AI Studio preview before deploying to Vercel:
- Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in the **Secrets / Environment Variables** panel of AI Studio.
- The app detects those variables automatically (`src/lib/supabaseClient.js`) and switches from **Stage 3 Browser Demo Mode** to **Live Supabase Auth & Storage**.
