# Supabase Authentication & Database Setup Guide

This guide will walk you through enabling real **Supabase Authentication** and **Supabase PostgreSQL Database** for the **HunterAI** application. 

The application is already fully integrated with Supabase. By default, it runs in a local **Developer Sandbox Mode** (using mock authentication and local SQLite) when Supabase variables are empty. Providing your Supabase credentials will automatically activate secure, real-time Supabase Auth and database integration.

---

## Step 1: Create a Supabase Project

1. Go to the [Supabase Console](https://supabase.com) and sign in.
2. Click **New Project** and select your organization.
3. Choose a project name (e.g., `HunterAI`), set a secure database password, and choose a region close to your users.
4. Click **Create new project** and wait a couple of minutes for provisioning.

---

## Step 2: Retrieve your Configuration Keys

Once your project is ready, navigate to the **Settings** (gear icon) in the left sidebar:

1. **API Settings** (under Project Settings -> API):
   - Locate the **Project URL** (e.g., `https://xxxxxx.supabase.co`).
   - Locate the **anon / public** key (e.g., `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`).
   - Locate the **JWT Secret** (under JWT Settings). This is used by the FastAPI backend to verify incoming user tokens.

2. **Database Settings** (under Project Settings -> Database):
   - Locate the **Connection string** and copy the **URI** format.
   - It will look like: `postgresql://postgres.[your-project-id]:[your-password]@aws-0-us-east-1.pooler.supabase.com:6543/postgres`
   - *Note: Replace `[your-password]` with the actual password you chose when creating the project.*

---

## Step 3: Configure Environment Variables

You need to add the keys to both the **Frontend** and **Backend** configuration files.

### 1. Frontend Configuration

Create or update the file `HunterAI/frontend/.env.local`:

```env
# Next.js URL targeting the FastAPI backend
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000

# Supabase Project Credentials (Enables real auth)
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_public_key_here
```

### 2. Backend Configuration

Create or update the file `HunterAI/backend/config/.env`:

```env
# Gemini API Key (Primary Resume Parser)
GOOGLE_API_KEY=your_gemini_api_key_here

# Groq API Key (Resilient parser fallback)
GROQ_API_KEY=your_groq_api_key_here

# Supabase Storage & Database integration
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_JWT_SECRET=your_supabase_jwt_signing_secret_here

# Production Database URL (from Supabase Database Settings)
# If left blank, the backend will continue to use the local SQLite file (backend/data/app.db)
DATABASE_URL=postgresql://postgres.[your-project-id]:[your-password]@aws-0-us-east-1.pooler.supabase.com:6543/postgres
```

---

## Step 4: Configure Redirect URLs in Supabase (For OAuth / Google)

If you plan to use Google Sign-In or email confirmation redirects, you must register your redirect URLs in the Supabase Dashboard:

1. In the Supabase Dashboard, go to **Auth** -> **URL Configuration**.
2. Set the **Site URL** to `http://localhost:3000` (or your production frontend URL).
3. Under **Redirect URLs**, add:
   - `http://localhost:3000/dashboard`
   - `http://localhost:3000/**`

---

## Step 5: Verify the Setup

1. **Start the FastAPI Backend**:
   ```bash
   cd backend
   # Make sure environment variables are loaded
   uv run python main.py
   ```
   *The backend will automatically detect the `DATABASE_URL` and auto-create all database tables (`users`, `profiles`, `jobs`, `matches`, `tailored_resumes`) in your Supabase PostgreSQL instance.*

2. **Start the Next.js Frontend**:
   ```bash
   cd frontend
   npm run dev
   ```

3. Open `http://localhost:3000` in your browser. 
4. Click **Sign in**. The application will now bypass the sandbox mode and communicate directly with Supabase Auth.
5. Create a new user. You will see their user profile record automatically created/synced in your Supabase PostgreSQL database under the `users` table upon successful login!
