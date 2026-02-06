# KiotvietV2 - Deployment Guide

**Version**: 1.0
**Date**: February 6, 2026
**Target**: Production Environment Deployment

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [Database Deployment](#database-deployment)
4. [Application Deployment](#application-deployment)
5. [Configuration Management](#configuration-management)
6. [Post-Deployment](#post-deployment)
7. [Monitoring & Maintenance](#monitoring--maintenance)
8. [Rollback Procedures](#rollback-procedures)

---

## Prerequisites

### Required Software

**Server Requirements**:
- Java 21 JDK
- Maven 3.9+
- Git
- SSH access to server

**Database Requirements**:
- MySQL 8.0+
- Minimum 8GB RAM
- 100GB disk space (for development)
- 500GB+ disk space (for production)

**Cache Requirements**:
- Redis 7.0+
- Minimum 2GB RAM
- 10GB disk space

### Network Requirements

**Ports**:
- 8080: HTTP (application)
- 33006: MySQL (database)
- 6379: Redis (cache)

**Firewall Rules**:
- HTTP/HTTPS (80/443): Allow inbound
- SSH (22): Allow from admin IPs
- Application port (8080): Allow from load balancer

### Security Requirements

**Certificates**:
- Valid SSL/TLS certificate (Let's Encrypt or commercial)
- Domain name pointing to server

**Authentication**:
- Strong passwords for database accounts
- Secure SSH key-based authentication
- Network security groups/firewalls

---

## Environment Setup

### Step 1: Server Preparation

**Install Java 21**:
```bash
# Update package manager
sudo apt update

# Install Java 21 JDK
sudo apt install -y openjdk-21-jdk

# Verify installation
java -version

# Install Maven
sudo apt install -y maven

# Verify Maven
mvn -version
```

**Install Git**:
```bash
sudo apt install -y git

# Configure Git
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

**Create User Accounts**:
```bash
# Create application user
sudo adduser kiotviet

# Add to sudo group
sudo usermod -aG sudo kiotviet

# Switch to kiotviet user
su - kiotviet
```

**Set Up Directory Structure**:
```bash
# Create project directory
mkdir -p ~/kiotvietV2
cd ~/kiotvietV2

# Create directories
mkdir -p logs
mkdir -p backups
mkdir -p temp
```

### Step 2: Database Setup

**Install MySQL**:
```bash
sudo apt install -y mysql-server

# Start MySQL service
sudo systemctl start mysql
sudo systemctl enable mysql

# Secure MySQL installation
sudo mysql_secure_installation
```

**Create Database**:
```bash
# Login to MySQL
sudo mysql -u root -p

# Create database
CREATE DATABASE kiotviet_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# Create user
CREATE USER 'kiotviet_user'@'localhost' IDENTIFIED BY 'StrongPassword123!';

# Grant privileges
GRANT ALL PRIVILEGES ON kiotviet_db.* TO 'kiotviet_user'@'localhost';

# Flush privileges and exit
FLUSH PRIVILEGES;
EXIT;
```

**Verify Database**:
```bash
mysql -u kiotviet_user -p kiotviet_db
```

### Step 3: Redis Setup

**Install Redis**:
```bash
sudo apt install -y redis-server

# Start Redis service
sudo systemctl start redis-server
sudo systemctl enable redis-server

# Verify Redis is running
redis-cli ping
# Expected output: PONG
```

**Configure Redis**:
```bash
# Edit Redis configuration
sudo nano /etc/redis/redis.conf

# Set max memory (adjust based on available RAM)
maxmemory 2gb
maxmemory-policy allkeys-lru

# Save configuration
sudo systemctl restart redis-server
```

### Step 4: Clone Repository

```bash
cd ~/kiotvietV2

# Clone repository (if using Git)
git clone <repository-url> .
cd kiotvietV2

# Or download release archive
wget <download-url>
tar -xzf kiotvietV2-1.0.0.tar.gz
cd kiotvietV2
```

---

## Database Deployment

### Step 1: Environment Configuration

**Create Environment File**:
```bash
# Copy sample configuration
cp src/main/resources/application.yml.example src/main/resources/application.yml

# Edit configuration
nano src/main/resources/application.yml
```

**Configure for Production**:
```yaml
spring:
  application:
    name: kiotvietV2

  # Database Configuration
  datasource:
    url: jdbc:mysql://localhost:33006/kiotviet_db?useSSL=true&requireSSL=true&serverTimezone=Asia/Ho_Chi_Minh
    username: kiotviet_user
    password: ${DB_PASSWORD}  # Use environment variable
    driver-class-name: com.mysql.cj.jdbc.Driver

  # Redis Configuration
  data:
    redis:
      host: localhost
      port: 6379
      password: ${REDIS_PASSWORD}  # Use environment variable
      database: 0
      timeout: 3000ms
      lettuce:
        pool:
          max-active: 20
          max-idle: 10
          min-idle: 5
          max-wait: -1ms

  # Flyway Configuration
  flyway:
    enabled: true
    locations: classpath:db/migration
    baseline-on-migrate: true

# Server Configuration
server:
  port: 8080
  servlet:
    context-path: /

# Logging Configuration
logging:
  level:
    root: INFO
    fa.academy.kiotviet: INFO
  pattern:
    console: "%d{yyyy-MM-dd HH:mm:ss} [%thread] %-5level %logger{36} - %msg%n"

# Application Configuration
app:
  security:
    jwt:
      secret-key: ${JWT_SECRET_KEY}
      expiration: 900000  # 15 minutes in milliseconds
      refresh-token:
        expiration: 604800000  # 7 days in milliseconds
```

### Step 2: Database Migrations

**Run Flyway Migrations**:
```bash
cd ~/kiotvietV2

# Run migrations
./mvnw flyway:migrate

# Check migration status
./mvnw flyway:info

# View migration history
./mvnw flyway:history
```

**Expected Output**:
```
Successfully applied 18 migrations to database schema.
```

**Verify Migration Success**:
```bash
mysql -u kiotviet_user -p kiotviet_db -e "SHOW TABLES;"

# Should show all tables:
# accounts
# user_auth
# user_info
# user_tokens
# categories
# products
# suppliers
# inventory
# inventory_transactions
# [and others]
```

**Take Database Backup**:
```bash
# Backup database
mysqldump -u kiotviet_user -p kiotviet_db > ~/backups/kiotviet_db_backup_$(date +%Y%m%d_%H%M%S).sql

# Verify backup
ls -lh ~/backups/
```

---

## Application Deployment

### Step 1: Build Application

**Clean and Compile**:
```bash
cd ~/kiotvietV2

# Clean previous build
./mvnw clean

# Compile code
./mvnw compile

# Run tests (recommended before deployment)
./mvnw test

# Package application
./mvnw package -DskipTests
```

**Verify Build**:
```bash
# Check for JAR file
ls -lh target/kiotvietV2-1.0.0.jar

# Should show: kiotvietV2-1.0.0.jar
```

### Step 2: Create Service Script

**Create Systemd Service**:
```bash
sudo nano /etc/systemd/system/kiotvietV2.service
```

**Service Configuration**:
```ini
[Unit]
Description=KiotvietV2 Application
After=network.target mysql.service redis.service

[Service]
Type=simple
User=kiotviet
Group=kiotviet
WorkingDirectory=/home/kiotviet/kiotvietV2
ExecStart=/home/kiotviet/kiotvietV2/mvnw spring-boot:run
ExecStop=/home/kiotviet/kiotvietV2/mvnw spring-boot:stop
Restart=on-failure
RestartSec=10

# Environment Variables
Environment="DB_PASSWORD=YourStrongPassword123!"
Environment="REDIS_PASSWORD=YourRedisPassword123!"
Environment="JWT_SECRET_KEY=YourVeryLongSecretKeyAtLeast256Bits"

# Logging
StandardOutput=journal
StandardError=journal
SyslogIdentifier=kiotvietV2

# Security
NoNewPrivileges=true
PrivateTmp=true
ProtectSystem=strict
ProtectHome=true

[Install]
WantedBy=multi-user.target
```

**Enable and Start Service**:
```bash
# Reload systemd
sudo systemctl daemon-reload

# Enable service to start on boot
sudo systemctl enable kiotvietV2.service

# Start service
sudo systemctl start kiotvietV2.service

# Check service status
sudo systemctl status kiotvietV2.service

# View logs
sudo journalctl -u kiotvietV2.service -f
```

### Step 3: Test Application

**Health Check**:
```bash
# Test health endpoint
curl http://localhost:8080/actuator/health

# Expected output: {"status":"UP"}
```

**Test API Endpoints**:
```bash
# Test registration endpoint (should return 201)
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "businessName": "Test Store",
    "email": "admin@test.com",
    "password": "TestPass123!",
    "phone": "0901234567",
    "fullName": "Admin User"
  }'

# Test login endpoint
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@test.com",
    "password": "TestPass123!"
  }'
```

**Check Application Logs**:
```bash
# View recent logs
sudo journalctl -u kiotvietV2.service -n 50

# Filter by errors
sudo journalctl -u kiotvietV2.service --grep ERROR
```

---

## Configuration Management

### Step 1: Environment Variables

**Create Environment File**:
```bash
nano ~/kiotvietV2/.env
```

**Environment Variables**:
```bash
# Database Configuration
DB_PASSWORD=YourStrongPassword123!

# Redis Configuration
REDIS_PASSWORD=YourRedisPassword123!

# JWT Configuration
JWT_SECRET_KEY=YourVeryLongSecretKeyAtLeast256BitsHere1234567890

# Application Configuration
APP_ENV=production
LOG_LEVEL=INFO
```

**Load Environment Variables**:
```bash
# Load into systemd service
sudo nano /etc/systemd/system/kiotvietV2.service

# Add to [Service] section:
EnvironmentFile=/home/kiotviet/kiotvietV2/.env

# Reload and restart service
sudo systemctl daemon-reload
sudo systemctl restart kiotvietV2.service
```

### Step 2: SSL/TLS Configuration

**Install Certbot**:
```bash
sudo apt install -y certbot python3-certbot-nginx
```

**Obtain SSL Certificate**:
```bash
# Obtain certificate for domain
sudo certbot certonly --standalone -d yourdomain.com -d www.yourdomain.com

# Certificates will be in:
# /etc/letsencrypt/live/yourdomain.com/fullchain.pem
# /etc/letsencrypt/live/yourdomain.com/privkey.pem
```

**Configure SSL in Application**:
```yaml
server:
  port: 8080
  ssl:
    enabled: true
    key-store: /etc/letsencrypt/live/yourdomain.com/keystore.p12
    key-store-password: your-password
    key-store-type: PKCS12
    key-alias: yourdomain

# Redirect HTTP to HTTPS
server:
  port: 80
  ssl:
    enabled: false
  http2:
    enabled: true
```

**Create SSL Certificate Proxy (Optional)**:
```bash
# Install nginx
sudo apt install -y nginx

# Create SSL proxy configuration
sudo nano /etc/nginx/sites-available/kiotvietV2

# Configuration:
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    location / {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# Enable site
sudo ln -s /etc/nginx/sites-available/kiotvietV2 /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### Step 3: Firewall Configuration

**Configure UFW**:
```bash
# Allow SSH
sudo ufw allow 22/tcp

# Allow HTTP
sudo ufw allow 80/tcp

# Allow HTTPS
sudo ufw allow 443/tcp

# Allow application port (if using direct access)
sudo ufw allow 8080/tcp

# Enable firewall
sudo ufw enable

# Check status
sudo ufw status
```

---

## Post-Deployment

### Step 1: Initial Data Setup

**Create Admin User**:
```bash
# Use API to create admin user
curl -X POST https://yourdomain.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "businessName": "Your Business Name",
    "email": "admin@yourdomain.com",
    "password": "StrongAdminPassword123!",
    "phone": "+84123456789",
    "fullName": "Administrator"
  }'
```

**Expected Output**:
```json
{
  "accountId": 1,
  "userId": 1,
  "message": "Account created successfully"
}
```

### Step 2: Verify Functionality

**Test All Core Features**:
```bash
# Test login
curl -X POST https://yourdomain.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@yourdomain.com",
    "password": "StrongAdminPassword123!"
  }'

# Test product search
curl https://yourdomain.com/api/products \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Check Application Health**:
```bash
# Health check
curl https://yourdomain.com/actuator/health

# Metrics
curl https://yourdomain.com/actuator/metrics
```

### Step 3: Create Backups

**Database Backup Script**:
```bash
nano ~/kiotvietV2/scripts/backup.sh
```

**Backup Script Content**:
```bash
#!/bin/bash

# Database backup
BACKUP_DIR=~/backups
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE=$BACKUP_DIR/kiotviet_db_$DATE.sql

# Create backup
mysqldump -u kiotviet_user -p kiotviet_db > $BACKUP_FILE

# Compress backup
gzip $BACKUP_FILE

# Keep only last 7 days
find $BACKUP_DIR -name "kiotviet_db_*.sql.gz" -mtime +7 -delete

echo "Backup completed: $BACKUP_FILE.gz"
```

**Make Script Executable**:
```bash
chmod +x ~/kiotvietV2/scripts/backup.sh

# Add to crontab for daily backup at 2 AM
crontab -e

# Add line:
0 2 * * * /home/kiotviet/kiotvietV2/scripts/backup.sh
```

**File Backup Script**:
```bash
nano ~/kiotvietV2/scripts/backup-files.sh
```

**Backup Script Content**:
```bash
#!/bin/bash

BACKUP_DIR=~/backups/files
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE=$BACKUP_DIR/files_$DATE.tar.gz

# Create backup
tar -czf $BACKUP_FILE ~/kiotvietV2/src/main/resources/uploads

# Keep only last 7 days
find $BACKUP_DIR -name "files_*.tar.gz" -mtime +7 -delete

echo "File backup completed: $BACKUP_FILE"
```

---

## Monitoring & Maintenance

### Step 1: Log Management

**Configure Logging**:
```yaml
logging:
  level:
    root: WARN
    fa.academy.kiotviet: INFO
  file:
    name: /home/kiotviet/kiotvietV2/logs/application.log
    max-size: 100MB
    max-history: 30
```

**View Logs**:
```bash
# View application logs
tail -f ~/kiotvietV2/logs/application.log

# View systemd logs
sudo journalctl -u kiotvietV2.service -f

# View error logs only
sudo journalctl -u kiotvietV2.service --grep ERROR -f
```

### Step 2: Health Monitoring

**Set Up Health Checks**:
```bash
# Create health check script
nano ~/kiotvietV2/scripts/health-check.sh
```

**Health Check Script**:
```bash
#!/bin/bash

# Check application status
STATUS=$(curl -s http://localhost:8080/actuator/health)
echo "Application Status: $STATUS"

# Check database connectivity
DB_STATUS=$(mysqladmin ping -h localhost -u kiotviet_user -p$(grep DB_PASSWORD ~/kiotvietV2/.env | cut -d= -f2) --silent)
echo "Database Status: $DB_STATUS"

# Check Redis connectivity
REDIS_STATUS=$(redis-cli ping)
echo "Redis Status: $REDIS_STATUS"

# Check disk space
DISK_USAGE=$(df -h /home/ | awk 'NR==2 {print $5}' | sed 's/%//')
if [ $DISK_USAGE -gt 80 ]; then
    echo "WARNING: Disk usage is ${DISK_USAGE}%"
fi

# Check memory usage
MEMORY_USAGE=$(free -m | awk 'NR==2 {print $3/$2 * 100.0}')
if [ $MEMORY_USAGE -gt 80 ]; then
    echo "WARNING: Memory usage is ${MEMORY_USAGE}%"
fi
```

**Schedule Health Checks**:
```bash
chmod +x ~/kiotvietV2/scripts/health-check.sh

# Add to crontab for every hour
crontab -e

# Add line:
0 * * * * /home/kiotviet/kiotvietV2/scripts/health-check.sh
```

### Step 3: Performance Monitoring

**Monitor Application Metrics**:
```bash
# Get JVM metrics
curl https://yourdomain.com/actuator/metrics/jvm.memory.used

# Get HTTP requests
curl https://yourdomain.com/actuator/metrics/http.server.requests

# Get database metrics
curl https://yourdomain.com/actuator/metrics/datasource

# Get cache metrics
curl https://yourdomain.com/actuator/metrics/redis
```

**Set Up Alerting (Optional)**:

Using UptimeRobot:
1. Create account at uptimerobot.com
2. Add monitor for `https://yourdomain.com/actuator/health`
3. Set check interval to 5 minutes
4. Configure email alerts

Using monit:
```bash
sudo apt install -y monit

# Configure monit
sudo nano /etc/monit/monitrc
```

**Monit Configuration**:
```ini
check process kiotvietV2 with pidfile /home/kiotviet/kiotvietV2/kiotvietV2.pid
    start program = "/home/kiotviet/kiotvietV2/scripts/start.sh"
    stop program = "/home/kiotviet/kiotvietV2/scripts/stop.sh"
    if failed host localhost port 8080 protocol http then restart
    if 5 restarts within 5 cycles then timeout
```

---

## Rollback Procedures

### Scenario 1: Application Failure

**Quick Rollback Steps**:
```bash
# 1. Stop application
sudo systemctl stop kiotvietV2.service

# 2. Restore from previous version (if using version control)
cd ~/kiotvietV2
git checkout <previous-commit-hash>

# 3. Rebuild and deploy
./mvnw clean package
sudo systemctl start kiotvietV2.service

# 4. Verify
sudo systemctl status kiotvietV2.service
curl http://localhost:8080/actuator/health
```

### Scenario 2: Database Migration Failure

**Database Rollback Steps**:
```bash
# 1. Stop application
sudo systemctl stop kiotvietV2.service

# 2. Restore database from backup
cd ~/backups
gunzip kiotviet_db_backup_YYYYMMDD_HHMMSS.sql.gz
mysql -u kiotviet_user -p kiotviet_db < kiotviet_db_backup_YYYYMMDD_HHMMSS.sql

# 3. Verify backup
mysql -u kiotviet_user -p kiotviet_db -e "SHOW TABLES;"

# 4. Start application
sudo systemctl start kiotvietV2.service
```

### Scenario 3: Configuration Error

**Configuration Rollback Steps**:
```bash
# 1. Edit environment file
nano ~/kiotvietV2/.env

# 2. Revert to previous values

# 3. Restart service
sudo systemctl restart kiotvietV2.service

# 4. Verify
sudo journalctl -u kiotvietV2.service -n 50
```

### Emergency Rollback Procedure

**Emergency Kill Command**:
```bash
# Force stop application
sudo systemctl stop kiotvietV2.service

# Kill any remaining Java processes
pkill -f kiotvietV2

# Verify nothing is running
ps aux | grep kiotvietV2
```

---

## Maintenance Tasks

### Daily Tasks

- Check application logs for errors
- Monitor application health
- Check disk space usage

### Weekly Tasks

- Review backup logs
- Check for database bloat
- Review security logs

### Monthly Tasks

- Update dependencies
- Rotate database passwords
- Review access logs
- Test disaster recovery

---

## Troubleshooting

### Common Issues

**Issue 1: Application Won't Start**
```bash
# Check service logs
sudo journalctl -u kiotvietV2.service -n 100

# Check for port conflicts
netstat -tulpn | grep 8080

# Fix: Change port or stop conflicting service
```

**Issue 2: Database Connection Failed**
```bash
# Test database connection
mysql -u kiotviet_user -p kiotviet_db

# Check MySQL is running
sudo systemctl status mysql

# Fix: Start MySQL or check credentials
```

**Issue 3: Redis Connection Failed**
```bash
# Test Redis connection
redis-cli ping

# Check Redis is running
sudo systemctl status redis-server

# Fix: Start Redis or check credentials
```

**Issue 4: SSL Certificate Issues**
```bash
# Renew certificate
sudo certbot renew

# Check certificate expiry
sudo certbot certificates

# Fix: Renew certificate or check domain DNS
```

---

## Security Checklist

### Pre-Deployment

- [ ] Database passwords are strong
- [ ] SSH key-based authentication configured
- [ ] Firewall rules are configured
- [ ] SSL/TLS certificate installed
- [ ] Security updates installed

### Post-Deployment

- [ ] Application is secured behind firewall
- [ ] HTTPS is enforced
- [ ] Security headers configured
- [ ] Database backups are tested
- [ ] Monitoring is set up

---

## Support Resources

**Documentation**:
- `/docs/` - Project documentation
- `/docs/deployment-guide.md` - This guide
- `/docs/system-architecture.md` - System architecture

**Logs**:
- Application logs: `~/kiotvietV2/logs/application.log`
- Systemd logs: `sudo journalctl -u kiotvietV2.service`

**Support Contacts**:
- Technical Lead: [email]
- DevOps Engineer: [email]

---

**Document Status**: Active
**Last Updated**: February 6, 2026
**Maintained By**: DevOps Engineer
**Next Review**: Monthly
