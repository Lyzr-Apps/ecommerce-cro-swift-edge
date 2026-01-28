# Cloudflare Pages - Quick Deployment

Deploy Aimpler to www.aimpler.com in 3 steps.

## Step 1: Build

```bash
npm install
npm run build
```

## Step 2: Deploy

### Option A: Using Script (Easiest)
```bash
./deploy-cloudflare.sh
```

### Option B: Using Wrangler
```bash
npm install -g wrangler
wrangler login
wrangler pages deploy dist --project-name=aimpler
```

### Option C: Dashboard Upload
1. Go to [Cloudflare Pages](https://dash.cloudflare.com/pages)
2. Click "Create a project" > "Direct Upload"
3. Upload the `dist` folder
4. Name: `aimpler`

## Step 3: Configure Domain

1. In Cloudflare Pages > `aimpler` project
2. Go to "Custom domains"
3. Add: `www.aimpler.com`
4. Cloudflare auto-configures DNS

## Environment Variables

Add in Cloudflare dashboard (Settings > Environment variables):

```
VITE_AGENT_API_URL = <your-lyzr-api-url>
VITE_AGENT_ID = 69797ab1a5d355f8aa48876f
```

## URLs

- Production: https://www.aimpler.com
- Cloudflare: https://aimpler.pages.dev

## Redeploy

```bash
npm run deploy:cloudflare
```

Done! See `CLOUDFLARE_DEPLOYMENT.md` for full guide.
