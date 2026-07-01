# RFPlab — Freight Intelligence Platform

Contracted RFP management + Spot Load auction for TL freight procurement.

---

## Deploy in 15 minutes — no coding required

### What you need
- A free GitHub account → github.com
- A free Vercel account → vercel.com (sign up with your GitHub account)
- This folder of files

---

### Step 1 — Create a GitHub repository

1. Go to **github.com** and sign in
2. Click the **+** button (top right) → **New repository**
3. Name it `rfplab` (or anything you like)
4. Leave it **Public** (required for free Vercel)
5. Do NOT check "Add README" — click **Create repository**

---

### Step 2 — Upload your files to GitHub

GitHub will show you an empty repo page. Look for the link that says **"uploading an existing file"** and click it.

1. Drag and drop the entire contents of this folder into the upload area:
   - `index.html`
   - `package.json`
   - `vite.config.js`
   - `vercel.json`
   - `.gitignore`
   - `src/` folder (contains `main.jsx` and `App.jsx`)
   - `public/` folder (contains `favicon.svg`)

2. Scroll down, write a commit message like `initial upload`, click **Commit changes**

---

### Step 3 — Deploy to Vercel

1. Go to **vercel.com** and click **Sign Up** → choose **Continue with GitHub**
2. Click **Add New Project**
3. You'll see your `rfplab` repository — click **Import**
4. Vercel auto-detects Vite. Leave all settings as-is.
5. Click **Deploy**

Vercel builds the project (takes ~60 seconds). When it says **"Congratulations!"**, your app is live.

Your URL will look like: `https://rfplab-yourname.vercel.app`

---

### Step 4 — Connect your domain (rfplab.com)

1. In your Vercel project, go to **Settings → Domains**
2. Type `rfplab.com` and click **Add**
3. Vercel shows you DNS records to add
4. Log in to wherever you bought rfplab.com (GoDaddy, Namecheap, Cloudflare, etc.)
5. Find the **DNS settings** and add the records Vercel shows you
6. Wait 5–30 minutes for DNS to propagate

Done — rfplab.com is live.

---

### Making changes

Every time you want to update the app:
1. Edit `src/App.jsx` in Claude
2. Download the updated file
3. Go to your GitHub repo → click `src/App.jsx` → click the pencil (Edit) icon → paste the new content → Commit
4. Vercel automatically redeploys within 60 seconds

---

### What's included

- **Admin console** — platform overview, RFP management, spot board
- **Shipper portal** — contracted RFP wizard (10-step), spot load posting, results, awards, activity log
- **Carrier portal** — bid details, rate submission, standing, spot board with blind quoting
- **RFP Wizard** — 10-step bid builder: term, rate structure, award strategy, lane upload, carrier data fields, carrier list, timeline, notifications, review & launch with invite preview
- **Spot Load Board** — real-time load auction with timed quote windows, blind carrier quoting, and shipper award flow

---

### Next steps (when you're ready for a real backend)

| What | Tool | Why |
|---|---|---|
| User accounts & login | Supabase Auth | Free, handles invite-only access |
| Database | Supabase Postgres | Stores RFPs, loads, quotes, carriers |
| File uploads | Supabase Storage | Lane files, FSC tables, term sheets |
| Email | Resend.com | Carrier invites, reminders, awards |
| Payments | Stripe | Shipper subscription billing |

A developer can wire these in using the existing app as the complete UI layer — no redesign needed.
