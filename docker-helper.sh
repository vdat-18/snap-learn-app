#!/bin/bash

# SnapLearn Docker Helper Script
# Simplifies common Docker Compose operations

set -e

# Color output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="${SCRIPT_DIR}"

# Helper functions
print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if Docker is installed
check_docker() {
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker first."
        exit 1
    fi

    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi

    print_success "Docker and Docker Compose are installed"
}

# Check if .env file exists
check_env() {
    if [ ! -f "${PROJECT_ROOT}/.env" ]; then
        print_warning ".env file not found"
        print_info "Creating .env from .env.example..."
        cp "${PROJECT_ROOT}/.env.example" "${PROJECT_ROOT}/.env"
        print_warning "Please edit .env and add your API keys"
        return 1
    fi

    # Check for required API keys
    if ! grep -q "OPENAI_API_KEY=sk-" "${PROJECT_ROOT}/.env"; then
        print_warning "OPENAI_API_KEY not set in .env"
        return 1
    fi

    print_success ".env file is properly configured"
    return 0
}

# Main command handler
case "${1:-help}" in
    up)
        print_info "Starting SnapLearn services..."
        check_docker
        check_env || print_warning "Please update .env with API keys"
        cd "${PROJECT_ROOT}"
        docker-compose up -d
        print_success "Services started"
        sleep 2
        docker-compose ps
        echo ""
        print_info "Frontend: http://localhost:3000"
        print_info "Backend: http://localhost:8000"
        print_info "API Docs: http://localhost:8000/docs"
        ;;

    down)
        print_info "Stopping SnapLearn services..."
        cd "${PROJECT_ROOT}"
        docker-compose down
        print_success "Services stopped"
        ;;

    restart)
        print_info "Restarting SnapLearn services..."
        cd "${PROJECT_ROOT}"
        docker-compose restart
        print_success "Services restarted"
        docker-compose ps
        ;;

    restart-service)
        if [ -z "$2" ]; then
            print_error "Please specify a service (backend, frontend, postgres, redis)"
            exit 1
        fi
        print_info "Restarting $2 service..."
        cd "${PROJECT_ROOT}"
        docker-compose restart "$2"
        print_success "Service $2 restarted"
        ;;

    logs)
        SERVICE="${2:-all}"
        if [ "$SERVICE" = "all" ]; then
            print_info "Showing logs from all services (Ctrl+C to exit)..."
            cd "${PROJECT_ROOT}"
            docker-compose logs -f
        else
            print_info "Showing logs from $SERVICE service (Ctrl+C to exit)..."
            cd "${PROJECT_ROOT}"
            docker-compose logs -f "$SERVICE"
        fi
        ;;

    status)
        print_info "SnapLearn service status:"
        cd "${PROJECT_ROOT}"
        docker-compose ps
        ;;

    build)
        print_info "Building SnapLearn images..."
        cd "${PROJECT_ROOT}"
        docker-compose build
        print_success "Images built successfully"
        ;;

    rebuild)
        print_info "Rebuilding SnapLearn images (without cache)..."
        cd "${PROJECT_ROOT}"
        docker-compose build --no-cache
        print_success "Images rebuilt successfully"
        ;;

    clean)
        print_warning "This will stop services and remove all volumes (data will be lost)"
        read -p "Are you sure? (yes/no) " -n 3 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            print_info "Cleaning up..."
            cd "${PROJECT_ROOT}"
            docker-compose down -v
            print_success "Cleanup complete"
        else
            print_info "Cleanup cancelled"
        fi
        ;;

    shell-backend)
        print_info "Opening bash shell in backend container..."
        cd "${PROJECT_ROOT}"
        docker-compose exec backend bash
        ;;

    shell-frontend)
        print_info "Opening sh shell in frontend container..."
        cd "${PROJECT_ROOT}"
        docker-compose exec frontend sh
        ;;

    shell-postgres)
        print_info "Opening psql shell in postgres container..."
        cd "${PROJECT_ROOT}"
        docker-compose exec postgres psql -U snaplearn -d snaplearn
        ;;

    shell-redis)
        print_info "Opening redis-cli shell in redis container..."
        cd "${PROJECT_ROOT}"
        docker-compose exec redis redis-cli -a "$(grep REDIS_PASSWORD .env | cut -d= -f2)"
        ;;

    db-migrate)
        print_info "Running database migrations..."
        cd "${PROJECT_ROOT}"
        docker-compose exec backend alembic upgrade head
        print_success "Migrations completed"
        ;;

    db-seed)
        print_info "Seeding reference vocabulary..."
        cd "${PROJECT_ROOT}"
        docker-compose exec backend python scripts/seed_reference_vocab.py
        print_success "Vocabulary seeded"
        ;;

    db-seed-test)
        print_info "Seeding test data..."
        cd "${PROJECT_ROOT}"
        docker-compose exec backend python scripts/seed_test_data.py
        print_success "Test data seeded"
        ;;

    test)
        print_info "Running tests..."
        cd "${PROJECT_ROOT}"
        docker-compose exec backend pytest tests/ -v
        ;;

    health)
        print_info "Checking service health..."
        cd "${PROJECT_ROOT}"

        echo ""
        print_info "Backend health:"
        docker-compose exec backend curl -s http://localhost:8000/health | python -m json.tool || print_error "Backend not responding"

        echo ""
        print_info "Frontend health:"
        docker-compose exec frontend wget -q -O - http://localhost:3000 >/dev/null && print_success "Frontend responding" || print_error "Frontend not responding"

        echo ""
        print_info "PostgreSQL health:"
        docker-compose exec postgres pg_isready -U snaplearn && print_success "PostgreSQL healthy" || print_error "PostgreSQL not responding"

        echo ""
        print_info "Redis health:"
        docker-compose exec redis redis-cli -a "$(grep REDIS_PASSWORD .env | cut -d= -f2)" PING && print_success "Redis healthy" || print_error "Redis not responding"
        ;;

    logs-backend)
        print_info "Backend logs (last 50 lines):"
        cd "${PROJECT_ROOT}"
        docker-compose logs --tail=50 backend
        ;;

    logs-frontend)
        print_info "Frontend logs (last 50 lines):"
        cd "${PROJECT_ROOT}"
        docker-compose logs --tail=50 frontend
        ;;

    version)
        print_info "SnapLearn Docker Helper v1.0"
        print_info "Docker: $(docker --version)"
        print_info "Docker Compose: $(docker-compose --version)"
        ;;

    help|--help|-h)
        cat << 'EOF'
SnapLearn Docker Helper Script

Usage: ./docker-helper.sh [command] [options]

Commands:
  up                Start all services
  down              Stop all services
  restart           Restart all services
  restart-service   Restart specific service (backend|frontend|postgres|redis)
  status            Show service status
  logs              Show logs (specify service: backend, frontend, postgres, redis)

  build             Build Docker images
  rebuild           Rebuild Docker images without cache
  clean             Stop services and remove all volumes (WARNING: data loss)

  shell-backend     Open bash shell in backend container
  shell-frontend    Open shell in frontend container
  shell-postgres    Open psql shell in postgres container
  shell-redis       Open redis-cli shell in redis container

  db-migrate        Run database migrations
  db-seed           Seed reference vocabulary
  db-seed-test      Seed test data
  test              Run tests

  health            Check all service health
  version           Show version information
  help              Show this help message

Examples:
  ./docker-helper.sh up                    # Start all services
  ./docker-helper.sh logs backend          # View backend logs
  ./docker-helper.sh restart-service backend  # Restart backend only
  ./docker-helper.sh shell-postgres        # Access database
  ./docker-helper.sh health                # Check service health

For more information, see DOCKER.md
EOF
        ;;

    *)
        print_error "Unknown command: $1"
        echo "Run './docker-helper.sh help' for usage information"
        exit 1
        ;;
esac
