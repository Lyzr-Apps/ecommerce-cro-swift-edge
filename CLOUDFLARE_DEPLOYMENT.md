# Cloudflare Pages Deployment Guide - aimpler.com

Complete guide to deploy Aimpler to Cloudflare Pages with custom domain www.aimpler.com

## Prerequisites

- Cloudflare account
- Domain aimpler.com added to Cloudflare DNS
- GitHub repository (optional, for automatic deployments)

## Deployment Methods

### Method 1: Cloudflare Pages Direct Upload (Recommended for Quick Deploy)

#### Step 1: Build the Application
```bash
npm install
npm run build
```

This creates a `dist` folder with your production build.

#### Step 2: Deploy to Cloudflare Pages

**Option A: Using Cloudflare Dashboard**

1. Log in to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Go to **Pages** in the sidebar
3. Click **Create a project**
4. Click **Direct Upload**
5. Name your project: `aimpler`
6. Drag and drop the `dist` folder or click to upload
7. Click **Deploy site**

**Option B: Using Wrangler CLI**

```bash
# Install Wrangler
npm install -g wrangler

# Login to Cloudflare
wrangler login

# Deploy
wrangler pages deploy dist --project-name=aimpler
```

#### Step 3: Configure Custom Domain

1. In Cloudflare Pages dashboard, go to your `aimpler` project
2. Click **Custom domains** tab
3. Click **Set up a custom domain**
4. Enter: `www.aimpler.com`
5. Click **Continue**
6. Cloudflare will automatically configure DNS
7. Add another domain: `aimpler.com` (apex domain)
8. Set up redirect from `aimpler.com` → `www.aimpler.com` (or vice versa)

#### Step 4: Add Environment Variables

1. Go to **Settings** > **Environment variables**
2. Add the following variables:

**Production:**
```
VITE_AGENT_API_URL = <your-lyzr-agent-api-url>
VITE_AGENT_ID = 69797ab1a5d355f8aa48876f
```

3. Click **Save**
4. Redeploy for changes to take effect

---

### Method 2: GitHub Integration (Recommended for Continuous Deployment)

#### Step 1: Push Code to GitHub

```bash
# Initialize git if not already done
git init
git add .
git commit -m "Initial commit - Aimpler app"

# Create GitHub repo and push
git remote add origin https://github.com/YOUR_USERNAME/aimpler.git
git branch -M main
git push -u origin main
```

#### Step 2: Connect to Cloudflare Pages

1. Go to [Cloudflare Pages](https://dash.cloudflare.com/pages)
2. Click **Create a project**
3. Click **Connect to Git**
4. Select your GitHub repository
5. Configure build settings:

```
Production branch: main
Build command: npm run build
Build output directory: dist
Root directory: /
Node version: 18
```

6. Click **Advanced** and add environment variables:
```
VITE_AGENT_API_URL = <your-lyzr-agent-api-url>
VITE_AGENT_ID = 69797ab1a5d355f8aa48876f
```

7. Click **Save and Deploy**

#### Step 3: Configure Custom Domain
Same as Method 1, Step 3 above.

---

## DNS Configuration

Cloudflare automatically handles DNS when you add a custom domain, but here's what happens:

### For www.aimpler.com
```
Type: CNAME
Name: www
Target: aimpler.pages.dev
Proxy status: Proxied (orange cloud)
```

### For aimpler.com (apex)
```
Type: CNAME
Name: @
Target: aimpler.pages.dev
Proxy status: Proxied (orange cloud)
```

### Redirect Setup (Optional)
To redirect `aimpler.com` → `www.aimpler.com`:

1. Go to **Rules** > **Page Rules** in Cloudflare dashboard
2. Create new rule:
```
URL: aimpler.com/*
Setting: Forwarding URL
Status Code: 301 - Permanent Redirect
Destination URL: https://www.aimpler.com/$1
```

---

## Build Configuration Files

The following files are already configured:

### `wrangler.toml`
Cloudflare Pages configuration with SPA redirects.

### `public/_redirects`
SPA routing fallback:
```
/* /index.html 200
```

### `public/_headers`
Security headers for all routes.

---

## Post-Deployment Verification

### 1. Test Routes
- `https://www.aimpler.com/` - Homepage loads
- `https://www.aimpler.com/dashboard` - SPA routing works
- `https://aimpler.com` - Redirects to www (if configured)

### 2. Test Application Features
- Store URL input and analysis
- AI-search visibility scoring
- Google Business Profile detection
- Google Merchant Center detection
- Permission modal for GMC control
- Optimization dashboard
- Actions history

### 3. Check Performance
- Go to **Analytics** in Cloudflare Pages
- Monitor page load times
- Check Core Web Vitals
- Verify caching is working

### 4. SSL Certificate
- Cloudflare automatically provisions SSL
- Verify HTTPS is working: `https://www.aimpler.com`
- Check certificate validity in browser

---

## Continuous Deployment (GitHub Integration)

Once connected to GitHub:

1. **Automatic Deployments:**
   - Push to `main` branch → auto-deploy to production
   - Push to other branches → auto-deploy preview

2. **Preview Deployments:**
   - Every pull request gets a unique preview URL
   - Format: `https://abc123.aimpler.pages.dev`

3. **Rollback:**
   - Go to **Deployments** tab
   - Click on any previous deployment
   - Click **Rollback to this deployment**

---

## Environment-Specific Builds

### Production
Uses environment variables from **Production** section.

### Preview
Add separate variables in **Preview** section for testing.

---

## Troubleshooting

### Issue: Build Fails

**Check:**
```bash
# Local build test
npm install
npm run build

# Check Node version
node --version  # Should be 18.x or higher
```

**Solution:**
- Ensure `package.json` has all dependencies
- Verify Node version in Cloudflare settings matches local
- Check build logs in Cloudflare dashboard

### Issue: SPA Routes Return 404

**Solution:**
- Verify `public/_redirects` exists with `/* /index.html 200`
- Check Cloudflare Pages **Functions** tab for any conflicting rules

### Issue: Environment Variables Not Working

**Solution:**
- Ensure variables are prefixed with `VITE_`
- Redeploy after adding/changing variables
- Check browser console for API errors

### Issue: Custom Domain Not Working

**Solution:**
- Wait 5-10 minutes for DNS propagation
- Verify domain is active in Cloudflare DNS
- Check nameservers point to Cloudflare
- Clear browser cache and test in incognito

---

## Performance Optimizations

Cloudflare Pages provides:

1. **Global CDN:**
   - Content served from 300+ edge locations
   - Automatic caching of static assets

2. **Automatic Minification:**
   - HTML, CSS, JS automatically minified
   - Enable in **Speed** > **Optimization** tab

3. **Brotli Compression:**
   - Enabled by default
   - Better compression than gzip

4. **HTTP/3 Support:**
   - Automatic QUIC protocol support
   - Faster page loads

---

## Quick Deployment Commands

### Initial Deploy
```bash
# Build
npm run build

# Deploy via Wrangler
wrangler pages deploy dist --project-name=aimpler
```

### Update Deployment
```bash
# Rebuild
npm run build

# Deploy update
wrangler pages deploy dist --project-name=aimpler
```

### Deploy from GitHub
```bash
# Just push to main
git add .
git commit -m "Update application"
git push origin main
# Cloudflare auto-deploys
```

---

## URLs After Deployment

- **Production:** https://www.aimpler.com
- **Cloudflare Pages URL:** https://aimpler.pages.dev
- **Preview (from PRs):** https://[commit-hash].aimpler.pages.dev

---

## Monitoring & Analytics

### Built-in Analytics (Free)
- Page views
- Unique visitors
- Bandwidth usage
- Top pages
- Top referrers

### Web Analytics (Optional)
Enable in Cloudflare dashboard:
- Detailed visitor analytics
- Privacy-focused (no cookies)
- GDPR compliant

---

## Security Features (Included)

1. **DDoS Protection:** Cloudflare's network-level protection
2. **SSL/TLS:** Automatic HTTPS with free certificate
3. **WAF:** Web Application Firewall (optional, paid)
4. **Rate Limiting:** Protect against API abuse (optional)
5. **Security Headers:** Configured in `_headers` file

---

## Cost

- **Cloudflare Pages:** Free (unlimited sites, unlimited requests)
- **Bandwidth:** Free (unlimited)
- **Builds:** 500 builds/month (free), unlimited on paid plans
- **Custom Domains:** Free (unlimited)

---

## Support

**Cloudflare Issues:**
- Community: https://community.cloudflare.com
- Support: https://support.cloudflare.com

**Application Issues:**
- Check browser console for errors
- Verify API connectivity to Lyzr agents
- Test environment variables are set correctly

---

## Next Steps After Deployment

1. Set up Web Analytics
2. Configure caching rules (if needed)
3. Enable Cloudflare's automatic minification
4. Set up Page Rules for redirects (if needed)
5. Monitor performance in Analytics dashboard
6. Connect domain email forwarding (optional)

---

Your Aimpler application will be live at **https://www.aimpler.com** with:
- Global CDN delivery
- Automatic HTTPS
- Infinite scalability
- Zero server management
