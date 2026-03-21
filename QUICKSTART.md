# Quick Start Guide - SnapLearn Docker Setup

Get SnapLearn running locally in 5 minutes with Docker!

## 🚀 30-Second Start

```bash
# 1. Copy environment file
cp .env.example .env

# 2. Add your API keys to .env
nano .env  # Or use your editor

# 3. Start all services
docker-compose up -d

# 4. That's it! Access the app at http://localhost:3000
```

## ✅ Verify Everything Works

```bash
# Check all services are running
docker-compose ps

# Test the endpoints
curl http://localhost:8000/health     # Backend health
open http://localhost:3000             # Frontend
open http://localhost:8000/docs        # API Documentation
```

## 📦 What's Running

| Service | URL | Purpose |
|---------|-----|---------|
| **Frontend** | http://localhost:3000 | Next.js PWA UI |
| **Backend** | http://localhost:8000 | FastAPI server |
| **API Docs** | http://localhost:8000/docs | Interactive API docs |
| **PostgreSQL** | localhost:5432 | Database (internal) |
| **Redis** | localhost:6379 | Cache (internal) |

## 🛠️ Common Tasks

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
```

### Access Database

```bash
# Open PostgreSQL shell
docker-compose exec postgres psql -U snaplearn -d snaplearn

# View tables
\dt

# Exit
\q

# Or access via Redis
docker-compose exec redis redis-cli -a snaplearn_redis_password
```

### Open a Shell

```bash
# Backend (Python)
docker-compose exec backend bash

# Frontend (Node.js)
docker-compose exec frontend sh
```

### Run Database Migrations

```bash
docker-compose exec backend alembic upgrade head
```

### Seed Reference Vocabulary

```bash
docker-compose exec backend python scripts/seed_reference_vocab.py
```

### Run Tests

```bash
docker-compose exec backend pytest tests/
```

## 🔧 Useful Commands

```bash
# Stop all services (keeps data)
docker-compose down

# Restart services
docker-compose restart

# Full cleanup (WARNING: deletes all data)
docker-compose down -v

# Rebuild images
docker-compose build --no-cache

# View container stats
docker stats

# Check health
docker-compose ps
```

## 🆘 Troubleshooting

### Services won't start?

```bash
# Check logs
docker-compose logs

# Rebuild everything
docker-compose down -v
docker-compose build --no-cache
docker-compose up -d
```

### Can't connect to backend?

```bash
# Check backend is running
docker-compose logs backend

# Test connection
curl http://localhost:8000/health

# If database error, run migrations
docker-compose exec backend alembic upgrade head
```

### Frontend not loading?

```bash
# Check frontend is running
docker-compose logs frontend

# Verify API URL in frontend
docker-compose exec frontend env | grep NEXT_PUBLIC_API_URL
```

### Port already in use?

```bash
# Change ports in .env
BACKEND_PORT=8001
FRONTEND_PORT=3001

docker-compose up -d
```

## 📚 Learn More

- **Full Docker Guide**: See [DOCKER.md](./DOCKER.md)
- **Production Setup**: See [DEPLOYMENT.md](./DEPLOYMENT.md)
- **Backend Details**: See [app/be/README.md](./app/be/README.md)
- **Frontend Details**: See [app/fe/README.md](./app/fe/README.md)

## 💡 Pro Tips

### Use the Helper Script

```bash
# All commands through helper script
./docker-helper.sh up
./docker-helper.sh logs backend
./docker-helper.sh shell-postgres
./docker-helper.sh health
```

### Or Use Makefile

```bash
# Simple make commands
make up
make logs
make shell-backend
make health
make db-seed
```

### Watch Logs While Developing

Open separate terminals:

```bash
# Terminal 1: Backend logs
docker-compose logs -f backend

# Terminal 2: Frontend logs
docker-compose logs -f frontend

# Terminal 3: Run commands
docker-compose exec backend bash
```

### Quick Database Reset

```bash
# Delete all data and reseed
docker-compose down -v
docker-compose up -d
docker-compose exec backend alembic upgrade head
docker-compose exec backend python scripts/seed_reference_vocab.py
```

## 🔑 API Keys Required

Before starting, you need:

1. **OpenAI API Key** - for vision and speech
   - Get from: https://platform.openai.com/api-keys

2. **OpenRouter API Key** - for fallback AI (optional)
   - Get from: https://openrouter.ai/keys

Add to `.env`:
```env
OPENAI_API_KEY=sk-your-key-here
OPENROUTER_API_KEY=sk-or-your-key-here
```

## 🚀 Next Steps

1. **Explore the frontend**: http://localhost:3000
2. **Check API docs**: http://localhost:8000/docs
3. **Review code**: Check `app/be/` and `app/fe/` directories
4. **Run tests**: `docker-compose exec backend pytest`
5. **Read documentation**: See DOCKER.md for advanced topics

## 📞 Support

For issues or questions:
- Check logs: `docker-compose logs`
- Review DOCKER.md for troubleshooting
- Check service documentation in app/ directories

---

**Happy coding!** 🎉
