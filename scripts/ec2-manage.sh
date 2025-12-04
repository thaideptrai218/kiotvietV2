#!/bin/bash

# EC2 Application Management Script
# Usage: ./ec2-manage.sh [restart|clean|status|logs]

APP_NAME="kiotviet"
LOG_FILE="app.log"

function status() {
    echo "🔍 Checking application status..."
    PID=$(pgrep -f "$APP_NAME.*.jar")
    if [ ! -z "$PID" ]; then
        echo "✅ Application is running with PID: $PID"
        # Optional: Check health endpoint
        if curl -s http://localhost:8080/actuator/health | grep -q 'UP'; then
            echo "✅ Health check: UP"
        else
            echo "⚠️  Health check: NOT UP (might be starting or unhealthy)"
        fi
    else
        echo "❌ Application is NOT running."
    fi
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
    PID=$(pgrep -f "$APP_NAME.*.jar")
    if [ ! -z "$PID" ]; then
        kill $PID
        echo "   Sent SIGTERM to $PID. Waiting..."
        # Wait up to 15 seconds
        for i in {1..15}; do
            if ! kill -0 $PID 2>/dev/null; then
                echo "✅ Process stopped."
                return 0
            fi
            sleep 1
        done
        
        echo "⚠️  Process didn't stop gracefully. Forcing kill..."
        kill -9 $PID 2>/dev/null || true
        echo "✅ Process killed."
    else
        echo "ℹ️  No running process found."
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
    
    # Start detached
    nohup java -Xms512m -Xmx1024m -jar "$JAR_FILE" > "$LOG_FILE" 2>&1 &
    NEW_PID=$!
    
    echo "✅ Application started with PID $NEW_PID. Logs: $LOG_FILE"
    
    # Quick health check
    echo "🏥 Waiting for startup (max 30s)..."
    for i in {1..30}; do
        if curl -s http://localhost:8080/actuator/health | grep -q 'UP'; then
            echo "✅ Application is fully UP and running!"
            return 0
        fi
        echo -n "."
        sleep 1
    done
    echo ""
    echo "⚠️  Startup timed out (30s). Check logs manually."
}

function clean_old_logs() {
    echo "🧹 Cleaning old log files..."
    # Keep only the last 5 log files if you rotate them, or just truncate
    # For this simple setup, maybe just truncate if it's huge?
    # Or finding specific pattern logs
    find . -name "*.log" -mtime +7 -delete
    echo "✅ Old logs cleaned."
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
        tail -f "$LOG_FILE"
        ;;
    *)
        echo "Usage: $0 {restart|start|stop|clean|status|logs}"
        exit 1
        ;;
esac
