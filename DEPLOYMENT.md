# Coolify Deployment Guide for PemBlle

## 🚀 Deploying to Coolify

This project is a **multi-service application** using Docker Compose. Follow these steps carefully:

### Prerequisites
- Coolify instance running
- GitHub repository connected to Coolify
- Domain name (optional but recommended)

---

## Method 1: Docker Compose Deployment (Recommended)

### Step 1: In Coolify Dashboard

1. Click **"+ New"** → **"Resource"**
2. Select **"Docker Compose"** (⚠️ Important: NOT "Application")
3. Choose **"Public Repository"** or connect your GitHub account
4. Repository: `https://github.com/ihsandara/PemBlle`
5. Branch: `main`

### Step 2: Configure Docker Compose

In the Coolify resource settings:
- **Docker Compose Location**: Leave as `docker-compose.yml` (default root)
- **Base Directory**: `.` (root)

### Step 3: Set Environment Variables

In Coolify's **Environment** tab, add these variables:

```env
# Database Configuration
POSTGRES_USER=pemblle
POSTGRES_PASSWORD=CHANGE_THIS_TO_SECURE_PASSWORD
POSTGRES_DB=pemblle

# JWT Secret (generate with: openssl rand -base64 32)
JWT_SECRET=CHANGE_THIS_TO_RANDOM_SECRET

# SMTP Settings (Zoho Mail)
SMTP_HOST=smtp.zoho.com
SMTP_PORT=587
SMTP_USER=info@pemblle.link
SMTP_PASS=YOUR_ZOHO_APP_PASSWORD
SMTP_FROM=info@pemblle.link

# Frontend URL (your domain)
FRONTEND_URL=https://yourdomain.com

# CORS (optional, for production)
ALLOWED_ORIGINS=https://yourdomain.com
```

### Step 4: Port Configuration

Coolify will automatically detect port 80 from the frontend service. If you need to customize:
- Go to **Settings** → **Ports**
- Ensure port `80` is mapped and exposed

### Step 5: Deploy

1. Click **"Deploy"**
2. Monitor the build logs
3. Wait for all 3 services to start:
   - ✅ `db` (PostgreSQL)
   - ✅ `backend` (Go API)
   - ✅ `frontend` (React + Nginx)

### Step 6: Domain Configuration (Optional)

1. Go to **Domains** tab
2. Add your domain: `yourdomain.com`
3. Enable **SSL/TLS** (Let's Encrypt automatic)

---

## Method 2: Manual Docker Compose on Server

If you prefer deploying manually on your server:

### 1. SSH into your server
```bash
ssh user@your-server-ip
```

### 2. Clone the repository
```bash
git clone https://github.com/ihsandara/PemBlle.git
cd PemBlle
```

### 3. Create .env file
```bash
cp .env.example .env
nano .env  # Edit with your actual values
```

### 4. Deploy
```bash
docker-compose up -d --build
```

### 5. Check status
```bash
docker-compose ps
docker-compose logs -f
```

---

## Environment Variables Explained

| Variable | Description | Example | Required |
|----------|-------------|---------|----------|
| `POSTGRES_USER` | Database username | `pemblle` | ✅ Yes |
| `POSTGRES_PASSWORD` | Database password | `strongP@ssw0rd123` | ✅ Yes |
| `POSTGRES_DB` | Database name | `pemblle` | ✅ Yes |
| `JWT_SECRET` | Secret for JWT tokens | `random-64-char-string` | ✅ Yes |
| `SMTP_HOST` | SMTP server | `smtp.zoho.com` | For email |
| `SMTP_PORT` | SMTP port | `587` | For email |
| `SMTP_USER` | Email username | `info@pemblle.link` | For email |
| `SMTP_PASS` | Email password | `your-app-password` | For email |
| `SMTP_FROM` | From email address | `info@pemblle.link` | For email |
| `FRONTEND_URL` | Your domain | `https://pemblle.com` | ✅ Yes |
| `ALLOWED_ORIGINS` | CORS origins | `https://pemblle.com` | Production |

### Generate Secure Secrets

```bash
# Generate JWT Secret
openssl rand -base64 32

# Generate Database Password
openssl rand -base64 24
```

---

## Troubleshooting

### ❌ "Dockerfile not found" Error

**Cause**: You selected "Application" instead of "Docker Compose" in Coolify.

**Solution**: 
1. Delete the resource
2. Create a new **"Docker Compose"** resource
3. Point to your repository

### ❌ Backend not connecting to database

**Cause**: Database not ready before backend starts.

**Solution**: The `docker-compose.yml` already has health checks. Wait ~30 seconds for db to initialize.

```bash
# Check backend logs
docker-compose logs backend
```

### ❌ Email verification not working

**Cause**: SMTP variables not set or incorrect.

**Solution**: 
1. Verify SMTP credentials in Coolify environment variables
2. For Zoho, use an [App Password](https://www.zoho.com/mail/help/adminconsole/two-factor-authentication.html)
3. Check backend logs: `docker-compose logs backend | grep SMTP`

### ❌ CORS errors in browser

**Cause**: `FRONTEND_URL` not matching your actual domain.

**Solution**: Update environment variables:
```env
FRONTEND_URL=https://your-actual-domain.com
ALLOWED_ORIGINS=https://your-actual-domain.com
```

### ❌ WebSocket connection failed

**Cause**: Nginx not properly proxying WebSocket connections.

**Solution**: The `nginx.conf` already handles this. Ensure:
- You're using `wss://` (not `ws://`) in production
- Domain is properly configured with SSL

---

## Post-Deployment Checklist

- [ ] All 3 containers running (`db`, `backend`, `frontend`)
- [ ] Can access frontend at your domain
- [ ] Health check passes: `https://yourdomain.com/api/health`
- [ ] Can register a new user
- [ ] Email verification works
- [ ] Can login and access profile
- [ ] WebSocket notifications working
- [ ] Chat functionality working
- [ ] Avatars upload successfully

---

## Monitoring & Maintenance

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f db
```

### Restart Services
```bash
docker-compose restart backend
docker-compose restart frontend
```

### Update to Latest Version
```bash
git pull origin main
docker-compose up -d --build
```

### Backup Database
```bash
docker-compose exec db pg_dump -U pemblle pemblle > backup_$(date +%Y%m%d).sql
```

### Restore Database
```bash
docker-compose exec -T db psql -U pemblle pemblle < backup_20241129.sql
```

---

## Architecture

```
                                 ┌─────────────────┐
                                 │   Coolify       │
                                 │   (Reverse      │
                                 │    Proxy)       │
                                 └────────┬────────┘
                                          │
                                          │ HTTPS
                                          │
                                 ┌────────▼────────┐
                                 │   Frontend      │
                                 │   (Nginx)       │
                                 │   Port 80       │
                                 └────────┬────────┘
                                          │
                    ┌─────────────────────┼─────────────────────┐
                    │                     │                     │
                    │ /api/*          /ws/*              /uploads/*
                    │                     │                     │
                    ▼                     ▼                     ▼
           ┌────────────────┐    ┌────────────────┐    ┌────────────────┐
           │   Backend      │    │   WebSocket    │    │   Uploads      │
           │   (Go/Fiber)   │◄───┤   Manager      │    │   (Static)     │
           │   Port 8080    │    │                │    │                │
           └───────┬────────┘    └────────────────┘    └────────────────┘
                   │
                   │ PostgreSQL Protocol
                   │
           ┌───────▼────────┐
           │   PostgreSQL   │
           │   Database     │
           │   Port 5432    │
           └────────────────┘
```

---

## Additional Resources

- [Coolify Documentation](https://coolify.io/docs)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [PemBlle GitHub Repository](https://github.com/ihsandara/PemBlle)

---

## Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review logs: `docker-compose logs -f`
3. Create an issue on GitHub
4. Check [Coolify Discord](https://discord.gg/coolify)

---

Made with ❤️ by [ihsandara](https://github.com/ihsandara)
