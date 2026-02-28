.PHONY: dev build test lint deploy clean db-migrate db-shell help

# Default target
help:
	@echo "Dentis Charts - Available commands:"
	@echo ""
	@echo "  make dev        - Start development server"
	@echo "  make build      - Build for production"
	@echo "  make test       - Run tests"
	@echo "  make lint       - Run ESLint"
	@echo "  make deploy     - Deploy to Cloudflare Pages"
	@echo "  make clean      - Remove build artifacts"
	@echo "  make db-migrate - Run database migrations"
	@echo "  make db-shell   - Open D1 database shell"
	@echo "  make setup      - Initial project setup"
	@echo ""

# Development
dev:
	npm run dev

# Build
build:
	npm run build

# Testing
test:
	npm run test

test-watch:
	npm run test:watch

# Linting
lint:
	npm run lint

lint-fix:
	npm run lint -- --fix

# Deployment
deploy: build
	npm run deploy

# Database
db-migrate:
	npm run db:migrate

db-shell:
	@read -p "Enter SQL command: " cmd; \
	npx wrangler d1 execute dentis-charts --command="$$cmd"

db-tables:
	npx wrangler d1 execute dentis-charts --command=".tables"

db-backup:
	npx wrangler d1 backup create dentis-charts

# Cleanup
clean:
	rm -rf dist node_modules/.cache

clean-all: clean
	rm -rf node_modules
	npm install

# Setup
setup:
	npm install
	@echo "✅ Dependencies installed"
	@echo ""
	@echo "Next steps:"
	@echo "1. Copy .dev.vars.example to .dev.vars"
	@echo "2. Update wrangler.toml with your database_id"
	@echo "3. Run 'make dev' to start development"

# Cloudflare secrets
cf-secret-jwt:
	npx wrangler secret put JWT_SECRET

# Type checking
typecheck:
	npx tsc --noEmit
