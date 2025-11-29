# 🚀 PemBlle Deployment - Quick Fix Guide

## Current Issue: `DNS_PROBE_POSSIBLE`

**Problem:** Domain `pemblle.link` doesn't point to your server yet.

---

## ✅ **SOLUTION (Choose ONE):**

### Option A: Use Coolify (Easiest - Recommended)

1. **Configure DNS First:**
   - Go to your domain registrar
   - Add A record: `@` → Your Coolify server IP
   - Wait 10-30 minutes for DNS propagation

2. **In Coolify Dashboard:**
   - Go to your PemBlle resource
   - Click "Domains" tab
   - Add: `pemblle.link`
   - Enable SSL/TLS
   - Save & Deploy

3. **Coolify handles SSL automatically!** ✅

### Option B: Manual Deployment with Traefik

1. **Configure DNS (same as above)**

2. **SSH to your server:**
   ```bash
   ssh root@YOUR_SERVER_IP
   cd PemBlle
   ```

3. **Deploy with Traefik:**
   ```bash
   docker-compose -f docker-compose.traefik.yml up -d --build
   ```

4. **Traefik gets SSL from Let's Encrypt automatically!** ✅

---

## 📋 **Step-by-Step Checklist:**

### 1. Get Your Server IP
```bash
# On your server, run:
curl ifconfig.me
```

### 2. Configure DNS at Domain Registrar

**Example (Cloudflare):**
```
Type: A
Name: @
Value: YOUR_SERVER_IP
Proxy: OFF (gray cloud)
```

**Example (Namecheap/GoDaddy):**
```
Host: @
Type: A
Value: YOUR_SERVER_IP
TTL: 300
```

### 3. Verify DNS
Visit: https://dnschecker.org/#A/pemblle.link

Should show your server IP ✅

### 4. Deploy

**If using Coolify:**
- Just add domain in Coolify dashboard
- Enable SSL
- Done! ✅

**If manual deployment:**
```bash
cd /path/to/PemBlle
docker-compose -f docker-compose.traefik.yml up -d --build
```

### 5. Test
- Visit: https://pemblle.link
- Should show your app with SSL! 🎉

---

## 🔍 **Quick Verification Commands:**

### Check DNS is configured:
```bash
nslookup pemblle.link
```

### Check if site is reachable:
```bash
curl -I https://pemblle.link
```

### View logs (if using Traefik):
```bash
docker-compose -f docker-compose.traefik.yml logs -f
```

---

## ⏰ **Timeline:**

| Step | Time |
|------|------|
| Configure DNS | 2 minutes |
| DNS Propagation | 10-30 minutes |
| Deploy | 5 minutes |
| SSL Certificate | 1-2 minutes (automatic) |
| **Total** | **~20-40 minutes** |

---

## 🆘 **Common Issues:**

### "DNS_PROBE_POSSIBLE"
→ DNS not configured or not propagated yet
→ **Solution:** Configure DNS, wait 10-30 minutes

### "Connection refused"
→ Firewall blocking ports 80/443
→ **Solution:** Open ports in firewall

### "Certificate error"
→ SSL not ready yet
→ **Solution:** Wait 2 minutes for Let's Encrypt

---

## 📁 **Files Created:**

- `COOLIFY_SETUP.md` - Coolify deployment guide
- `MANUAL_DEPLOYMENT.md` - Manual deployment with Traefik
- `docker-compose.traefik.yml` - Production compose with SSL
- `generate-secrets.ps1` - Generate secure passwords

---

## 🎯 **Recommended Path:**

Since you're using Coolify, just **configure DNS** and let Coolify handle everything else!

1. Add A record in DNS → Point to Coolify server IP
2. Wait for DNS (check dnschecker.org)
3. Add domain in Coolify dashboard
4. Enable SSL
5. Deploy
6. Done! ✅

**No need for manual Traefik setup!** Coolify has it built-in.

---

Need help? Check the detailed guides:
- **Coolify:** See `COOLIFY_SETUP.md`
- **Manual:** See `MANUAL_DEPLOYMENT.md`
