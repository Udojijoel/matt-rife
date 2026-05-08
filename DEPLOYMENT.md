<!-- @format -->

# Deployment Guide — Vercel & Netlify (via GitHub)

This frontend is a Vite + React static site. The backend (auth, database, storage) runs on **Lovable Cloud** and keeps working regardless of where you host the frontend.

---

## Step 1 — Push to GitHub

---

## Step 2 — Required Environment Variables

You must set these on your hosting provider (same values as your local `.env`):

| Variable                        | Value source                                |
| ------------------------------- | ------------------------------------------- |
| `VITE_SUPABASE_URL`             | `https://hyfeemxfrjvlqknlseqi.supabase.co`  |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | The long `eyJ...` anon key from your `.env` |
| `VITE_SUPABASE_PROJECT_ID`      | `hyfeemxfrjvlqknlseqi`                      |

> If any are missing, the app will show a "Configuration error" screen instead of a blank page.

---

## Step 3a — Deploy to Vercel

1. Go to <https://vercel.com/new> and import your GitHub repo.
2. **Framework Preset:** Vite
3. **Build Command:** `npm run build`
4. **Output Directory:** `dist`
5. **Install Command:** `npm install`
6. Expand **Environment Variables** and add the three vars from Step 2 (for Production, Preview, Development).
7. Click **Deploy**.

SPA routing is already handled by `vercel.json` in the repo root.

---

## Step 3b — Deploy to Netlify

1. Go to <https://app.netlify.com/start> and pick your GitHub repo.
2. **Build command:** `npm run build`
3. **Publish directory:** `dist`
4. Under **Site settings → Environment variables**, add the three vars from Step 2.
5. Add SPA redirect — create `public/_redirects` with:
   ```
   /*    /index.html   200
   ```
6. Click **Deploy site**.

---

## Step 4 — Update Auth Redirect URLs

After your site is live, update the allowed redirect URLs so login works:

- In Lovable: **Cloud → Users → Auth Settings → URL Configuration**
- Set **Site URL** to your new domain (e.g. `https://your-app.vercel.app`)
- Add it to **Redirect URLs** as well

---

## Step 5 — Custom Domain (optional)

Both Vercel and Netlify let you add a custom domain for free under **Domains** in the project settings. Point your Namecheap DNS as instructed by the host.

---

## Troubleshooting

- **Blank page / "Configuration error"** → environment variables not set. Re-check Step 2 and redeploy.
- **404 on page refresh** → SPA fallback missing (Vercel: `vercel.json`, Netlify: `_redirects`).
- **Login redirects to wrong URL** → Step 4 not done.
- **WhatsApp links blocked (`api.whatsapp.com is blocked`)** → ad blocker/network filter on the user's device. Not a deployment issue.
