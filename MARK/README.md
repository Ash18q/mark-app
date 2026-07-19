# MARK — Link Manager PWA

> A mobile-first Progressive Web App to save, tag, and organise links from any platform.  
> Built with **React 18 + Vite + Supabase + Tailwind CSS**.

---

## 📁 Project Structure

```
MARK/
├── public/
│   ├── manifest.json        # PWA manifest (with Share Target)
│   └── icon-512.png         # App icon
├── src/
│   ├── context/
│   │   └── AuthContext.jsx  # Auth + Links state (React Context)
│   ├── pages/
│   │   ├── Auth.jsx         # Login + Signup pages
│   │   └── Dashboard.jsx    # Main dashboard UI
│   ├── App.jsx              # Router + Provider setup
│   ├── main.jsx             # Entry point
│   ├── supabaseClient.js    # Supabase client singleton
│   └── index.css            # Tailwind + global styles
├── .env.example             # Environment variable template
├── index.html               # PWA-ready HTML shell
├── tailwind.config.js
├── vite.config.js
└── README.md
```

---

## ⚙️ Environment Variables

Copy `.env.example` to `.env` and fill in your Supabase credentials:

```bash
cp .env.example .env
```

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

Find these in your Supabase Dashboard → **Settings → API**.

---

## 🗄️ Database Schema

Run the following SQL in your **Supabase SQL Editor** (Dashboard → SQL Editor → New Query):

```sql
-- Create the links table
CREATE TABLE links (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  url TEXT NOT NULL,
  tag TEXT NOT NULL,
  platform TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE links ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only CRUD their own links
CREATE POLICY "Users can CRUD their own links"
ON links FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
```

---

## 🚀 Running Locally

### Prerequisites

- **Node.js** ≥ 18  
- **npm** ≥ 9  
- A [Supabase](https://supabase.com) project (free tier works)

### Steps

```bash
# 1. Clone the repo
git clone <your-repo-url>
cd MARK

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env
# Edit .env with your Supabase URL and ANON KEY

# 4. Start the dev server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 📱 PWA Share Target

On Android (Chrome), after installing the app:

1. Open any webpage → tap **Share → MARK**  
2. The Dashboard opens with the URL pre-filled in the Add Link form  
3. Just enter a tag and platform, then save

The manifest's `share_target` handles this via:
```json
"share_target": {
  "action": "/?share=true",
  "method": "GET",
  "params": { "title": "title", "text": "url", "url": "url" }
}
```

---

## ☁️ Deploying to Vercel

### One-Click Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

### Manual Steps

```bash
# 1. Install Vercel CLI
npm i -g vercel

# 2. Deploy
vercel

# 3. Add environment variables in Vercel Dashboard:
#    VITE_SUPABASE_URL  →  your Supabase project URL
#    VITE_SUPABASE_ANON_KEY  →  your Supabase anon key
```

### ⚠️ Important: SPA Routing on Vercel

Create a `vercel.json` at the project root to handle React Router:

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

---

## 🛠️ Tech Stack

| Layer        | Technology                  |
|--------------|-----------------------------|
| Frontend     | React 18 (Functional + Hooks) |
| Bundler      | Vite 6                      |
| Routing      | React Router v6             |
| Auth + DB    | Supabase (PostgreSQL + Auth) |
| Styling      | Tailwind CSS v3             |
| PWA          | Web App Manifest + Share Target |

---

## ✨ Features

- 🔐 **Email/Password Auth** via Supabase
- 📎 **Add Links** with URL, Tag, and Platform fields
- 🏷️ **Tag Autocomplete** — suggests your previously used tags
- 📊 **Platform Stats** — count per platform (e.g. YT: 5 | Insta: 3)
- 🔍 **Filter & Sort** — dropdown filters for tag/platform, sortable by date
- 🗑️ **Delete Links** — with hover-reveal delete button
- 📱 **PWA Share Target** — receive shared URLs from mobile OS
- 📲 **Mobile-First Design** — optimized for phone screens

---

## 📄 License

MIT
