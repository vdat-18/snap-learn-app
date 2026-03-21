# SnapLearn Docker & Containerization

Complete Docker setup for the SnapLearn application - a language learning platform for Vietnamese children aged 6-10.

## 📦 What's Included

This package contains everything you need to run SnapLearn with Docker:

### Docker Files
- **docker-compose.yml** - Main orchestration file with all services (PostgreSQL, Redis, FastAPI, Next.js)
- **docker-compose.prod.yml** - Production overrides with resource limits and optimizations
- **app/be/Dockerfile** - Backend FastAPI image (Python 3.12)
- **app/fe/Dockerfile** - Frontend Next.js image (Node.js 20)
- **.dockerignore** - Optimizes build context

### Configuration Files
- **.env.example** - Development environment template
- **.env.production.example** - Production environment template

### Helper Tools
- **docker-helper.sh** - Bash script for common operations
- **Makefile** - Make commands for easy access

### Documentation
- **DOCKER.md** - Comprehensive Docker setup guide
- **DEPLOYMENT.md** - Production deployment guide
- **QUICKSTART.md** - Get started in 5 minutes
- **This file** - Overview

## 🚀 Quick Start

```bash
# 1. Set up environment
cp .env.example .env
nano .env  # Add your API keys

# 2. Start services
docker-compose up -d

# 3. Access the app
open http://localhost:3000         # Frontend
open http://localhost:8000/docs    # API docs
```

**That's it!** Everything else starts automatically.

## 📋 Services Architecture

```
┌─────────────────────────────────────────────────┐
│                   Nginx (Optional)              │
│                    :80 / :443                   │
└────────────────┬────────────────────────────────┘
                 │
        ┌────────┴────────┐
        │                 │
        ▼                 ▼
    ┌────────┐        ┌────────────┐
    │Frontend│        │   Backend  │
    │(Next)  │        │  (FastAPI) │
    │ :3000  │        │   :8000    │
    └────────┘        └─────┬──────┘
                            │
                ┌───────────┴───────────┐
                │                       │
                ▼                       ▼
            ┌──────────┐            ┌─────┐
            │PostgreSQL│            │Redis│
            │ :5432    │            │:6379│
            └──────────┘            └─────┘
```

### Services

| Service | Port | Technology | Purpose |
|---------|------|-----------|---------|
| **Frontend** | 3000 | Next.js 14 | Child-facing PWA interface |
| **Backend** | 8000 | FastAPI (Python 3.12) | API, game logic, AI orchestration |
| **PostgreSQL** | 5432 | Postgres 16 | Main database |
| **Redis** | 6379 | Redis 7 | Cache, sessions, leaderboards |

## 📖 Documentation Guide

### For Getting Started
- **[QUICKSTART.md](./QUICKSTART.md)** - Start here! Get running in 5 minutes
- **[DOCKER.md](./DOCKER.md)** - Complete Docker reference guide

### For Development
- **[app/be/README.md](./app/be/README.md)** - Backend architecture & API
- **[app/fe/README.md](./app/fe/README.md)** - Frontend design system & features
- **[app/ai/README.md](./app/ai/README.md)** - AI pipeline & integration

### For Deployment
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Production setup & scaling
- **[.env.production.example](./.env.production.example)** - Production config template

## 🛠️ Command Options

### Using docker-compose directly

```bash
docker-compose up -d              # Start all services
docker-compose down               # Stop all services
docker-compose logs -f backend    # View backend logs
docker-compose ps                 # Show status
```

### Using the helper script

```bash
./docker-helper.sh up             # Start all services
./docker-helper.sh logs backend   # View logs
./docker-helper.sh shell-postgres # Access database
./docker-helper.sh health         # Check health
```

### Using Make commands

```bash
make up                  # Start all services
make logs               # View logs
make shell-postgres     # Access database
make health             # Check health
make test               # Run tests
```

## 🔐 Environment Configuration

### Development (.env)
```env
OPENAI_API_KEY=sk-your-dev-key
OPENROUTER_API_KEY=sk-or-your-key
JWT_SECRET_KEY=dev-secret-key-change-in-prod
```

### Production (.env.production)
```env
OPENAI_API_KEY=sk-your-prod-key
OPENROUTER_API_KEY=sk-or-your-prod-key
JWT_SECRET_KEY=generate-random-strong-key
ENVIRONMENT=production
DEBUG=false
```

## 🚀 Key Features

✅ **Multi-service orchestration** - All services managed together
✅ **Data persistence** - PostgreSQL and Redis volumes
✅ **Health checks** - Automatic monitoring of all services
✅ **Environment isolation** - Development, staging, production configs
✅ **Auto-reload** - Code changes reload without restart (dev mode)
✅ **Database migrations** - Automatic on startup
✅ **Logging** - Structured logs from all services
✅ **Production optimized** - Multi-stage builds, resource limits
✅ **Security** - Non-root users, minimal images, secrets management
✅ **Easy access** - Shell access to any container, database CLI access

## 📊 Volumes & Persistence

| Name | Mount Point | Purpose |
|------|-------------|---------|
| `postgres_data` | `/var/lib/postgresql/data` | Database files |
| `redis_data` | `/data` | Redis snapshots |
| `backend_uploads` | `/app/uploads` | User-uploaded photos |
| `backend_tts_cache` | `/app/tts_cache` | Text-to-speech audio cache |
| `backend_logs` | `/app/logs` | Application logs |

## 🔍 Monitoring

```bash
# Check service status
docker-compose ps

# View resource usage
docker stats

# Check service health
curl http://localhost:8000/health

# View logs
docker-compose logs -f [service]

# Database health
docker-compose exec postgres pg_isready -U snaplearn
```

## 🐛 Troubleshooting

See **[DOCKER.md - Troubleshooting](./DOCKER.md#-troubleshooting)** for:
- Service won't start
- Database connection failed
- Redis connection issues
- Frontend can't connect to backend
- Out of disk space

## 📝 Common Tasks

### Access the database

```bash
# PostgreSQL
docker-compose exec postgres psql -U snaplearn -d snaplearn

# Redis
docker-compose exec redis redis-cli -a snaplearn_redis_password
```

### Run migrations

```bash
docker-compose exec backend alembic upgrade head
```

### Seed reference vocabulary

```bash
docker-compose exec backend python scripts/seed_reference_vocab.py
```

### Run tests

```bash
docker-compose exec backend pytest tests/
```

### View application logs

```bash
docker-compose logs -f backend
docker-compose logs -f frontend
```

## 🏗️ Production Deployment

For production deployment:

1. Review **[DEPLOYMENT.md](./DEPLOYMENT.md)**
2. Configure `.env.production` with production secrets
3. Set up SSL/HTTPS with Nginx
4. Use production docker-compose: `docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d`
5. Set up automated backups
6. Configure monitoring

## 🔄 Development Workflow

1. **Code changes** are automatically reflected due to volume mounts
2. **Backend** - Uvicorn auto-reload enabled
3. **Frontend** - Next.js hot module reload enabled
4. **Database** - Run migrations with alembic
5. **Dependencies** - Update pyproject.toml or package.json, then restart

## 📚 Project Structure

```
snaplearn/
├── docker-compose.yml          # Main compose file
├── docker-compose.prod.yml     # Production overrides
├── docker-helper.sh            # Helper script
├── Makefile                    # Make commands
├── .env.example                # Dev config template
├── .env.production.example     # Prod config template
├── .dockerignore               # Build context excludes
│
├── DOCKER.md                   # Docker guide
├── DEPLOYMENT.md               # Deployment guide
├── QUICKSTART.md               # Quick start
│
├── app/
│   ├── be/                     # Backend (FastAPI)
│   │   ├── Dockerfile
│   │   ├── app/
│   │   ├── scripts/
│   │   ├── tests/
│   │   └── README.md
│   │
│   ├── fe/                     # Frontend (Next.js)
│   │   ├── Dockerfile
│   │   ├── src/
│   │   └── README.md
│   │
│   └── ai/                     # AI services (external)
│       └── README.md
│
└── _docs/                      # Additional documentation
```

## 🤝 Contributing

When updating Docker setup:

1. Update `docker-compose.yml` for all environments
2. Update Dockerfiles as needed
3. Test with `docker-compose up -d`
4. Verify with `docker-compose ps` and `docker-compose logs`
5. Update documentation
6. Commit with clear message

## 📞 Support & Issues

- **Setup issues**: Check [DOCKER.md](./DOCKER.md#-troubleshooting)
- **Deployment issues**: Check [DEPLOYMENT.md](./DEPLOYMENT.md)
- **Code issues**: See service-specific READMEs in `app/` directory
- **API questions**: See http://localhost:8000/docs (when running)

## 📜 License

See [LICENSE](./LICENSE) file for details.

---

**Ready to get started?** 👉 See [QUICKSTART.md](./QUICKSTART.md)
