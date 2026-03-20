# SnapLearn Docker Setup Guide

This guide explains how to containerize and run the entire SnapLearn application using Docker and Docker Compose.

## 📋 Overview

The SnapLearn application consists of three main services:

- **Backend**: FastAPI (Python 3.12) on port 8000
- **Frontend**: Next.js 14 PWA on port 3000
- **Databases**: PostgreSQL 16 (port 5432) + Redis 7 (port 6379)

## 🚀 Quick Start

### Prerequisites

- **Docker** 20.10+
- **Docker Compose** 2.0+
- **API Keys**: OpenAI and OpenRouter API keys

### Step 1: Set Up Environment Variables

```bash
# Copy the example environment file
cp .env.example .env

# Edit .env and add your API keys
nano .env
```

**Required environment variables:**
```env
OPENAI_API_KEY=sk-your-key
OPENROUTER_API_KEY=sk-or-your-key
JWT_SECRET_KEY=your-secret-key
```

### Step 2: Build and Start Containers

```bash
# Build and start all services
docker-compose up -d

# View logs (follow mode)
docker-compose logs -f

# View specific service logs
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres
docker-compose logs -f redis
```

### Step 3: Access the Application

Once containers are healthy:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs
- **Redis Commander** (optional): http://localhost:8081

### Step 4: Initialize Database

The database migrations and seeding run automatically on container startup, but you can also run manually:

```bash
# Run migrations
docker-compose exec backend alembic upgrade head

# Seed reference vocabulary
docker-compose exec backend python scripts/seed_reference_vocab.py

# Seed test data (optional)
docker-compose exec backend python scripts/seed_test_data.py
```

## 📦 Service Configuration

### PostgreSQL

```yaml
Container: snaplearn-postgres
Port: 5432
Database: snaplearn
Credentials: snaplearn / snaplearn_dev_password
```

**Health Check**: Runs `pg_isready` every 10 seconds

**Persistent Storage**: `postgres_data` volume

### Redis

```yaml
Container: snaplearn-redis
Port: 6379
Auth: snaplearn_redis_password
```

**Health Check**: Uses `INCR` command every 10 seconds

**Persistent Storage**: `redis_data` volume

### Backend (FastAPI)

```yaml
Container: snaplearn-backend
Port: 8000
Language: Python 3.12
Framework: FastAPI + Uvicorn
```

**Features**:
- Auto-reload in development
- Database migrations on startup
- Reference vocabulary seeding
- Structured logging to `/app/logs`
- File uploads to `/app/uploads`
- TTS caching to `/app/tts_cache`

**Health Check**: `GET /health` endpoint every 30 seconds

**Volumes**:
- `./app/be:/app` - Source code
- `backend_uploads:/app/uploads` - Uploaded photos
- `backend_tts_cache:/app/tts_cache` - Cached TTS audio
- `backend_logs:/app/logs` - Application logs

### Frontend (Next.js)

```yaml
Container: snaplearn-frontend
Port: 3000
Language: Node.js 20 (Alpine)
Framework: Next.js 14
```

**Features**:
- Production-optimized build
- PWA configuration
- Client-side state management

**Health Check**: HTTP request every 30 seconds

**Volumes**:
- `./app/fe:/app` - Source code
- `/app/node_modules` - Cached dependencies
- `/app/.next` - Build artifacts

## 🛠️ Common Commands

### Docker Compose Commands

```bash
# Start all services
docker-compose up -d

# Stop all services
docker-compose down

# Rebuild images and start
docker-compose up --build -d

# View service status
docker-compose ps

# Follow all logs
docker-compose logs -f

# Follow specific service logs
docker-compose logs -f backend

# Remove volumes (WARNING: deletes data)
docker-compose down -v

# Restart a specific service
docker-compose restart backend
```

### Database Commands

```bash
# Access PostgreSQL CLI
docker-compose exec postgres psql -U snaplearn -d snaplearn

# View database tables
\dt

# Exit psql
\q

# Access Redis CLI
docker-compose exec redis redis-cli -a snaplearn_redis_password

# Test Redis connection
PING

# Exit redis-cli
exit
```

### Application Commands

```bash
# Run backend shell
docker-compose exec backend bash

# Run frontend shell
docker-compose exec frontend sh

# Run tests
docker-compose exec backend pytest tests/

# Generate migrations
docker-compose exec backend alembic revision --autogenerate -m "migration name"

# View application logs
docker-compose exec backend cat logs/app.log
```

## 🔧 Development Workflow

### 1. Code Changes

The volumes are configured to sync source code:

```bash
# Backend changes (app/be/) automatically reload with uvicorn --reload
# Frontend changes (app/fe/) automatically rebuild with Next.js hot reload
```

### 2. Database Migrations

```bash
# Create migration
docker-compose exec backend alembic revision --autogenerate -m "Add new column"

# Apply migration
docker-compose exec backend alembic upgrade head

# Rollback migration
docker-compose exec backend alembic downgrade -1
```

### 3. Installing Dependencies

**Backend** (Python):
```bash
# Add new dependency to pyproject.toml, then:
docker-compose exec backend uv pip install -e .
```

**Frontend** (Node.js):
```bash
# Add new dependency to package.json, then:
docker-compose exec frontend npm install
```

## 🔐 Security Considerations

### Production Setup

Before deploying to production:

1. **Change all default secrets:**
   ```env
   JWT_SECRET_KEY=generate-strong-random-key
   REDIS_PASSWORD=use-strong-password
   DB_PASSWORD=use-strong-password
   ```

2. **Environment:**
   ```env
   ENVIRONMENT=production
   DEBUG=false
   ALLOWED_ORIGINS=https://yourdomain.com
   ```

3. **Docker Network:**
   - Use `docker network inspect snaplearn-network` to verify isolation
   - Only expose frontend (3000) and backend (8000) ports to internet
   - Keep PostgreSQL and Redis internal-only

4. **Build Images for Production:**
   ```bash
   # Multi-stage builds already optimize for production
   docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
   ```

### Volume Permissions

```bash
# Check volume ownership
docker-compose exec backend ls -la /app/uploads

# Set proper permissions (inside container)
docker-compose exec backend chmod 755 /app/uploads
```

## 📊 Monitoring & Logging

### View Application Logs

```bash
# Real-time backend logs
docker-compose logs -f backend

# Real-time frontend logs
docker-compose logs -f frontend

# Last 100 lines
docker-compose logs --tail=100 backend

# Timestamps
docker-compose logs -f --timestamps backend
```

### Database Logs

```bash
# PostgreSQL logs
docker-compose logs postgres

# Redis logs
docker-compose logs redis
```

### Health Status

```bash
# Check all service health
docker-compose ps

# Manual health check
docker-compose exec backend curl http://localhost:8000/health
docker-compose exec frontend curl http://localhost:3000
```

## 🐛 Troubleshooting

### Service Won't Start

```bash
# Check logs
docker-compose logs backend

# Rebuild without cache
docker-compose build --no-cache backend

# Restart service
docker-compose restart backend
```

### Database Connection Failed

```bash
# Verify PostgreSQL is healthy
docker-compose ps postgres

# Check database logs
docker-compose logs postgres

# Manually test connection
docker-compose exec postgres psql -U snaplearn -d snaplearn -c "SELECT 1;"
```

### Redis Connection Issues

```bash
# Test Redis connection
docker-compose exec redis redis-cli -a snaplearn_redis_password PING

# Check Redis logs
docker-compose logs redis

# Flush Redis cache (WARNING: deletes data)
docker-compose exec redis redis-cli -a snaplearn_redis_password FLUSHALL
```

### Frontend Can't Connect to Backend

```bash
# Verify network connectivity
docker-compose exec frontend curl http://backend:8000/health

# Check NEXT_PUBLIC_API_URL environment variable
docker-compose exec frontend env | grep NEXT_PUBLIC_API_URL

# Check frontend logs
docker-compose logs frontend
```

### Out of Disk Space

```bash
# Check Docker disk usage
docker system df

# Clean up unused images/volumes
docker system prune -a

# Remove specific volume
docker volume rm snaplearn_postgres_data
```

## 🚀 Advanced Configuration

### Custom Environment Overrides

Create `docker-compose.override.yml` for development:

```yaml
version: '3.8'

services:
  backend:
    environment:
      DEBUG: 'true'
      LOG_LEVEL: DEBUG
    ports:
      - "5678:5678"  # Python debugger

  frontend:
    environment:
      DEBUG: 'true'
    ports:
      - "3001:3000"  # Alternative port
```

### Production Compose File

Create `docker-compose.prod.yml`:

```yaml
version: '3.8'

services:
  backend:
    image: registry.yourdomain.com/snaplearn-backend:latest
    environment:
      ENVIRONMENT: production
      DEBUG: 'false'
    restart: always

  frontend:
    image: registry.yourdomain.com/snaplearn-frontend:latest
    environment:
      NODE_ENV: production
    restart: always
```

Use: `docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d`

### Resource Limits

Add to `docker-compose.yml` services:

```yaml
deploy:
  resources:
    limits:
      cpus: '2'
      memory: 2G
    reservations:
      cpus: '1'
      memory: 1G
```

## 📚 Related Documentation

- [Backend README](./app/be/README.md)
- [Frontend README](./app/fe/README.md)
- [AI Services README](./app/ai/README.md)
- [Architecture Plan](./docs/architecture.md)
- [Production Deployment Guide](./docs/deployment.md)

## 🤝 Contributing

When adding new services or modifying Docker setup:

1. Update `docker-compose.yml` with service definition
2. Create/update corresponding `Dockerfile`
3. Add environment variables to `.env.example`
4. Update this README with service details
5. Test with `docker-compose up -d` and `docker-compose ps`

## 📝 License

See [LICENSE](./LICENSE) file.
