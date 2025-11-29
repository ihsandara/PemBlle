# PemBlle Deployment with Coolify + Manual SSL

## ✅ Current Setup

- **Domain:** pemblle.link
- **DNS:** A record @ → 31.97.183.46 (configured in NameCheap)
- **Platform:** Coolify with Docker Compose
- **SSL:** Traefik + Let's Encrypt (automatic)
- **Environment:** Variables from Coolify configuration

---

## 📋 Required Environment Variables in Coolify

Set these in Coolify's **Environment Variables** section:

```env
POSTGRES_USER=pemblle
POSTGRES_PASSWORD=izcDzGu2f+4FFFEUQC6IDpplvU33Mk5g
POSTGRES_DB=pemblle
JWT_SECRET=pBnN6j04QMP7mvVQPWjwMx++wHJFoU7vi3feBH7Yk1E=
SMTP_HOST=smtp.zoho.com
SMTP_PORT=587
SMTP_USER=info@pemblle.link
SMTP_PASS=YOUR_ZOHO_APP_PASSWORD
SMTP_FROM=info@pemblle.link
FRONTEND_URL=https://pemblle.link
ALLOWED_ORIGINS=https://pemblle.link
```

**Important:** Replace `YOUR_ZOHO_APP_PASSWORD` with your actual Zoho mail password.

---

## 🚀 Deployment Flow

### How It Works:

```
1. Coolify injects environment variables into containers
   ↓
2. Docker Compose starts 4 services:
   - Traefik (ports 80, 443) → Reverse proxy + SSL
   - PostgreSQL → Database
   - Backend (Go) → API on port 8080
   - Frontend (Nginx) → Serves React app on port 80
   ↓
3. Traefik automatically:
   - Requests SSL certificate from Let's Encrypt
   - Routes pemblle.link → frontend container
   - Redirects HTTP → HTTPS
   - Auto-renews certificate every 90 days
```

---

## 📝 Deployment Steps in Coolify

### Step 1: Ensure Environment Variables Are Set

In Coolify Dashboard:
1. Go to your **PemBlle** resource
2. Click **Environment** or **Configuration** tab
3. Add all the environment variables listed above
4. Save

### Step 2: Deploy

1. Click **"Deploy"** or **"Redeploy"**
2. Coolify will:
   - Pull latest code from GitHub
   - Inject environment variables
   - Run `docker-compose up`
   - Start all 4 services

### Step 3: Monitor Logs

In Coolify, check logs for:

**Traefik:**
```
✅ Configuration loaded
✅ Server listening on :80
✅ Server listening on :443
✅ Certificates obtained for domains [pemblle.link]
```

**Backend:**
```
✅ Fiber v2.52.0
✅ http://127.0.0.1:8080
```

**Frontend:**
```
✅ Configuration complete; ready for start up
```

**Database:**
```
✅ database system is ready to accept connections
```

### Step 4: Wait for DNS + SSL

- **DNS Propagation:** 10-30 minutes
- **SSL Certificate:** 1-2 minutes after DNS is ready

Check DNS: https://dnschecker.org/#A/pemblle.link

---

## 🔍 Verification

### After DNS Propagates:

1. **HTTP (redirects to HTTPS):**
   ```
   http://pemblle.link → https://pemblle.link
   ```

2. **HTTPS (your app):**
   ```
   https://pemblle.link
   ✓ Shows your React app
   ✓ 🔒 Padlock icon (valid SSL)
   ```

3. **API Endpoint:**
   ```
   https://pemblle.link/api/health
   Response: {"status":"OK"}
   ```

4. **Check SSL Certificate:**
   - Click padlock in browser
   - Should show: "Issued by: Let's Encrypt"
   - Valid for 90 days, auto-renews

---

## 🏗️ Architecture

```
                    Internet
                       │
                       ▼
                   DNS Query
                 pemblle.link
                       │
                       ▼
              Server: 31.97.183.46
                       │
          ┌────────────┴────────────┐
          │                         │
      Port 80 (HTTP)          Port 443 (HTTPS)
          │                         │
          └──────────┬──────────────┘
                     │
                ┌────▼────┐
                │ Traefik │ (Reverse Proxy)
                │         │ - SSL termination
                │         │ - HTTP → HTTPS
                └────┬────┘
                     │
        ┌────────────┴────────────┐
        │      Frontend           │
        │   (Nginx on port 80)    │
        │   Serves React app      │
        └──────┬──────────────────┘
               │
    ┌──────────┼──────────┐
    │          │          │
  /api/*    /ws/*    /uploads/*
    │          │          │
    └──────────┴──────────┘
               │
        ┌──────▼──────┐
        │   Backend   │ (Go/Fiber)
        │  Port 8080  │
        └──────┬──────┘
               │
        ┌──────▼──────┐
        │  Database   │ (PostgreSQL)
        │  Port 5432  │
        └─────────────┘
```

---

## 🔧 Troubleshooting

### Issue: SSL Certificate Not Generated

**Check Traefik logs in Coolify:**
- Look for errors mentioning "acme" or "certificate"
- Common issue: DNS not propagated yet
- **Solution:** Wait 10-30 minutes for DNS

### Issue: "Connection Refused"

**Possible causes:**
1. Firewall blocking ports 80/443
2. Traefik not started
3. DNS not resolved

**Solution:**
- Check all containers are running in Coolify logs
- Verify DNS with: https://dnschecker.org

### Issue: Environment Variables Not Working

**Symptom:** Backend logs show "No .env file found" (this is normal)

**Verify:** Check backend logs for actual values:
- Should NOT show "pemblle_secret" (default)
- Should show your actual values from Coolify config

**If seeing defaults:**
- Re-check environment variables in Coolify
- Redeploy the application

### Issue: CORS Errors

**Symptom:** Frontend can't call backend API

**Solution:** Ensure in Coolify environment:
```env
FRONTEND_URL=https://pemblle.link
ALLOWED_ORIGINS=https://pemblle.link
```

---

## 🔐 Security Notes

### SSL/TLS:
- ✅ Certificates from Let's Encrypt (trusted CA)
- ✅ Auto-renewal every 90 days
- ✅ HTTP → HTTPS redirect enforced
- ✅ TLS 1.2+ only

### Environment Variables:
- ✅ Stored securely in Coolify
- ✅ Injected at runtime (not in code)
- ✅ Not committed to Git

### Database:
- ✅ Internal network only (not exposed)
- ✅ Strong password
- ✅ Persistent volume for data

---

## 📊 Monitoring

### In Coolify Dashboard:

**Check Container Status:**
- All 4 containers should be "Running"
- Green status indicators

**Check Logs:**
- Traefik: SSL certificate obtained
- Backend: Fiber started
- Frontend: Nginx running
- Database: Ready for connections

**Resource Usage:**
- CPU, Memory, Disk for each container
- Should be stable after startup

---

## 🔄 Updates

### To Update Code:

1. Push changes to GitHub
2. In Coolify: Click **"Redeploy"**
3. Coolify will:
   - Pull latest code
   - Rebuild images
   - Restart containers
   - Keep environment variables
   - Maintain SSL certificate

---

## ✅ Checklist

- [ ] DNS A record configured: @ → 31.97.183.46
- [ ] Environment variables set in Coolify
- [ ] SMTP_PASS updated with real Zoho password
- [ ] Deployed in Coolify
- [ ] All 4 containers running (traefik, db, backend, frontend)
- [ ] DNS propagated (check dnschecker.org)
- [ ] SSL certificate obtained (check Traefik logs)
- [ ] https://pemblle.link works
- [ ] API responding: https://pemblle.link/api/health

---

## 🆘 Need Help?

Check these in order:

1. **DNS not working:**
   - Verify on dnschecker.org
   - May take up to 48 hours (usually 10-30 minutes)

2. **SSL not working:**
   - Check Traefik logs for "certificate" or "acme"
   - Make sure DNS is propagated first
   - Port 80 must be accessible for Let's Encrypt validation

3. **App not loading:**
   - Check all containers are running in Coolify
   - Check backend/frontend logs for errors
   - Verify environment variables are set

4. **Email not sending:**
   - Verify SMTP_PASS in Coolify env variables
   - Test Zoho credentials manually
   - Check backend logs for SMTP errors

---

**Estimated Total Time:** 20-40 minutes (including DNS propagation)

**Your app should be live at: https://pemblle.link** 🎉
