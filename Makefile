# Makefile for Kiotviet MVP

APP_NAME := kiotviet
SCRIPT := ./scripts/ec2-manage.sh

.PHONY: all build clean run test stop start restart status logs deploy db-up db-down db-check

# Default target
all: build

# --- Build & Clean ---

# Build the application (Clean + Package)
build:
	./mvnw clean package -DskipTests

# Clean build artifacts and logs
clean:
	./mvnw clean
	$(SCRIPT) clean

# Run tests
test:
	./mvnw test

# --- Application Management ---

# Start the application (checks DB first)
start:
	$(SCRIPT) start

# Stop the application
stop:
	$(SCRIPT) stop

# Restart the application (Stop -> Start)
restart:
	$(SCRIPT) restart

# Show application status
status:
	$(SCRIPT) status

# Tail application logs
logs:
	$(SCRIPT) logs

# --- Database Management ---

# Start database containers
db-up:
	docker compose up -d

# Stop database containers
db-down:
	docker compose down

# Check database container status
db-check:
	$(SCRIPT) check_db

# Run database migrations
migrate:
	./mvnw flyway:migrate

# --- Full Workflows ---

# Full deployment: Build -> Restart
# This is the primary entry point for CI/CD
deploy: build restart

# Local development setup
dev: db-up migrate run