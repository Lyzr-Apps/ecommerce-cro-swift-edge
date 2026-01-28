# AI-CRO Advisor - Deployment Guide for aimpler.com

## Application Overview
AI-CRO Advisor: E-commerce optimization platform for AI-search visibility and Google Shopping ecosystem management.

## Pre-Deployment Checklist

### 1. Environment Variables
Ensure these are set in your hosting platform:

```env
VITE_AGENT_API_URL=<your-lyzr-agent-api-url>
VITE_AGENT_ID=69797ab1a5d355f8aa48876f
```

### 2. Build Configuration
- Build Command: `npm run build`
- Output Directory: `dist`
- Node Version: 18.x or higher

## Deployment Options for aimpler.com

### Option 1: Vercel (Recommended)

**Step 1: Install Vercel CLI**
```bash
npm i -g vercel
```

**Step 2: Deploy**
```bash
cd /app/project
vercel
```

**Step 3: Add Custom Domain**
- Go to Vercel Dashboard > Your Project > Settings > Domains
- Add: `aimpler.com` and `www.aimpler.com`
- Follow DNS configuration instructions

**Step 4: Configure Environment Variables**
- Go to Settings > Environment Variables
- Add `VITE_AGENT_API_URL` and `VITE_AGENT_ID`
- Redeploy after adding variables

**DNS Configuration:**
```
Type: A
Name: @
Value: 76.76.21.21 (Vercel IP)

Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

### Option 2: Netlify

**Step 1: Build Locally**
```bash
npm run build
```

**Step 2: Deploy via Netlify CLI**
```bash
npm install -g netlify-cli
netlify deploy --prod
```

**Step 3: Add Custom Domain**
- Netlify Dashboard > Domain Settings
- Add `aimpler.com`
- Update DNS records as instructed

**DNS Configuration:**
```
Type: A
Name: @
Value: 75.2.60.5 (Netlify IP)

Type: CNAME
Name: www
Value: <your-site>.netlify.app
```

### Option 3: GitHub Pages + Custom Domain

**Step 1: Add to package.json**
```json
"homepage": "https://aimpler.com"
```

**Step 2: Install gh-pages**
```bash
npm install --save-dev gh-pages
```

**Step 3: Add deploy script**
```json
"scripts": {
  "deploy": "npm run build && gh-pages -d dist"
}
```

**Step 4: Deploy**
```bash
npm run deploy
```

**Step 5: Configure Custom Domain**
- Create `public/CNAME` file with content: `aimpler.com`
- In GitHub repo: Settings > Pages > Custom domain > Add `aimpler.com`

**DNS Configuration:**
```
Type: A
Name: @
Values:
  185.199.108.153
  185.199.109.153
  185.199.110.153
  185.199.111.153

Type: CNAME
Name: www
Value: <username>.github.io
```

### Option 4: Traditional Hosting (cPanel/VPS)

**Step 1: Build**
```bash
npm run build
```

**Step 2: Upload**
- Upload contents of `dist/` folder to your web root
- Typically: `/public_html/` or `/var/www/html/`

**Step 3: Configure Web Server**

**For Apache (.htaccess):**
```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

**For Nginx:**
```nginx
location / {
  try_files $uri $uri/ /index.html;
}
```

**Step 4: Point Domain**
- Update A record to point to your server IP
- Update CNAME for www subdomain

## SSL Certificate
All recommended platforms (Vercel, Netlify, GitHub Pages) provide free SSL automatically.

For traditional hosting:
- Use Let's Encrypt (free)
- Or enable AutoSSL in cPanel

## Post-Deployment Verification

### 1. Check Routes
Test these URLs work correctly:
- `https://aimpler.com` (homepage/onboarding)
- `https://aimpler.com/dashboard` (should redirect to /)
- `https://aimpler.com/any-path` (should load app)

### 2. Verify Agent Connection
- Enter a store URL in onboarding
- Confirm AI-search analysis runs
- Check GMC optimization features work

### 3. Test Core Features
- Store URL input and analysis
- AI-search visibility scoring
- Google presence detection
- Permission request modal
- GMC autonomous control
- Optimization queue
- Actions history

### 4. Performance Check
- Page load speed < 3s
- Lighthouse score > 90
- Mobile responsiveness
- Cross-browser compatibility

## Continuous Deployment

### Vercel (Automatic)
- Connect GitHub repo
- Auto-deploys on push to main branch
- Preview deployments for PRs

### Netlify (Automatic)
- Connect GitHub repo
- Auto-deploys on push
- Deploy previews for branches

## Monitoring

### Recommended Tools
- Vercel Analytics (built-in)
- Google Analytics 4
- Sentry for error tracking
- Hotjar for user behavior

## Domain Configuration Summary

**For aimpler.com:**
1. Point A record to hosting provider IP
2. Point www CNAME to hosting provider
3. Enable SSL/HTTPS
4. Set up redirects (www → non-www or vice versa)
5. Verify DNS propagation (can take 24-48 hours)

## Support

**Build Issues:**
```bash
# Clear cache and rebuild
rm -rf node_modules dist
npm install
npm run build
```

**Deployment Issues:**
- Check environment variables are set
- Verify Node version (18.x+)
- Check build logs for errors
- Ensure `dist/` folder contains index.html

## Files Configured for Deployment

- `netlify.toml` - Netlify configuration with redirects
- `vercel.json` - Vercel configuration with rewrites
- `public/_redirects` - SPA routing fallback
- `index.html` - Updated with proper meta tags and canonical URL
- `vite.config.ts` - Build output configured

## Quick Start (Recommended Path)

```bash
# 1. Build the application
npm install
npm run build

# 2. Deploy to Vercel
npm i -g vercel
vercel

# 3. Add custom domain in Vercel dashboard
# Domain: aimpler.com

# 4. Update DNS records at your domain registrar
# Follow Vercel's instructions

# 5. Add environment variables in Vercel
# VITE_AGENT_API_URL
# VITE_AGENT_ID

# 6. Redeploy to apply environment variables
vercel --prod
```

Your AI-CRO Advisor will be live at https://aimpler.com
