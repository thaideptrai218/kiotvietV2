# Makefile for Kiotviet MVP

.PHONY: build run test clean deploy

# Default target
all: build

# Build the application
build:
	./mvnw clean package -DskipTests

# Run the application locally
run:
	./mvnw spring-boot:run

# Run tests
test:
	./mvnw test

# Clean build artifacts
clean:
	./mvnw clean

# Start database containers
db-up:
	docker compose up -d

# Stop database containers
db-down:
	docker compose down

# Run database migrations
migrate:
	./mvnw flyway:migrate

# Full local setup (db + migrate + run)
dev: db-up migrate run

# Helper to find processes
check-process:
	pgrep -f "kiotviet" || echo "No process found"
