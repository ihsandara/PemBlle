# Manual Docker Deployment with SSL (Traefik + Let's Encrypt)

This guide is for deploying PemBlle with **self-managed SSL** using Traefik reverse proxy.

## Prerequisites

- VPS/Server with Docker & Docker Compose installed
- Domain name pointing to your server (DNS configured)
- Ports 80 and 443 open in firewall

---

## Step 1: Configure DNS

**Before deploying**, configure your domain's DNS:

### At Your Domain Registrar:

```
Type: A
Name: @
Value: YOUR_SERVER_IP
TTL: 300
```

Optional (for www):
```
Type: CNAME
Name: www
Value: pemblle.link
TTL: 300
```

**Verify DNS:**
```bash
nslookup pemblle.link
# Should return your server IP
```

---

## Step 2: Prepare Server

### SSH to your server:
```bash
ssh root@YOUR_SERVER_IP
```

### Clone repository:
```bash
git clone https://github.com/ihsandara/PemBlle.git
cd PemBlle
```

### Create .env file:
```bash
nano .env
```

Paste this (update with your values):
```env
# Database
POSTGRES_USER=pemblle
POSTGRES_PASSWORD=izcDzGu2f+4FFFEUQC6IDpplvU33Mk5g
POSTGRES_DB=pemblle

# JWT Secret
JWT_SECRET=pBnN6j04QMP7mvVQPWjwMx++wHJFoU7vi3feBH7Yk1E=

# SMTP (Zoho Mail)
SMTP_HOST=smtp.zoho.com
SMTP_PORT=587
SMTP_USER=info@pemblle.link
SMTP_PASS=YOUR_ZOHO_PASSWORD
SMTP_FROM=info@pemblle.link

# Frontend URL
FRONTEND_URL=https://pemblle.link
ALLOWED_ORIGINS=https://pemblle.link
```

Save: `Ctrl+X`, then `Y`, then `Enter`

---

## Step 3: Configure Firewall

```bash
# Allow HTTP and HTTPS
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow 22/tcp  # SSH (if not already allowed)
ufw enable
ufw status
```

---

## Step 4: Deploy with Traefik SSL

### Use the Traefik compose file:
```bash
docker-compose -f docker-compose.traefik.yml up -d --build
```

### Monitor logs:
```bash
docker-compose -f docker-compose.traefik.yml logs -f
```

Look for:
```
✅ traefik       | time="..." level=info msg="Configuration loaded..."
✅ pemblle_db    | database system is ready to accept connections
✅ pemblle_backend | Fiber v2.52.0 http://127.0.0.1:8080
✅ pemblle_frontend | Configuration complete; ready for start up
```

---

## Step 5: Verify SSL Certificate

Wait 1-2 minutes for Traefik to request SSL certificate from Let's Encrypt.

### Check Traefik logs:
```bash
docker logs traefik 2>&1 | grep -i "certificate"
```

Should see:
```
level=info msg="Certificates obtained for domains [pemblle.link]"
```

---

## Step 6: Test Your Application

### Visit your site:
1. **HTTP (will redirect to HTTPS):** http://pemblle.link
2. **HTTPS:** https://pemblle.link ✅
3. **API:** https://pemblle.link/api/health
4. **SSL Test:** https://www.ssllabs.com/ssltest/analyze.html?d=pemblle.link

You should see:
- 🔒 Valid SSL certificate
- Your React app loads
- API responds

---

## Architecture with Traefik

```
Internet
    │
    ├─── :80 (HTTP)  ────────┐
    │                        │
    └─── :443 (HTTPS) ───────┤
                             │
                        ┌────▼────┐
                        │ Traefik │ (Reverse Proxy + SSL)
                        │         │ - Auto SSL from Let's Encrypt
                        │         │ - HTTP → HTTPS redirect
                        └────┬────┘
                             │
                    ┌────────▼────────┐
                    │    Frontend     │ (Nginx)
                    │     Port 80     │
                    └────────┬────────┘
                             │
                   ┌─────────┼─────────┐
                   │         │         │
                /api/*    /ws/*   /uploads/*
                   │         │         │
              ┌────▼─────────▼─────────▼────┐
              │         Backend             │ (Go/Fiber)
              │         Port 8080            │
              └────────────┬─────────────────┘
                           │
                      ┌────▼────┐
                      │   DB    │ (PostgreSQL)
                      │ Port    │
                      │ 5432    │
                      └─────────┘
```

---

## Management Commands

### View logs:
```bash
# All services
docker-compose -f docker-compose.traefik.yml logs -f

# Specific service
docker-compose -f docker-compose.traefik.yml logs -f traefik
docker-compose -f docker-compose.traefik.yml logs -f backend
docker-compose -f docker-compose.traefik.yml logs -f frontend
```

### Restart services:
```bash
docker-compose -f docker-compose.traefik.yml restart
```

### Stop all:
```bash
docker-compose -f docker-compose.traefik.yml down
```

### Update to latest code:
```bash
git pull origin main
docker-compose -f docker-compose.traefik.yml up -d --build
```

### Check SSL certificate expiration:
```bash
echo | openssl s_client -servername pemblle.link -connect pemblle.link:443 2>/dev/null | openssl x509 -noout -dates
```

---

## Troubleshooting

### SSL Certificate Not Generated

**Check Traefik logs:**
```bash
docker logs traefik
```

**Common issues:**
- DNS not propagated yet (wait 10-30 minutes)
- Ports 80/443 blocked by firewall
- Another service using port 80/443

**Fix:**
```bash
# Check what's using port 80
netstat -tlnp | grep :80

# Stop conflicting service
systemctl stop nginx  # or apache2
```

### Certificate Challenge Failed

**Error:** `acme: error: 403`

**Solution:** Make sure:
1. Domain DNS points to this server
2. Port 80 is accessible from internet
3. No firewall blocking Let's Encrypt validation

### Application Not Loading

**Check all containers:**
```bash
docker-compose -f docker-compose.traefik.yml ps
```

All should show "Up":
```
traefik          Up
pemblle_db       Up (healthy)
pemblle_backend  Up
pemblle_frontend Up
```

**Check backend can reach database:**
```bash
docker exec pemblle_backend ping db -c 3
```

---

## Security Recommendations

### 1. Change default secrets:
```bash
# Generate new secrets
openssl rand -base64 32  # For JWT_SECRET
openssl rand -base64 24  # For POSTGRES_PASSWORD
```

Update `.env` with new values and restart:
```bash
docker-compose -f docker-compose.traefik.yml up -d
```

### 2. Enable Traefik dashboard with authentication:

Add to Traefik service in `docker-compose.traefik.yml`:
```yaml
command:
  - "--api.dashboard=true"
labels:
  - "traefik.enable=true"
  - "traefik.http.routers.dashboard.rule=Host(`traefik.pemblle.link`)"
  - "traefik.http.routers.dashboard.middlewares=auth"
  - "traefik.http.middlewares.auth.basicauth.users=admin:$$apr1$$H6uskkkW$$IgXLP6ewTrSuBkTrqE8wj/"
```

Generate password hash:
```bash
echo $(htpasswd -nb admin yourpassword) | sed -e s/\\$/\\$\\$/g
```

### 3. Setup automated backups:

```bash
# Create backup script
nano /root/backup-pemblle.sh
```

```bash
#!/bin/bash
BACKUP_DIR="/root/backups"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# Backup database
docker exec pemblle_db pg_dump -U pemblle pemblle > $BACKUP_DIR/db_$DATE.sql

# Backup uploads
tar -czf $BACKUP_DIR/uploads_$DATE.tar.gz -C /var/lib/docker/volumes uploads_data

# Keep only last 7 days
find $BACKUP_DIR -type f -mtime +7 -delete

echo "Backup completed: $DATE"
```

Make executable and add to crontab:
```bash
chmod +x /root/backup-pemblle.sh
crontab -e
# Add this line (daily at 2 AM):
0 2 * * * /root/backup-pemblle.sh
```

---

## SSL Certificate Auto-Renewal

Traefik **automatically renews** Let's Encrypt certificates before they expire (every 90 days).

No manual action needed! ✅

---

## Monitoring

### Check certificate expiration:
```bash
docker logs traefik 2>&1 | grep renew
```

### Monitor resource usage:
```bash
docker stats
```

### Check disk space:
```bash
df -h
docker system df
```

---

## Support

- **Traefik Docs:** https://doc.traefik.io/traefik/
- **Let's Encrypt:** https://letsencrypt.org/docs/
- **Docker Compose:** https://docs.docker.com/compose/

---

Made with ❤️ by [ihsandara](https://github.com/ihsandara)
