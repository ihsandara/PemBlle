# Coolify DNS & SSL Setup Guide

## Step 1: Find Your Server IP

1. Log into your Coolify dashboard
2. Or SSH to your server and run: `curl ifconfig.me`
3. Note the IP address (e.g., `123.45.67.89`)

## Step 2: Configure DNS at Your Domain Registrar

Go to your domain registrar (GoDaddy, Namecheap, Cloudflare, etc.) and add:

### DNS Records:

```
Type: A
Name: @
Value: YOUR_SERVER_IP (e.g., 123.45.67.89)
TTL: 300
```

If you want www.pemblle.link as well:

```
Type: CNAME
Name: www
Value: pemblle.link
TTL: 300
```

**Example for Cloudflare:**
- Click "DNS" → "Add Record"
- Type: A
- Name: @ (represents root domain)
- IPv4 address: YOUR_SERVER_IP
- Proxy status: OFF (orange cloud disabled) - Important for Let's Encrypt
- TTL: Auto

**Example for Namecheap:**
- Host: @
- Type: A Record
- Value: YOUR_SERVER_IP
- TTL: Automatic

## Step 3: Wait for DNS Propagation

DNS changes can take 5 minutes to 48 hours (usually 5-30 minutes).

Check propagation:
- Visit: https://dnschecker.org/#A/pemblle.link
- Enter: pemblle.link
- Type: A
- Should show your server IP worldwide

## Step 4: Configure Domain in Coolify

1. Open Coolify Dashboard
2. Go to your **PemBlle** resource
3. Click **Domains** tab
4. Add domain: `pemblle.link`
5. **Enable SSL/TLS** (automatic Let's Encrypt)
6. Save

## Step 5: Verify

Once DNS propagates (check dnschecker.org):

1. Visit: `http://pemblle.link` (should redirect to HTTPS)
2. Visit: `https://pemblle.link` (should show your app with SSL)
3. Test API: `https://pemblle.link/api/health`

## Troubleshooting

### DNS not resolving
```bash
# Check if DNS is configured
nslookup pemblle.link

# Should return your server IP
```

### SSL not working
- Make sure Cloudflare proxy is OFF (gray cloud)
- Coolify needs direct access for Let's Encrypt validation
- Check Coolify logs for SSL errors

### App not loading
1. Check all containers are running: Click "Logs" in Coolify
2. Verify environment variables are set
3. Check backend/frontend logs for errors

## Current Environment Variables Required

Make sure these are set in Coolify:

```env
POSTGRES_USER=pemblle
POSTGRES_PASSWORD=izcDzGu2f+4FFFEUQC6IDpplvU33Mk5g
POSTGRES_DB=pemblle
JWT_SECRET=pBnN6j04QMP7mvVQPWjwMx++wHJFoU7vi3feBH7Yk1E=
FRONTEND_URL=https://pemblle.link
SMTP_HOST=smtp.zoho.com
SMTP_PORT=587
SMTP_USER=info@pemblle.link
SMTP_PASS=<YOUR_ZOHO_PASSWORD>
SMTP_FROM=info@pemblle.link
ALLOWED_ORIGINS=https://pemblle.link
```

## How Coolify SSL Works

1. You add domain in Coolify
2. Coolify's Traefik automatically requests SSL certificate from Let's Encrypt
3. Certificate auto-renews every 90 days
4. HTTPS is enforced automatically

No manual SSL configuration needed! ✅
