#!/bin/bash

# EC2 Application Management Script (PM2 Edition)
# Usage: ./ec2-manage.sh [restart|clean|status|logs]

APP_NAME="kiotviet"
LOG_FILE="app.log"

function status() {
    
    
    echo "🔍 Checking application status..."
    pm2 describe "$APP_NAME"
}

function check_db() {
    echo "🐘 Checking Database & Cache containers..."
    # Check if mysql and redis containers are running
    if docker compose ps | grep -q "Up"; then
        echo "✅ Docker containers are running."
    else
        echo "⚠️  Docker containers might be down. Attempting to start..."
        docker compose up -d
        echo "⏳ Waiting 10s for DB initialization..."
        sleep 10
    fi
}

function stop() {
    echo "🛑 Stopping application..."
    if pm2 list | grep -q "$APP_NAME"; then
        pm2 delete "$APP_NAME"
        echo "✅ Application stopped and removed from PM2."
    else
        echo "ℹ️  Application was not running."
    fi
}

function start() {
    # Ensure DB is up before starting app
    check_db

    echo "🚀 Starting application..."
    
    # Find the JAR file
    JAR_FILE=$(find target -name "$APP_NAME-*.jar" | head -n 1)
    
    if [ -z "$JAR_FILE" ]; then
        echo "❌ Error: JAR file not found in target/. Did you build?"
        exit 1
    fi
    
    echo "📦 Found JAR: $JAR_FILE"
    
    # Clean up existing process if it exists (to ensure new JAR/settings are picked up)
    if pm2 list | grep -q "$APP_NAME"; then
        echo "🔄 Removing existing PM2 process..."
        pm2 delete "$APP_NAME"
    fi

    # Start with PM2
    # RUNNER_TRACKING_ID="" ensures the PM2 daemon isn't killed by GitHub Actions cleanup if it's spawned here
    RUNNER_TRACKING_ID="" pm2 start java --name "$APP_NAME" --output "$LOG_FILE" --error "$LOG_FILE" -- -Xms512m -Xmx1024m -jar "$JAR_FILE"
    
    echo "✅ Application started via PM2."
    pm2 save
}

function clean_old_logs() {
    echo "🧹 Flushing PM2 logs..."
    pm2 flush
    echo "✅ Logs flushed."
}

case "$1" in
    restart)
        stop
        start
        ;;
    stop)
        stop
        ;;
    start)
        start
        ;;
    clean)
        clean_old_logs
        ;;
    check_db)
        check_db
        ;;
    status)
        status
        ;;
    logs)
        pm2 logs "$APP_NAME"
        ;;
    *)
        echo "Usage: $0 {restart|start|stop|clean|status|logs}"
        exit 1
        ;;
esac