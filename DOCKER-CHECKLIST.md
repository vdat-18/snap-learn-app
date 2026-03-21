# ✅ SnapLearn Docker Setup Checklist

## 📋 Pre-Setup Requirements

- [ ] Docker installed (v20.10+)
- [ ] Docker Compose installed (v2.0+)
- [ ] OpenAI API key
- [ ] OpenRouter API key (optional, fallback)
- [ ] 2+ GB RAM available
- [ ] ~5 GB disk space

**Check:** `docker --version && docker-compose --version`

## 🚀 Initial Setup (5 minutes)

### Step 1: Environment Configuration
- [ ] Copy `.env.example` to `.env`
  ```bash
  cp .env.example .env
  ```
- [ ] Edit `.env` with your API keys
  ```bash
  nano .env
  # Set: OPENAI_API_KEY and OPENROUTER_API_KEY
  ```
- [ ] Verify `.env` has required keys
  ```bash
  grep -E "OPENAI_API_KEY|OPENROUTER_API_KEY" .env
  ```

### Step 2: Start Services
- [ ] Start all containers
  ```bash
  docker-compose up -d
  ```
- [ ] Wait for all services to be healthy (30 seconds)
  ```bash
  docker-compose ps
  ```
- [ ] Verify all services show "Up" and healthy

### Step 3: Verify Installation
- [ ] Frontend accessible
  ```bash
  curl http://localhost:3000
  ```
- [ ] Backend API accessible
  ```bash
  curl http://localhost:8000/health
  ```
- [ ] Database migrations passed
  ```bash
  docker-compose logs backend | grep "alembic"
  ```

## 🔧 Development Setup

### Database
- [ ] Migrations completed
  ```bash
  docker-compose exec backend alembic current
  ```
- [ ] Reference vocabulary seeded
  ```bash
  docker-compose exec backend python scripts/seed_reference_vocab.py
  ```
- [ ] Test data seeded (optional)
  ```bash
  docker-compose exec backend python scripts/seed_test_data.py
  ```

### Code Access
- [ ] Backend shell works
  ```bash
  docker-compose exec backend bash
  exit
  ```
- [ ] Frontend shell works
  ```bash
  docker-compose exec frontend sh
  exit
  ```
- [ ] Database shell works
  ```bash
  docker-compose exec postgres psql -U snaplearn -d snaplearn -c "SELECT 1;"
  ```

### Testing
- [ ] Tests can run
  ```bash
  docker-compose exec backend pytest tests/ --collect-only
  ```
- [ ] Health check passes
  ```bash
  docker-compose exec backend curl http://localhost:8000/health | python -m json.tool
  ```

## 📚 Documentation

- [ ] Read [QUICKSTART.md](./QUICKSTART.md) (5 min)
- [ ] Read [DOCKER.md](./DOCKER.md) (20 min)
- [ ] Review [app/be/README.md](./app/be/README.md) (backend)
- [ ] Review [app/fe/README.md](./app/fe/README.md) (frontend)

## 🚀 Production Preparation

### Environment Setup
- [ ] Copy `.env.production.example` to `.env.production`
  ```bash
  cp .env.production.example .env.production
  ```
- [ ] Update `.env.production` with production secrets
- [ ] Review [DEPLOYMENT.md](./DEPLOYMENT.md)

### SSL/HTTPS (if deploying)
- [ ] SSL certificate obtained (Let's Encrypt or similar)
- [ ] Nginx configuration prepared
- [ ] ALLOWED_ORIGINS updated for your domain

### Backups
- [ ] Backup script created and tested
- [ ] Database backup automated (cron)
- [ ] Uploads directory backed up

### Monitoring
- [ ] Logging configured (syslog or centralized)
- [ ] Health checks monitored
- [ ] Error tracking set up (optional: Sentry)

## 🔐 Security Checklist

- [ ] `.env` file has restrictive permissions
  ```bash
  chmod 600 .env .env.production
  ```
- [ ] Secrets not hardcoded in code
- [ ] JWT_SECRET_KEY is strong (production)
  ```bash
  openssl rand -hex 32
  ```
- [ ] Database password is strong (production)
- [ ] Redis password is strong (production)
- [ ] ALLOWED_ORIGINS restricted to your domain
- [ ] Debug mode is false in production
- [ ] Default credentials changed

## 🧪 Testing Checklist

### Endpoints
- [ ] Frontend loads: `curl -I http://localhost:3000`
- [ ] Backend API: `curl http://localhost:8000/docs`
- [ ] Health check: `curl http://localhost:8000/health`

### Services
- [ ] All services running
  ```bash
  docker-compose ps
  ```
- [ ] All health checks pass
  ```bash
  docker-compose exec backend curl http://localhost:8000/health
  docker-compose exec postgres pg_isready -U snaplearn
  docker-compose exec redis redis-cli ping
  ```

### Database
- [ ] Tables created
  ```bash
  docker-compose exec postgres psql -U snaplearn -d snaplearn -c "\dt"
  ```
- [ ] Reference data loaded
  ```bash
  docker-compose exec postgres psql -U snaplearn -d snaplearn -c "SELECT COUNT(*) FROM reference_vocab;"
  ```

### Application
- [ ] Backend can connect to DB
  ```bash
  docker-compose logs backend | grep -i "database\|postgres"
  ```
- [ ] Backend can connect to Redis
  ```bash
  docker-compose logs backend | grep -i "redis\|cache"
  ```
- [ ] Frontend can reach backend
  ```bash
  docker-compose exec frontend curl http://backend:8000/health
  ```

## 📊 Performance Checks

- [ ] Startup time < 30 seconds
- [ ] Response time < 500ms (cache hits)
- [ ] Database queries < 1s
- [ ] Memory usage < 2GB

Check: `docker stats`

## 📝 Maintenance Tasks

### Daily
- [ ] Check logs for errors: `docker-compose logs --tail=100`
- [ ] Monitor disk usage: `docker system df`

### Weekly
- [ ] Review service health: `docker-compose ps`
- [ ] Check resource usage: `docker stats`
- [ ] Test backups: `ls -la backups/`

### Monthly
- [ ] Update base images
  ```bash
  docker-compose build --no-cache
  ```
- [ ] Review and optimize queries
- [ ] Clean up unused resources
  ```bash
  docker system prune -a
  ```

## 🚨 Emergency Procedures

### If services crash
```bash
docker-compose restart
docker-compose logs
```

### If database is corrupted
```bash
docker-compose down
docker volume rm snaplearn_postgres_data
docker-compose up -d
docker-compose exec backend python scripts/seed_reference_vocab.py
```

### If need to start fresh
```bash
docker-compose down -v
rm .env
cp .env.example .env
# Edit .env with API keys
docker-compose up -d
```

### If out of disk space
```bash
docker system prune -a
docker volume prune
```

## 📚 Quick Reference Commands

### Start/Stop
```bash
docker-compose up -d              # Start all
docker-compose down               # Stop all
docker-compose restart            # Restart all
docker-compose ps                 # Status
```

### Logs
```bash
docker-compose logs -f            # All logs (follow)
docker-compose logs -f backend    # Backend only
docker-compose logs --tail=100    # Last 100 lines
```

### Database
```bash
docker-compose exec postgres psql -U snaplearn -d snaplearn
docker-compose exec backend alembic upgrade head
docker-compose exec backend python scripts/seed_reference_vocab.py
```

### Shell Access
```bash
docker-compose exec backend bash
docker-compose exec frontend sh
docker-compose exec postgres psql -U snaplearn -d snaplearn
docker-compose exec redis redis-cli -a snaplearn_redis_password
```

### Make/Helper
```bash
make up                    # Start
make down                  # Stop
make logs                  # Show logs
make health               # Check health
./docker-helper.sh help   # Help menu
```

## ✅ Deployment Checklist

Before going to production:

- [ ] Security
  - [ ] All secrets changed
  - [ ] Debug mode disabled
  - [ ] JWT_SECRET_KEY is strong
  - [ ] SSL/HTTPS configured
  - [ ] Firewall rules set up

- [ ] Performance
  - [ ] Resource limits set
  - [ ] Database indexes verified
  - [ ] Redis caching enabled
  - [ ] Image sizes optimized

- [ ] Monitoring
  - [ ] Logging configured
  - [ ] Health checks enabled
  - [ ] Error tracking setup
  - [ ] Backup automated

- [ ] Documentation
  - [ ] Deployment procedure documented
  - [ ] Runbooks created
  - [ ] Team trained
  - [ ] Disaster recovery plan ready

## 🎯 Success Criteria

✅ All services running and healthy
✅ Frontend loads at http://localhost:3000
✅ API docs accessible at http://localhost:8000/docs
✅ Database connected and migrated
✅ API responding to requests
✅ Logs showing no errors
✅ Health checks passing
✅ Can access all shells (backend, frontend, database)
✅ Tests can run successfully

## 📞 Getting Help

If something goes wrong:

1. **Check logs**: `docker-compose logs [service]`
2. **Read docs**: [DOCKER.md](./DOCKER.md) - Troubleshooting section
3. **Review configs**: `.env` and `docker-compose.yml`
4. **Test individually**: `docker-compose exec [service] [command]`
5. **Full reset**: `docker-compose down -v` then `docker-compose up -d`

## 🎉 Completion

Once all checkboxes are checked, you have:

✅ Docker properly installed
✅ SnapLearn running locally
✅ Database and cache working
✅ Development environment ready
✅ Production configuration prepared
✅ Documentation understood
✅ Team trained

**You're ready to develop and deploy!** 🚀

---

Date Started: _______________
Date Completed: _______________
Deployed To: _______________
Team: _______________
