# SnapLearn Deployment Guide

This guide covers deploying SnapLearn to production using Docker.

## Prerequisites

- Docker 20.10+
- Docker Compose 2.0+
- Server with at least 2GB RAM, 2 CPU cores
- Domain name (for SSL/HTTPS)
- API keys for OpenAI and OpenRouter
- SSL certificate (Let's Encrypt recommended)

## Single Server Deployment

### 1. Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Create app directory
sudo mkdir -p /opt/snaplearn
cd /opt/snaplearn

# Clone repository (or copy files)
# git clone <your-repo> .
```

### 2. Environment Configuration

```bash
# Copy environment files
sudo cp .env.production.example .env.production
sudo nano .env.production  # Edit with production secrets

# Set permissions
sudo chown -R $USER:$USER /opt/snaplearn
```

### 3. SSL/HTTPS Setup (with Nginx)

Create `/opt/snaplearn/nginx.conf`:

```nginx
upstream backend {
    server backend:8000;
}

upstream frontend {
    server frontend:3000;
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

# HTTPS configuration
server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    ssl_certificate /etc/nginx/ssl/cert.pem;
    ssl_certificate_key /etc/nginx/ssl/key.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Frontend
    location / {
        proxy_pass http://frontend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Backend API
    location /api {
        proxy_pass http://backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # Increase timeout for AI calls
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Health checks
    location /health {
        proxy_pass http://backend/health;
    }
}
```

Add Nginx service to `docker-compose.prod.yml`:

```yaml
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/conf.d/default.conf:ro
      - ./ssl:/etc/nginx/ssl:ro
    depends_on:
      - backend
      - frontend
    restart: always
```

### 4. SSL Certificate with Let's Encrypt

```bash
# Using Certbot
sudo apt install certbot python3-certbot-nginx

# Get certificate
sudo certbot certonly --manual --preferred-challenges=dns -d yourdomain.com -d www.yourdomain.com

# Copy to Docker volume
sudo cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem ./ssl/cert.pem
sudo cp /etc/letsencrypt/live/yourdomain.com/privkey.pem ./ssl/key.pem
```

### 5. Database Backups

Create backup script `/opt/snaplearn/backup.sh`:

```bash
#!/bin/bash

BACKUP_DIR="/opt/snaplearn/backups"
DATE=$(date +%Y%m%d_%H%M%S)

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup PostgreSQL
docker-compose exec -T postgres pg_dump -U snaplearn snaplearn | gzip > $BACKUP_DIR/postgres_$DATE.sql.gz

# Backup Redis
docker-compose exec -T redis redis-cli --rdb $BACKUP_DIR/redis_$DATE.rdb

# Backup uploads
tar -czf $BACKUP_DIR/uploads_$DATE.tar.gz ./backend_uploads/

# Keep only last 7 days of backups
find $BACKUP_DIR -type f -mtime +7 -delete

echo "Backup completed: $DATE"
```

```bash
chmod +x backup.sh

# Schedule daily backup with cron
crontab -e
# Add: 0 2 * * * /opt/snaplearn/backup.sh
```

### 6. Monitoring and Logging

Set up centralized logging:

```bash
# Install and configure rsyslog or ELK stack
# Option 1: Simple file logging
docker-compose logs --tail=1000 > logs/$(date +%Y-%m-%d).log

# Option 2: Use syslog driver in docker-compose
# Add to each service:
# logging:
#   driver: syslog
#   options:
#     syslog-address: "udp://127.0.0.1:514"
```

### 7. Deploy with Production Config

```bash
# Stop development
docker-compose down

# Start production
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# Run migrations
docker-compose exec backend alembic upgrade head

# Verify deployment
docker-compose ps
docker-compose logs -f backend
```

## Database Management

### PostgreSQL Backups

```bash
# Manual backup
docker-compose exec postgres pg_dump -U snaplearn snaplearn > backup.sql

# Restore from backup
docker-compose exec -T postgres psql -U snaplearn snaplearn < backup.sql
```

### Redis Persistence

Redis snapshots are automatically saved. Check:

```bash
docker-compose exec redis redis-cli BGSAVE
docker-compose exec redis redis-cli LASTSAVE
```

## Scaling & Load Balancing

### Multiple Backend Instances

Update `docker-compose.yml`:

```yaml
  backend:
    # ... existing config
    deploy:
      replicas: 3

  # Or use separate services:
  backend-1:
    # ...

  backend-2:
    # ...

  backend-3:
    # ...
```

### Load Balancer Configuration

Use Nginx upstream with round-robin:

```nginx
upstream backend {
    server backend-1:8000 max_fails=3 fail_timeout=30s;
    server backend-2:8000 max_fails=3 fail_timeout=30s;
    server backend-3:8000 max_fails=3 fail_timeout=30s;
}
```

## Health Monitoring

Set up monitoring for:

```bash
# CPU and Memory usage
docker stats

# Health endpoints
curl https://yourdomain.com/health
curl https://yourdomain.com/api/health

# Service logs
docker-compose logs --tail=100 backend | grep ERROR
```

## Troubleshooting Production

### High Memory Usage

```bash
# Check memory
docker stats
docker-compose exec postgres VACUUM FULL;
docker-compose exec redis redis-cli INFO memory
```

### Slow Queries

```bash
# Enable query logging in PostgreSQL
docker-compose exec postgres psql -U snaplearn -c \
  "ALTER SYSTEM SET log_min_duration_statement = 1000;"
docker-compose restart postgres
```

### Connection Pool Issues

```yaml
# Increase connection limits
environment:
  DATABASE_URL: postgresql://...?max_overflow=20&pool_size=10
```

## Security Hardening

### Firewall

```bash
sudo ufw allow 22/tcp   # SSH
sudo ufw allow 80/tcp   # HTTP
sudo ufw allow 443/tcp  # HTTPS
sudo ufw enable
```

### Docker Security

```bash
# Run containers as non-root
# (Already configured in Dockerfiles)

# Use read-only filesystems where possible
volumes:
  - ./config:/etc/app:ro

# Limit resource usage
deploy:
  resources:
    limits:
      memory: 1G
      cpus: '1'
```

### Secret Management

Use `.env` file with proper permissions:

```bash
chmod 600 .env
chmod 600 .env.production
```

Or use Docker Secrets (Swarm mode):

```bash
docker secret create openai_key -
docker secret create jwt_secret -
```

## Upgrade Procedure

```bash
# 1. Backup data
./backup.sh

# 2. Stop services
docker-compose down

# 3. Update code
git pull origin main

# 4. Rebuild images
docker-compose build --no-cache

# 5. Start services
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# 6. Run migrations
docker-compose exec backend alembic upgrade head

# 7. Verify
docker-compose ps
docker-compose logs -f backend
```

## Monitoring with Prometheus (Optional)

Add to `docker-compose.prod.yml`:

```yaml
  prometheus:
    image: prom/prometheus:latest
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml:ro
    ports:
      - "9090:9090"
    restart: always

  grafana:
    image: grafana/grafana:latest
    ports:
      - "3001:3000"
    volumes:
      - grafana_storage:/var/lib/grafana
    environment:
      GF_SECURITY_ADMIN_PASSWORD: ${GRAFANA_PASSWORD}
    restart: always

volumes:
  grafana_storage:
```

## Related Documentation

- [DOCKER.md](./DOCKER.md) - Docker setup guide
- [Backend README](./app/be/README.md)
- [Architecture Plan](./_docs/architecture.md)
