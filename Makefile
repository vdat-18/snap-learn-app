.PHONY: help up down restart status logs build rebuild clean shell-backend shell-frontend shell-postgres shell-redis db-migrate db-seed db-seed-test test health version

# Default target
help:
	@echo "SnapLearn Docker Commands"
	@echo ""
	@echo "Development:"
	@echo "  make up              Start all services"
	@echo "  make down            Stop all services"
	@echo "  make restart         Restart all services"
	@echo "  make status          Show service status"
	@echo "  make logs            Show logs from all services"
	@echo "  make logs-backend    Show backend logs only"
	@echo "  make logs-frontend   Show frontend logs only"
	@echo ""
	@echo "Building:"
	@echo "  make build           Build Docker images"
	@echo "  make rebuild         Rebuild images without cache"
	@echo ""
	@echo "Database:"
	@echo "  make db-migrate      Run database migrations"
	@echo "  make db-seed         Seed reference vocabulary"
	@echo "  make db-seed-test    Seed test data"
	@echo ""
	@echo "Access:"
	@echo "  make shell-backend   Open bash shell in backend"
	@echo "  make shell-frontend  Open shell in frontend"
	@echo "  make shell-postgres  Open psql shell in database"
	@echo "  make shell-redis     Open redis-cli in cache"
	@echo ""
	@echo "Testing & Monitoring:"
	@echo "  make test            Run backend tests"
	@echo "  make health          Check service health"
	@echo "  make clean           Stop services and remove volumes (WARNING: data loss)"
	@echo ""
	@echo "Or use: ./docker-helper.sh [command]"

# Service management
up:
	@echo "Starting SnapLearn services..."
	docker-compose up -d
	@sleep 2
	@docker-compose ps
	@echo ""
	@echo "✅ Services started"
	@echo "Frontend: http://localhost:3000"
	@echo "Backend: http://localhost:8000"
	@echo "API Docs: http://localhost:8000/docs"

down:
	@echo "Stopping SnapLearn services..."
	docker-compose down
	@echo "✅ Services stopped"

restart:
	@echo "Restarting SnapLearn services..."
	docker-compose restart
	@docker-compose ps

status:
	@docker-compose ps

logs:
	docker-compose logs -f

logs-backend:
	docker-compose logs -f backend

logs-frontend:
	docker-compose logs -f frontend

# Building
build:
	@echo "Building Docker images..."
	docker-compose build
	@echo "✅ Build complete"

rebuild:
	@echo "Rebuilding Docker images (no cache)..."
	docker-compose build --no-cache
	@echo "✅ Build complete"

# Database operations
db-migrate:
	@echo "Running database migrations..."
	docker-compose exec backend alembic upgrade head
	@echo "✅ Migrations completed"

db-seed:
	@echo "Seeding reference vocabulary..."
	docker-compose exec backend python scripts/seed_reference_vocab.py
	@echo "✅ Vocabulary seeded"

db-seed-test:
	@echo "Seeding test data..."
	docker-compose exec backend python scripts/seed_test_data.py
	@echo "✅ Test data seeded"

# Shell access
shell-backend:
	docker-compose exec backend bash

shell-frontend:
	docker-compose exec frontend sh

shell-postgres:
	docker-compose exec postgres psql -U snaplearn -d snaplearn

shell-redis:
	docker-compose exec redis redis-cli -a $$(grep REDIS_PASSWORD .env | cut -d= -f2)

# Testing
test:
	@echo "Running tests..."
	docker-compose exec backend pytest tests/ -v

# Monitoring
health:
	@echo "Checking service health..."
	@echo ""
	@echo "Backend:"
	@docker-compose exec backend curl -s http://localhost:8000/health | python -m json.tool || echo "❌ Backend not responding"
	@echo ""
	@echo "Frontend:"
	@docker-compose exec frontend wget -q -O - http://localhost:3000 >/dev/null && echo "✅ Frontend responding" || echo "❌ Frontend not responding"
	@echo ""
	@echo "PostgreSQL:"
	@docker-compose exec postgres pg_isready -U snaplearn && echo "✅ PostgreSQL healthy" || echo "❌ PostgreSQL not responding"
	@echo ""
	@echo "Redis:"
	@docker-compose exec redis redis-cli -a $$(grep REDIS_PASSWORD .env | cut -d= -f2) PING && echo "✅ Redis healthy" || echo "❌ Redis not responding"

# Cleanup
clean:
	@echo "⚠️  This will stop services and remove all volumes (data will be lost)"
	@read -p "Are you sure? (yes/no) " ans; \
	if [ $$ans = "yes" ]; then \
		docker-compose down -v; \
		echo "✅ Cleanup complete"; \
	else \
		echo "Cleanup cancelled"; \
	fi

# Info
version:
	@docker --version
	@docker-compose --version
